package interactor

import (
	"context"
	"encoding/csv"
	"errors"
	"io"
	"strings"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/layer/layerops"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/sceneops"
)

var extensionForLinkedLayers = id.PluginExtensionID("marker")

type Dataset struct {
	common
	commonSceneLock
	sceneRepo         repo.Scene
	workspaceRepo     repo.Workspace
	datasetRepo       repo.Dataset
	datasetSchemaRepo repo.DatasetSchema
	propertyRepo      repo.Property
	layerRepo         repo.Layer
	pluginRepo        repo.Plugin
	policyRepo        repo.Policy
	datasource        gateway.DataSource
	file              gateway.File
	google            gateway.Google
	transaction       usecasex.Transaction
}

func NewDataset(r *repo.Container, gr *gateway.Container) interfaces.Dataset {
	return &Dataset{
		commonSceneLock:   commonSceneLock{sceneLockRepo: r.SceneLock},
		sceneRepo:         r.Scene,
		workspaceRepo:     r.Workspace,
		datasetRepo:       r.Dataset,
		datasetSchemaRepo: r.DatasetSchema,
		propertyRepo:      r.Property,
		layerRepo:         r.Layer,
		pluginRepo:        r.Plugin,
		transaction:       r.Transaction,
		policyRepo:        r.Policy,
		datasource:        gr.DataSource,
		file:              gr.File,
		google:            gr.Google,
	}
}

func (i *Dataset) DynamicSchemaFields() []*dataset.SchemaField {
	author, _ := dataset.NewSchemaField().NewID().Name("author").Type(dataset.ValueTypeString).Build()
	content, _ := dataset.NewSchemaField().NewID().Name("content").Type(dataset.ValueTypeString).Build()
	location, _ := dataset.NewSchemaField().NewID().Name("location").Type(dataset.ValueTypeLatLng).Build()
	target, _ := dataset.NewSchemaField().NewID().Name("target").Type(dataset.ValueTypeString).Build()
	return []*dataset.SchemaField{author, content, location, target}
}

func (i *Dataset) UpdateDatasetSchema(ctx context.Context, inp interfaces.UpdateDatasetSchemaParam, _ *usecase.Operator) (_ *dataset.Schema, err error) {
	schema, err := i.datasetSchemaRepo.FindByID(ctx, inp.SchemaId)
	if err != nil {
		return nil, err
	}

	// Begin Db transaction
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	schema.Rename(inp.Name)
	err = i.datasetSchemaRepo.Save(ctx, schema)
	if err != nil {
		return nil, err
	}

	// Commit db transaction
	tx.Commit()
	return schema, nil
}

func (i *Dataset) AddDynamicDatasetSchema(_ context.Context, _ interfaces.AddDynamicDatasetSchemaParam) (_ *dataset.Schema, err error) {
	return nil, errors.New("not supported")
}

func (i *Dataset) AddDynamicDataset(_ context.Context, _ interfaces.AddDynamicDatasetParam) (_ *dataset.Schema, _ *dataset.Dataset, err error) {
	return nil, nil, errors.New("not supported")
}

func (i *Dataset) ImportDataset(ctx context.Context, inp interfaces.ImportDatasetParam, operator *usecase.Operator) (_ *dataset.Schema, err error) {
	if err := i.CanWriteScene(inp.SceneId, operator); err != nil {
		return nil, err
	}
	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}

	separator := ','
	if strings.HasSuffix(inp.File.Path, ".tsv") {
		separator = '\t'
	}

	return i.importDataset(ctx, inp.File.Content, inp.File.Path, separator, inp.SceneId, inp.SchemaId, operator)
}

