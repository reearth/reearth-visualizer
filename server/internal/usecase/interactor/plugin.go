package interactor

import (
	"archive/zip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

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
	"github.com/reearth/reearthx/log"
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
	for _, pluginID := range pluginIDs {
		//  The exported plugin data includes only the added plugins.
		if pluginID.String() != "reearth" {
			filteredPluginIDs = append(filteredPluginIDs, pluginID)
		}
	}

	plugins, err := i.pluginRepo.FindByIDs(ctx, filteredPluginIDs)
	if err != nil {
		return nil, nil, err
	}

	schemas := make([]*property.Schema, 0)
	for _, p := range plugins {
		for _, extension := range p.Extensions() {
			extensionFileName := fmt.Sprintf("%s.js", extension.ID().String())
			zipEntryPath := fmt.Sprintf("plugins/%s/%s", p.ID().String(), extensionFileName)
			zipEntry, err := zipWriter.Create(zipEntryPath)
			if err != nil {
				return nil, nil, err
			}

			stream, err := i.file.ReadPluginFile(ctx, p.ID(), extensionFileName)
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

			schema, err := i.propertySchemaRepo.FindByID(ctx, extension.Schema())
			if err != nil {
				return nil, nil, err
			}

			schemas = append(schemas, schema)
		}
	}

	return plugins, schemas, nil
}

func (i *Plugin) ImportPlugins(ctx context.Context, pluginsZip map[string]*zip.File, oldSceneID string, sce *scene.Scene, data *[]byte) (map[string]any, error) {

	result := map[string]any{}
	if err := i.uploadPluginFile(ctx, pluginsZip, oldSceneID, sce.ID().String()); err != nil {
		return result, err
	}

	filter := Filter(sce.ID())

	var d map[string]any
	if err := json.Unmarshal(*data, &d); err != nil {
		return result, err
	}
	pluginsData, ok := d["plugins"].([]any)
	if !ok {
		return result, errors.New("plugins parse error")
	}

	schemasData, ok := d["schemas"].([]any)
	if !ok {
		return result, errors.New("schemas parse error")
	}

	var pluginsJSON = jsonmodel.ToPluginsFromJSON(pluginsData)

	var pluginIDs []id.PluginID
	var propertySchemaIDs []id.PropertySchemaID

	for pIndex, pluginJSON := range pluginsJSON {

		pid, err := jsonmodel.ToPluginID(pluginJSON.ID)
		if err != nil {
			return result, err
		}
		pluginIDs = append(pluginIDs, pid)

		var extensions []*plugin.Extension
		resultExtensions := map[string]any{}
		for eIndex, pluginJSONextension := range pluginJSON.Extensions {

			psid, err := jsonmodel.ToPropertySchemaID(pluginJSONextension.PropertySchemaID)
			if err != nil {
				return result, err
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
				log.Errorf("[Import Error] plugin extension: %s", i18n.StringFrom(pluginJSONextension.Name))
				return result, err
			}

			extensions = append(extensions, extension)
			resultSchemas := map[string]any{}
			for sIndex, schema := range schemasData {
				if schemaMap, ok := schema.(map[string]any); ok {
					if id, ok := schemaMap["id"].(string); ok {
						if id == psid.String() {
							ps, err := parsePropertySchema(psid, schemaMap)
							if err != nil {
								log.Errorf("[Import Error] plugin schema: %s", id)
								return result, err
							}
							// save PropertySchema -------------
							if err := i.propertySchemaRepo.Filtered(filter).Save(ctx, ps); err != nil {
								return result, errors.New("Save propertySchema :" + err.Error())
							}
							propertySchemaIDs = append(propertySchemaIDs, ps.ID())

							fmt.Println("[Import Schema]  ", ps.ID().String())
							resultSchemas[fmt.Sprintf("Shema%d", sIndex)] = ps.ID().String()
						}
					}
				}
			}
			fmt.Println("[Import Extension] ", pluginJSONextension.Name)
			resultExtensions[fmt.Sprintf("Extension%d", eIndex)] = pluginJSONextension.Name
			resultExtensions[fmt.Sprintf("Extension%d_schemas", eIndex)] = resultSchemas
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
			log.Errorf("[Import Error] plugin : %s", i18n.StringFrom(pluginJSON.Name))
			return result, err
		}
		if !p.ID().System() {
			// save Plugin -------------
			if err := i.pluginRepo.Filtered(filter).Save(ctx, p); err != nil {
				log.Errorf("[Import Error] plugin : %s", i18n.StringFrom(pluginJSON.Name))
				return result, errors.New("Save plugin :" + err.Error())
			}
		}

		fmt.Println("[Import Plugin] ", i18n.StringFrom(pluginJSON.Name))
		result[fmt.Sprintf("plugin%d", pIndex)] = i18n.StringFrom(pluginJSON.Name)
		result[fmt.Sprintf("plugin%d_extensions", pIndex)] = resultExtensions

	}

	return result, nil
}

