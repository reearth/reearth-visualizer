package interactor

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	jsonmodel "github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/usecasex"
)

type Plugin struct {
	common
	sceneRepo          repo.Scene
	pluginRepo         repo.Plugin
	propertySchemaRepo repo.PropertySchema
	propertyRepo       repo.Property
	layerRepo          repo.Layer
	file               gateway.File
	pluginRegistry     gateway.PluginRegistry
	transaction        usecasex.Transaction
}

func NewPlugin(r *repo.Container, gr *gateway.Container) interfaces.Plugin {
	return &Plugin{
		sceneRepo:          r.Scene,
		layerRepo:          r.Layer,
		pluginRepo:         r.Plugin,
		propertySchemaRepo: r.PropertySchema,
		propertyRepo:       r.Property,
		transaction:        r.Transaction,
		file:               gr.File,
		pluginRegistry:     gr.PluginRegistry,
	}
}

func (i *Plugin) pluginCommon() *pluginCommon {
	return &pluginCommon{
		pluginRepo:         i.pluginRepo,
		propertySchemaRepo: i.propertySchemaRepo,
		file:               i.file,
		pluginRegistry:     i.pluginRegistry,
	}
}

func (i *Plugin) Fetch(ctx context.Context, ids []id.PluginID, operator *usecase.Operator) ([]*plugin.Plugin, error) {
	return i.pluginRepo.FindByIDs(ctx, ids)
}

func (i *Plugin) ExportPlugins(ctx context.Context, sce *scene.Scene, zipWriter *zip.Writer) ([]*plugin.Plugin, error) {

	pluginIDs := sce.PluginIds()
	var filteredPluginIDs []id.PluginID
	for _, pid := range pluginIDs {
		// exclude official plugin
		if pid.String() != "reearth" {
			filteredPluginIDs = append(filteredPluginIDs, pid)
		}
	}

	plgs, err := i.pluginRepo.FindByIDs(ctx, filteredPluginIDs)
	if err != nil {
		return nil, err
	}

	for _, plg := range plgs {
		for _, extension := range plg.Extensions() {
			extensionFileName := fmt.Sprintf("%s.js", extension.ID().String())
			zipEntryPath := fmt.Sprintf("plugins/%s/%s", plg.ID().String(), extensionFileName)
			zipEntry, err := zipWriter.Create(zipEntryPath)
			if err != nil {
				return nil, err
			}
			stream, err := i.file.ReadPluginFile(ctx, plg.ID(), extensionFileName)
			if err != nil {
				if stream != nil {
					_ = stream.Close()
				}
				return nil, err
			}

			_, err = io.Copy(zipEntry, stream)
			if err != nil {
				_ = stream.Close()
				return nil, err
			}

			if err := stream.Close(); err != nil {
				return nil, err
			}
		}
	}

	return plgs, nil
}

func (i *Plugin) ImportPlugins(ctx context.Context, pluginsData []interface{}) ([]*plugin.Plugin, error) {
	var pluginsJSON = jsonmodel.ToPluginsFromJSON(pluginsData)

	var pluginIDs []id.PluginID
	for _, pluginJSON := range pluginsJSON {
		pid, err := jsonmodel.ToPluginID(pluginJSON.ID)
		if err != nil {
			return nil, err
		}
		pluginIDs = append(pluginIDs, pid)

		var extensions []*plugin.Extension
		for _, pluginJSONextension := range pluginJSON.Extensions {
			psid, err := jsonmodel.ToPropertySchemaID(pluginJSONextension.PropertySchemaID)
			if err != nil {
				return nil, err
			}
			extension, err := plugin.NewExtension().
				ID(id.PluginExtensionID(pluginJSONextension.ExtensionID)).
				Type(gqlmodel.FromPluginExtension(pluginJSONextension.Type)).
				Name(i18n.StringFrom(pluginJSONextension.Name)).
				Description(i18n.StringFrom(pluginJSONextension.Description)).
				Icon(pluginJSONextension.Icon).
				SingleOnly(*pluginJSONextension.SingleOnly).
				Schema(psid).
				Build()
			if err != nil {
				return nil, err
			}
			extensions = append(extensions, extension)
		}
		p, err := plugin.New().
			ID(pid).
			Name(i18n.StringFrom(pluginJSON.Name)).
			Description(i18n.StringFrom(pluginJSON.Description)).
			Author(pluginJSON.Author).
			RepositoryURL(pluginJSON.RepositoryURL).
			Extensions(extensions).
			Build()
		if err != nil {
			return nil, err
		}
		if !p.ID().System() {
			if err := i.pluginRepo.Save(ctx, p); err != nil {
				return nil, err
			}
		}
	}
	plgs, err := i.pluginRepo.FindByIDs(ctx, pluginIDs)
	if err != nil {
		return nil, err
	}

	return plgs, nil
}

func (i *Plugin) ImporPluginFile(ctx context.Context, pid id.PluginID, name string, zipFile *zip.File) error {

	readCloser, err := zipFile.Open()
	if err != nil {
		return fmt.Errorf("error opening zip file entry: %w", err)
	}
	defer func() {
		if cerr := readCloser.Close(); cerr != nil {
			fmt.Printf("Error closing file: %v\n", cerr)
		}
	}()

	contentType := http.DetectContentType([]byte(zipFile.Name))

	file := &file.File{
		Content:     readCloser,
		Path:        name,
		Size:        int64(zipFile.UncompressedSize64),
		ContentType: contentType,
	}

	if err := i.file.UploadPluginFile(ctx, pid, file); err != nil {
		return fmt.Errorf("error uploading plugin file: %w", err)
	}

	return nil
}