func (i *Dataset) ImportDatasetFromGoogleSheet(ctx context.Context, inp interfaces.ImportDatasetFromGoogleSheetParam, operator *usecase.Operator) (_ *dataset.Schema, err error) {
	if err := i.CanWriteScene(inp.SceneId, operator); err != nil {
		return nil, err
	}

	csvFile, err := i.google.FetchCSV(inp.Token, inp.FileID, inp.SheetName)
	if err != nil {
		return nil, err
	}

	defer func() {
		err = (*csvFile).Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	return i.importDataset(ctx, *csvFile, inp.SheetName, ',', inp.SceneId, inp.SchemaId, operator)
}

func (i *Dataset) importDataset(ctx context.Context, content io.Reader, name string, separator rune, sceneId id.SceneID, schemaId *id.DatasetSchemaID, o *usecase.Operator) (_ *dataset.Schema, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err := i.sceneRepo.FindByID(ctx, sceneId)
	if err != nil {
		return nil, err
	}
	ws, err := i.workspaceRepo.FindByID(ctx, s.Workspace())
	if err != nil {
		return nil, err
	}
	dsc, err := i.datasetSchemaRepo.CountByScene(ctx, sceneId)
	if err != nil {
		return nil, err
	}

	var policy *workspace.Policy
	if policyID := o.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return nil, err
		}
		policy = p
	}

	// enforce policy
	if err := policy.EnforceDatasetSchemaCount(dsc + 1); err != nil {
		return nil, err
	}

	csvParser := dataset.NewCSVParser(content, name, separator)
	err = csvParser.Init()
	if err != nil {
		return nil, err
	}

	// replacement mode
	if schemaId != nil {
		dss, err := i.datasetSchemaRepo.FindByID(ctx, *schemaId)
		if err != nil {
			return nil, err
		}
		err = csvParser.CheckCompatible(dss)
		if err != nil {
			return nil, err
		}
		toReplace, err := i.datasetRepo.FindBySchemaAll(ctx, *schemaId)
		if err != nil {
			return nil, err
		}
		err = i.datasetRepo.RemoveAll(ctx, toReplace.ToDatasetIds())
		if err != nil {
			return nil, err
		}
	} else {
		err = csvParser.GuessSchema(sceneId)
		if err != nil {
			return nil, err
		}
	}

	schema, datasets, err := csvParser.ReadAll()
	if err != nil {
		return nil, err
	}

	// enforce policy
	if err := policy.EnforceDatasetCount(len(datasets)); err != nil {
		return nil, err
	}

	if err := i.datasetSchemaRepo.Save(ctx, schema); err != nil {
		return nil, err
	}

	if err := i.datasetRepo.SaveAll(ctx, datasets); err != nil {
		return nil, err
	}

	if schemaId != nil {
		layerGroups, err := i.layerRepo.FindGroupBySceneAndLinkedDatasetSchema(ctx, sceneId, *schemaId)
		if err != nil {
			return nil, err
		}

		newProperties := make([]*property.Property, 0, len(datasets))
		representativeFieldID := schema.RepresentativeFieldID()
		removedProperties := []id.PropertyID{}
		removedLayers := []id.LayerID{}
		updatedLayers := append(layer.List{}, layerGroups.ToLayerList()...)

		for _, lg := range layerGroups {
			if lg.Layers().LayerCount() > 0 {
				children, err := i.layerRepo.FindByIDs(ctx, lg.Layers().Layers())
				if err != nil {
					return nil, err
				}
				for _, c := range children {
					if c != nil {
						removedProperties = append(removedProperties, (*c).Properties()...)
					}
				}
				removedLayers = append(removedLayers, lg.Layers().Layers()...)
				lg.Layers().Empty()
			}

			for _, ds := range datasets {
				dsId := ds.ID()
				name := ""
				if rf := ds.FieldRef(representativeFieldID); rf != nil && rf.Type() == dataset.ValueTypeString {
					name = rf.Value().Value().(string)
				}
				layerItem, layerProperty, err := layerops.LayerItem{
					SceneID:         sceneId,
					ParentLayerID:   lg.ID(),
					Plugin:          builtin.Plugin(),
					ExtensionID:     &extensionForLinkedLayers,
					LinkedDatasetID: &dsId,
					Name:            name,
				}.Initialize()
				if err != nil {
					return nil, err
				}
				if layerItem != nil {
					lg.Layers().AddLayer(layerItem.ID(), -1)
					updatedLayers = append(updatedLayers, layerItem.LayerRef())
				}
				if layerProperty != nil {
					newProperties = append(newProperties, layerProperty)
				}
			}
		}

		err = i.layerRepo.RemoveAll(ctx, removedLayers)
		if err != nil {
			return nil, err
		}
		err = i.propertyRepo.RemoveAll(ctx, removedProperties)
		if err != nil {
			return nil, err
		}
		err = i.layerRepo.SaveAll(ctx, updatedLayers)
		if err != nil {
			return nil, err
		}
		err = i.propertyRepo.SaveAll(ctx, newProperties)
		if err != nil {
			return nil, err
		}
	}

	// Commit db transaction
	tx.Commit()
	return schema, nil
}

func (i *Dataset) Fetch(ctx context.Context, ids []id.DatasetID, _ *usecase.Operator) (dataset.List, error) {
	return i.datasetRepo.FindByIDs(ctx, ids)
}

func (i *Dataset) Export(ctx context.Context, id id.DatasetSchemaID, format string, _ *usecase.Operator) (io.Reader, string, error) {

	s, err := i.datasetSchemaRepo.FindByID(ctx, id)
	if err != nil {
		return nil, "", err
	}

	ds, err := i.datasetRepo.FindBySchemaAll(ctx, id)
	if err != nil {
		return nil, "", err
	}

	var r io.Reader
	switch format {
	case "csv":
		r = i.csvExport(s, ds)
	default:
		r = i.csvExport(s, ds)
	}

	return r, s.Name(), nil
}

