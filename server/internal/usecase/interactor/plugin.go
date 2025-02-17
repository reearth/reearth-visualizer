package interactor

import (
	"archive/zip"
	"context"
	"errors"
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
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/usecasex"
)

type Plugin struct {
	common
	sceneRepo          repo.Scene
	pluginRepo         repo.Plugin
	propertySchemaRepo repo.PropertySchema
	propertyRepo       repo.Property
	file               gateway.File
	pluginRegistry     gateway.PluginRegistry
	transaction        usecasex.Transaction
}

func NewPlugin(r *repo.Container, gr *gateway.Container) interfaces.Plugin {
	return &Plugin{
		sceneRepo:          r.Scene,
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

func (i *Plugin) ExportPlugins(ctx context.Context, sce *scene.Scene, zipWriter *zip.Writer) ([]*plugin.Plugin, []*property.Schema, error) {

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
		return nil, nil, err
	}

	schemas := make([]*property.Schema, 0)
	for _, plg := range plgs {
		for _, extension := range plg.Extensions() {
			extensionFileName := fmt.Sprintf("%s.js", extension.ID().String())
			zipEntryPath := fmt.Sprintf("plugins/%s/%s", plg.ID().String(), extensionFileName)
			zipEntry, err := zipWriter.Create(zipEntryPath)
			if err != nil {
				return nil, nil, err
			}
			// get plugin file
			stream, err := i.file.ReadPluginFile(ctx, plg.ID(), extensionFileName)
			if err != nil {
				if stream != nil {
					_ = stream.Close()
				}
				return nil, nil, err
			}

			if _, err = io.Copy(zipEntry, stream); err != nil {
				_ = stream.Close()
				return nil, nil, err
			}

			if err := stream.Close(); err != nil {
				return nil, nil, err
			}

			// get property schem
			schema, err := i.propertySchemaRepo.FindByID(ctx, extension.Schema())
			if err != nil {
				return nil, nil, err
			}
			schemas = append(schemas, schema)
		}
	}

	return plgs, schemas, nil
}

func parsePropertySchemaField(fieldMap map[string]interface{}) *property.SchemaField {

	// SchemaFieldChoice -------------
	chs := make([]property.SchemaFieldChoice, 0)
	if choices, ok := fieldMap["choices"].([]interface{}); ok {

		for _, choice := range choices {
			choiceMap := choice.(map[string]interface{})

			chBuilder := property.NewSchemaFieldChoice()
			if v, ok := choiceMap["key"].(string); ok {
				chBuilder = chBuilder.Key(v)
			}
			if v, ok := choiceMap["title"].(string); ok {
				chBuilder = chBuilder.Title(i18n.StringFrom(v))
			}
			if v, ok := choiceMap["icon"].(string); ok {
				chBuilder = chBuilder.Icon(v)
			}

			chs = append(chs, *chBuilder.MustBuild())
		}
	}
	fieldId := fieldMap["fieldId"].(string)
	fid := id.PropertyFieldIDFromRef(&fieldId)
	fiBuilder := property.NewSchemaField().ID(*fid)
	if len(chs) > 0 {
		fiBuilder = fiBuilder.Choices(chs)
	}

	if v, ok := fieldMap["type"].(string); ok {
		t := gqlmodel.ToPropertyValueType(v)
		fiBuilder = fiBuilder.Type(t)
		if dv, ok := fieldMap["defaultValue"]; ok {
			fiBuilder = fiBuilder.DefaultValue(property.ValueType(t).ValueFrom(dv))
		}
	}
	if v, ok := fieldMap["title"].(string); ok {
		fiBuilder = fiBuilder.Title(i18n.StringFrom(v))
	}
	if v, ok := fieldMap["description"].(string); ok {
		fiBuilder = fiBuilder.Description(i18n.StringFrom(v))
	}
	if v, ok := fieldMap["prefix"].(string); ok {
		fiBuilder = fiBuilder.Prefix(v)
	}
	if v, ok := fieldMap["suffix"].(string); ok {
		fiBuilder = fiBuilder.Suffix(v)
	}
	if v, ok := fieldMap["ui"].(string); ok {
		ui := gqlmodel.FromPropertySchemaFieldUI(&v)
		fiBuilder = fiBuilder.UI(*ui)
	}
	if v, ok := fieldMap["min"].(float64); ok {
		fiBuilder = fiBuilder.Min(v)
	}
	if v, ok := fieldMap["max"].(float64); ok {
		fiBuilder = fiBuilder.Max(v)
	}
	if v, ok := fieldMap["isAvailableIf"].(map[string]interface{}); ok {
		fiBuilder = fiBuilder.IsAvailableIf(parseIsAvailableIf(v))
	}
	return fiBuilder.MustBuild()
}

func parseIsAvailableIf(conditionMap map[string]interface{}) *property.Condition {
	fid := string(conditionMap["fieldId"].(string))
	f := id.PropertyFieldIDFromRef(&fid)
	t := gqlmodel.ToPropertyValueType(conditionMap["type"].(string))
	v := property.ValueType(t).ValueFrom(conditionMap["value"])
	return &property.Condition{
		Field: *f,
		Value: v,
	}
}

func parseSchemaFieldPointer(linkableFieldsMap map[string]interface{}) *property.SchemaFieldPointer {
	sg := linkableFieldsMap["schemaGroupId"].(string)
	f := linkableFieldsMap["fieldId"].(string)
	return &property.SchemaFieldPointer{
		SchemaGroup: id.PropertySchemaGroupID(sg),
		Field:       property.FieldID(f),
	}
}

func parsePropertySchema(psid id.PropertySchemaID, schemaMap map[string]interface{}) (*property.Schema, error) {

	groups := schemaMap["groups"].([]interface{})

	// SchemaGroup -------------
	sgl := make([]*property.SchemaGroup, 0)
	for _, group := range groups {
		groupMap := group.(map[string]interface{})

		// SchemaField -------------
		fil := make([]*property.SchemaField, 0)
		if fields, ok := groupMap["fields"].([]interface{}); ok {
			for _, field := range fields {
				fieldMap := field.(map[string]interface{})
				fi := parsePropertySchemaField(fieldMap)
				fil = append(fil, fi)
			}
		}

		gid := groupMap["schemaGroupId"].(string)
		psgid := id.PropertySchemaGroupIDFromRef(&gid)
		sgBuilder := property.NewSchemaGroup().ID(*psgid)

		sgBuilder = sgBuilder.Fields(fil)

		if v, ok := groupMap["isList"].(bool); ok {
			sgBuilder = sgBuilder.IsList(v)
		}
		if v, ok := groupMap["isAvailableIf"].(map[string]interface{}); ok {
			sgBuilder = sgBuilder.IsAvailableIf(parseIsAvailableIf(v))
		}
		if v, ok := groupMap["title"].(string); ok {
			sgBuilder = sgBuilder.Title(i18n.StringFrom(v))
		}
		if v, ok := groupMap["collection"].(string); ok {
			sgBuilder = sgBuilder.Collection(i18n.StringFrom(v))
		}
		if v, ok := groupMap["representativeFieldId"].(string); ok {
			rfid := id.PropertyFieldIDFromRef(&v)
			sgBuilder = sgBuilder.RepresentativeField(rfid)
		}

		sg := sgBuilder.MustBuild()
		sgl = append(sgl, sg)

	}

	// LinkableFields -------------
	linkableFields := schemaMap["linkableFields"].(map[string]interface{})

	linkableBuilder := property.NewLinkableFields()
	if v, ok := linkableFields["LatLng"].(map[string]interface{}); ok {
		linkableBuilder = linkableBuilder.LatLng(parseSchemaFieldPointer(v))
	}
	if v, ok := linkableFields["URL"].(map[string]interface{}); ok {
		linkableBuilder = linkableBuilder.URL(parseSchemaFieldPointer(v))
	}
	lf := linkableBuilder.MustBuild()

	// Schema -------------
	ps := property.NewSchema().
		ID(psid).
		Groups(property.NewSchemaGroupList(sgl)).
		LinkableFields(*lf).
		MustBuild()
	return ps, nil

}

func parseWidgetLayout(model *jsonmodel.WidgetLayout) *plugin.WidgetLayout {
	if model == nil {
		return nil
	}
	location := plugin.WidgetLocation{
		Zone:    plugin.WidgetZoneType(model.DefaultLocation.Zone),
		Section: plugin.WidgetSectionType(model.DefaultLocation.Section),
		Area:    plugin.WidgetAreaType(model.DefaultLocation.Area),
	}
	wl := plugin.NewWidgetLayout(
		model.Extendable.Horizontally,
		model.Extendable.Vertically,
		model.Extended,
		model.Floating,
		&location,
	)
	return &wl
}

func (i *Plugin) ImportPlugins(ctx context.Context, sce *scene.Scene, pluginsData []interface{}, schemasData []interface{}) ([]*plugin.Plugin, property.SchemaList, error) {
	var pluginsJSON = jsonmodel.ToPluginsFromJSON(pluginsData)

	readableFilter := repo.SceneFilter{Readable: scene.IDList{sce.ID()}}
	writableFilter := repo.SceneFilter{Writable: scene.IDList{sce.ID()}}

	var propertySchemaIDs []id.PropertySchemaID
	var pluginIDs []id.PluginID
	for _, pluginJSON := range pluginsJSON {
		pid, err := jsonmodel.ToPluginID(pluginJSON.ID)
		if err != nil {
			return nil, nil, err
		}
		pluginIDs = append(pluginIDs, pid)

		var extensions []*plugin.Extension
		for _, pluginJSONextension := range pluginJSON.Extensions {
			psid, err := jsonmodel.ToPropertySchemaID(pluginJSONextension.PropertySchemaID)
			if err != nil {
				return nil, nil, err
			}
			extension, err := plugin.NewExtension().
				ID(id.PluginExtensionID(pluginJSONextension.ExtensionID)).
				Type(gqlmodel.FromPluginExtension(pluginJSONextension.Type)).
				Name(i18n.StringFrom(pluginJSONextension.Name)).
				Description(i18n.StringFrom(pluginJSONextension.Description)).
				Icon(pluginJSONextension.Icon).
				SingleOnly(*pluginJSONextension.SingleOnly).
				WidgetLayout(parseWidgetLayout(pluginJSONextension.WidgetLayout)).
				Schema(psid).
				Build()
			if err != nil {
				return nil, nil, err
			}
			extensions = append(extensions, extension)

			// Save propertySchema
			for _, schema := range schemasData {
				schemaMap, _ := schema.(map[string]interface{})
				if schemaMap["id"].(string) == psid.String() {
					ps, err := parsePropertySchema(psid, schemaMap)
					if err != nil {
						return nil, nil, err
					}
					if err := i.propertySchemaRepo.Filtered(writableFilter).Save(ctx, ps); err != nil {
						return nil, nil, errors.New("Save propertySchema :" + err.Error())
					}
					propertySchemaIDs = append(propertySchemaIDs, ps.ID())
				}
			}
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
			return nil, nil, err
		}
		if !p.ID().System() {
			// Save plugin
			if err := i.pluginRepo.Filtered(writableFilter).Save(ctx, p); err != nil {
				return nil, nil, errors.New("Save plugin :" + err.Error())
			}
		}
	}

	plgs, err := i.pluginRepo.Filtered(readableFilter).FindByIDs(ctx, pluginIDs)
	if err != nil {
		return nil, nil, err
	}
	pss, err := i.propertySchemaRepo.Filtered(readableFilter).FindByIDs(ctx, propertySchemaIDs)
	if err != nil {
		return nil, nil, err
	}

	return plgs, pss, nil
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