func (i *Plugin) uploadPluginFile(ctx context.Context, plugins map[string]*zip.File, oldSceneID string, newSceneID string) error {

	for filePathInZip, zipFile := range plugins {

		parts := strings.Split(filePathInZip, "/")
		oldPluginId := parts[0]
		realFileName := parts[1]

		// The file paths inside the ZIP remain unchanged, so they need to be updated.
		newPluginId := strings.Replace(oldPluginId, oldSceneID, newSceneID, 1)
		pid, err := id.PluginIDFrom(newPluginId)
		if err != nil {
			return err
		}

		readCloser, err := zipFile.Open()
		if err != nil {
			return fmt.Errorf("error opening zip file entry: %w", err)
		}
		defer func() {
			if cerr := readCloser.Close(); cerr != nil {
				fmt.Printf("Error closing file: %v\n", cerr)
			}
		}()

		file := &file.File{
			Content:     readCloser,
			Path:        realFileName,
			Size:        int64(zipFile.UncompressedSize64),
			ContentType: http.DetectContentType([]byte(zipFile.Name)),
		}

		if err := i.file.UploadPluginFile(ctx, pid, file); err != nil {
			return fmt.Errorf("error uploading plugin file: %w", err)
		}

	}

	return nil
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

func parseIsAvailableIf(conditionMap map[string]any) *property.Condition {
	fid := string(conditionMap["fieldId"].(string))
	f := id.PropertyFieldIDFromRef(&fid)
	t := gqlmodel.ToPropertyValueType(conditionMap["type"].(string))
	v := property.ValueType(t).ValueFrom(conditionMap["value"])
	return &property.Condition{
		Field: *f,
		Value: v,
	}
}

func parseSchemaFieldPointer(linkableFieldsMap map[string]any) *property.SchemaFieldPointer {
	sg := linkableFieldsMap["schemaGroupId"].(string)
	f := linkableFieldsMap["fieldId"].(string)
	return &property.SchemaFieldPointer{
		SchemaGroup: id.PropertySchemaGroupID(sg),
		Field:       id.PropertyFieldID(f),
	}
}

func parsePropertySchema(psid id.PropertySchemaID, schemaMap map[string]any) (*property.Schema, error) {

	groups := schemaMap["groups"].([]any)

	// SchemaGroup -------------
	sgl := make([]*property.SchemaGroup, 0)
	for _, group := range groups {
		groupMap := group.(map[string]any)

		// SchemaField -------------
		fil := make([]*property.SchemaField, 0)
		if fields, ok := groupMap["fields"].([]any); ok {
			for _, field := range fields {
				fieldMap := field.(map[string]any)
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
		if v, ok := groupMap["isAvailableIf"].(map[string]any); ok {
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
	linkableFields := schemaMap["linkableFields"].(map[string]any)

	linkableBuilder := property.NewLinkableFields()
	if v, ok := linkableFields["LatLng"].(map[string]any); ok {
		linkableBuilder = linkableBuilder.LatLng(parseSchemaFieldPointer(v))
	}
	if v, ok := linkableFields["URL"].(map[string]any); ok {
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