func (i *Dataset) csvExport(s *dataset.Schema, ds dataset.List) io.Reader {
	r, w := io.Pipe()
	csvW := csv.NewWriter(w)

	go func() {
		var err error

		defer func() {
			_ = w.CloseWithError(err)
		}()

		// write csv headers
		err = csvW.Write(lo.Map(s.Fields(), func(f *dataset.SchemaField, _ int) string {
			return f.Name()
		}))
		if err != nil {
			return
		}

		// write values
		for _, values := range ds {
			err = csvW.Write(lo.Map(s.Fields(), func(f *dataset.SchemaField, _ int) string {
				fv := values.Field(f.ID())
				if fv == nil || fv.Value() == nil {
					return "#ERROR#"
				}
				return fv.Value().String()
			}))
			if err != nil {
				return
			}
		}
		csvW.Flush()
	}()
	return r
}

func (i *Dataset) GraphFetch(ctx context.Context, id id.DatasetID, depth int, _ *usecase.Operator) (dataset.List, error) {
	if depth < 0 || depth > 3 {
		return nil, interfaces.ErrDatasetInvalidDepth
	}
	it := dataset.GraphIteratorFrom(id, depth)
	res := dataset.List{}
	next := id
	done := false
	for {
		d, err := i.datasetRepo.FindByID(ctx, next)
		if err != nil {
			return nil, err
		}
		res = append(res, d)
		next, done = it.Next(d)
		if next.IsNil() {
			return nil, rerror.ErrInternalBy(errors.New("next id is nil"))
		}
		if done {
			break
		}
	}
	return res, nil
}

func (i *Dataset) FetchSchema(ctx context.Context, ids []id.DatasetSchemaID, _ *usecase.Operator) (dataset.SchemaList, error) {
	return i.datasetSchemaRepo.FindByIDs(ctx, ids)
}

func (i *Dataset) GraphFetchSchema(ctx context.Context, id id.DatasetSchemaID, depth int, _ *usecase.Operator) (dataset.SchemaList, error) {
	if depth < 0 || depth > 3 {
		return nil, interfaces.ErrDatasetInvalidDepth
	}

	it := dataset.SchemaGraphIteratorFrom(id, depth)
	res := dataset.SchemaList{}
	next := id
	done := false
	for {
		d, err := i.datasetSchemaRepo.FindByID(ctx, next)
		if err != nil {
			return nil, err
		}
		res = append(res, d)
		next, done = it.Next(d)
		if next.IsNil() {
			return nil, rerror.ErrInternalBy(errors.New("next id is nil"))
		}
		if done {
			break
		}
	}

	return res, nil
}

func (i *Dataset) FindBySchema(ctx context.Context, ds id.DatasetSchemaID, p *usecasex.Pagination, _ *usecase.Operator) (dataset.List, *usecasex.PageInfo, error) {
	return i.datasetRepo.FindBySchema(ctx, ds, p)
}

func (i *Dataset) CountBySchema(ctx context.Context, id id.DatasetSchemaID) (int, error) {
	return i.datasetRepo.CountBySchema(ctx, id)
}

func (i *Dataset) FindSchemaByScene(ctx context.Context, sid id.SceneID, p *usecasex.Pagination, operator *usecase.Operator) (dataset.SchemaList, *usecasex.PageInfo, error) {
	if err := i.CanReadScene(sid, operator); err != nil {
		return nil, nil, err
	}

	return i.datasetSchemaRepo.FindByScene(ctx, sid, p)
}

func (i *Dataset) FindDynamicSchemaByScene(ctx context.Context, sid id.SceneID) (dataset.SchemaList, error) {
	return i.datasetSchemaRepo.FindAllDynamicByScene(ctx, sid)
}

