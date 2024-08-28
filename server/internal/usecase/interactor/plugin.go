package interactor

import (
	"context"

	jsonmodel "github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
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

func (i *Plugin) ImportPlugins(ctx context.Context, pluginsData []interface{}) ([]*plugin.Plugin, error) {
	var pluginsJSON = jsonmodel.ToPluginsFromJSON(pluginsData)

	importedPlugins := []*plugin.Plugin{}
	for _, pluginJSON := range pluginsJSON {
		pid, err := jsonmodel.ToPluginID(pluginJSON.ID)
		if err != nil {
			return nil, err
		}
		var extensions []*plugin.Extension
		for _, pluginJSONextension := range pluginJSON.Extensions {
			psid, err := jsonmodel.ToPropertySchemaID(pluginJSONextension.PropertySchemaID)
			if err != nil {
				return nil, err
			}
			extension, err := plugin.NewExtension().
				ID(id.PluginExtensionID(pluginJSONextension.ExtensionID)).
				Type(plugin.ExtensionType(pluginJSONextension.Type)).
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
		if err := i.pluginRepo.Save(ctx, p); err != nil {
			return nil, err
		}
		importedPlugins = append(importedPlugins, p)
	}
	return importedPlugins, nil
}