func (i *Dataset) Sync(ctx context.Context, sceneID id.SceneID, url string, operator *usecase.Operator) (dss dataset.SchemaList, ds dataset.List, err error) {
	if err := i.CanWriteScene(sceneID, operator); err != nil {
		return nil, nil, err
	}

	if i.datasource == nil {
		return nil, nil, interfaces.ErrNoDataSourceAvailable
	}

	// Check URL
	if !i.datasource.IsURLValid(ctx, url) {
		return nil, nil, interfaces.ErrDataSourceInvalidURL
	}

	// Begin Db transaction
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.UpdateSceneLock(ctx, sceneID, scene.LockModeFree, scene.LockModeDatasetSyncing); err != nil {
		return nil, nil, err
	}

	defer i.ReleaseSceneLock(ctx, sceneID)

	// Fetch
	dss, ds, err = i.datasource.Fetch(ctx, url, sceneID)
	if err != nil {
		return nil, nil, err
	}

	// Save
	if err := i.datasetSchemaRepo.SaveAll(ctx, dss); err != nil {
		return nil, nil, err
	}
	if err := i.datasetRepo.SaveAll(ctx, ds); err != nil {
		return nil, nil, err
	}

	// Migrate
	result, err := sceneops.DatasetMigrator{
		PropertyRepo:      i.propertyRepo,
		LayerRepo:         i.layerRepo,
		DatasetSchemaRepo: i.datasetSchemaRepo,
		DatasetRepo:       i.datasetRepo,
		Plugin:            repo.PluginLoaderFrom(i.pluginRepo),
	}.Migrate(ctx, sceneID, dss, ds)
	if err != nil {
		return nil, nil, err
	}

	if err := i.propertyRepo.SaveAll(ctx, result.Properties.List()); err != nil {
		return nil, nil, err
	}
	if err := i.layerRepo.SaveAll(ctx, result.Layers.List()); err != nil {
		return nil, nil, err
	}
	if err := i.layerRepo.RemoveAll(ctx, result.RemovedLayers.List()); err != nil {
		return nil, nil, err
	}
	if err := i.datasetRepo.RemoveAll(ctx, result.RemovedDatasets); err != nil {
		return nil, nil, err
	}
	if err := i.datasetSchemaRepo.RemoveAll(ctx, result.RemovedDatasetSchemas); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return dss, ds, nil
}

func (i *Dataset) AddDatasetSchema(ctx context.Context, inp interfaces.AddDatasetSchemaParam, operator *usecase.Operator) (ds *dataset.Schema, err error) {
	if err := i.CanWriteScene(inp.SceneId, operator); err != nil {
		return nil, err
	}

	// Begin Db transaction
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	schemaBuilder := dataset.NewSchema().
		NewID().
		Scene(inp.SceneId).
		Name(inp.Name).
		Source("reearth").
		RepresentativeField(*inp.RepresentativeField)
	ds, err = schemaBuilder.Build()
	if err != nil {
		return nil, err
	}
	err = i.datasetSchemaRepo.Save(ctx, ds)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return ds, nil
}

func (i *Dataset) RemoveDatasetSchema(ctx context.Context, inp interfaces.RemoveDatasetSchemaParam, operator *usecase.Operator) (_ id.DatasetSchemaID, err error) {
	s, err := i.datasetSchemaRepo.FindByID(ctx, inp.SchemaID)
	if err != nil {
		return inp.SchemaID, err
	}
	if s == nil {
		return inp.SchemaID, rerror.ErrNotFound
	}
	if err := i.CanWriteScene(s.Scene(), operator); err != nil {
		return inp.SchemaID, err
	}

	datasets, err := i.datasetRepo.FindBySchemaAll(ctx, inp.SchemaID)
	if err != nil {
		return inp.SchemaID, err
	}
	if (inp.Force == nil || !*inp.Force) && len(datasets) != 0 {
		return inp.SchemaID, errors.New("can not remove non-empty schema")
	}

	// Begin Db transaction
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	// list of datasets attached by the schema
	dsIds := []id.DatasetID{}
	var properties []*property.Property
	for _, d := range datasets {
		properties, err = i.propertyRepo.FindByDataset(ctx, inp.SchemaID, d.ID())
		if err != nil {
			return inp.SchemaID, err
		}

		for _, p := range properties {
			// unlinking fields
			p.UnlinkAllByDataset(inp.SchemaID, d.ID())
		}

		dsIds = append(dsIds, d.ID())
	}

	// unlink layers (items and groups) and save
	layers, err := i.layerRepo.FindAllByDatasetSchema(ctx, inp.SchemaID)
	if err != nil {
		return inp.SchemaID, err
	}

	for _, li := range layers.ToLayerItemList() {
		li.Unlink()
	}

	for _, lg := range layers.ToLayerGroupList() {
		lg.Unlink()

		groupItems, err := i.layerRepo.FindItemByIDs(ctx, lg.Layers().Layers())
		if err != nil {
			return inp.SchemaID, err
		}

		// unlink layers group items
		for _, item := range groupItems {
			item.Unlink()
		}

		// save the changed layers
		layers = append(layers, groupItems.ToLayerList()...)
	}

	err = i.propertyRepo.SaveAll(ctx, properties)
	if err != nil {
		return inp.SchemaID, err
	}

	err = i.layerRepo.SaveAll(ctx, layers)
	if err != nil {
		return inp.SchemaID, err
	}

	err = i.datasetRepo.RemoveAll(ctx, dsIds)
	if err != nil {
		return inp.SchemaID, err
	}

	err = i.datasetSchemaRepo.Remove(ctx, inp.SchemaID)
	if err != nil {
		return inp.SchemaID, err
	}

	tx.Commit()
	return inp.SchemaID, nil
}
