package interactor

import (
	"context"
	"errors"
	"strings"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/dataset"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/initializer"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/scene/sceneops"
)

var extensionForLinkedLayers = id.PluginExtensionID("marker")

type Dataset struct {
	commonScene
	commonSceneLock
	datasetRepo       repo.Dataset
	datasetSchemaRepo repo.DatasetSchema
	propertyRepo      repo.Property
	layerRepo         repo.Layer
	pluginRepo        repo.Plugin
	transaction       repo.Transaction
	datasource        gateway.DataSource
	file              gateway.File
}

func NewDataset(r *repo.Container, gr *gateway.Container) interfaces.Dataset {
	return &Dataset{
		commonScene:       commonScene{sceneRepo: r.Scene},
		commonSceneLock:   commonSceneLock{sceneLockRepo: r.SceneLock},
		datasetRepo:       r.Dataset,
		datasetSchemaRepo: r.DatasetSchema,
		propertyRepo:      r.Property,
		layerRepo:         r.Layer,
		pluginRepo:        r.Plugin,
		transaction:       r.Transaction,
		datasource:        gr.DataSource,
		file:              gr.File,
	}
}

func (i *Dataset) DynamicSchemaFields() []*dataset.SchemaField {
	author, _ := dataset.NewSchemaField().NewID().Name("author").Type(dataset.ValueTypeString).Build()
	content, _ := dataset.NewSchemaField().NewID().Name("content").Type(dataset.ValueTypeString).Build()
	location, _ := dataset.NewSchemaField().NewID().Name("location").Type(dataset.ValueTypeLatLng).Build()
	target, _ := dataset.NewSchemaField().NewID().Name("target").Type(dataset.ValueTypeString).Build()
	return []*dataset.SchemaField{author, content, location, target}
}

func (i *Dataset) UpdateDatasetSchema(ctx context.Context, inp interfaces.UpdateDatasetSchemaParam, operator *usecase.Operator) (_ *dataset.Schema, err error) {
	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}
	schema, err := i.datasetSchemaRepo.FindByID(ctx, inp.SchemaId, scenes)
	if err != nil {
		return nil, err
	}

	// Begin Db transaction
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
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

func (i *Dataset) AddDynamicDatasetSchema(ctx context.Context, inp interfaces.AddDynamicDatasetSchemaParam) (_ *dataset.Schema, err error) {

	// Begin Db transaction
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	schemaBuilder := dataset.NewSchema().
		NewID().
		Scene(inp.SceneId).
		Dynamic(true)
	fields := i.DynamicSchemaFields()
	schemaBuilder = schemaBuilder.Fields(fields)
	ds, err := schemaBuilder.Build()
	if err != nil {
		return nil, err
	}
	err = i.datasetSchemaRepo.Save(ctx, ds)
	if err != nil {
		return nil, err
	}

	// Commit db transaction
	tx.Commit()
	return ds, nil
}

func (i *Dataset) AddDynamicDataset(ctx context.Context, inp interfaces.AddDynamicDatasetParam) (_ *dataset.Schema, _ *dataset.Dataset, err error) {

	// Begin Db transaction
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	fields := []*dataset.Field{}
	dss, err := i.datasetSchemaRepo.FindDynamicByID(ctx, inp.SchemaId)
	if err != nil {
		return nil, nil, err
	}
	for _, f := range dss.Fields() {

		if f.Name() == "author" {
			fields = append(fields, dataset.NewField(f.ID(), dataset.ValueFrom(inp.Author), ""))
		}
		if f.Name() == "content" {
			fields = append(fields, dataset.NewField(f.ID(), dataset.ValueFrom(inp.Content), ""))
		}
		if inp.Target != nil && len(*inp.Target) > 0 && f.Name() == "target" {
			fields = append(fields, dataset.NewField(f.ID(), dataset.ValueFrom(inp.Target), ""))
		}
		if inp.Lat != nil && inp.Lng != nil && f.Name() == "location" {
			latlng := dataset.LatLng{Lat: *inp.Lat, Lng: *inp.Lng}
			fields = append(fields, dataset.NewField(f.ID(), dataset.ValueFrom(latlng), ""))
		}
	}
	ds, err := dataset.
		New().
		NewID().
		Fields(fields).
		Schema(inp.SchemaId).
		Build()
	if err != nil {
		return nil, nil, err
	}
	err = i.datasetRepo.Save(ctx, ds)
	if err != nil {
		return nil, nil, err
	}

	// Commit db transaction
	tx.Commit()
	return dss, ds, nil
}

func (i *Dataset) ImportDataset(ctx context.Context, inp interfaces.ImportDatasetParam, operator *usecase.Operator) (_ *dataset.Schema, err error) {
	if err := i.CanWriteScene(ctx, inp.SceneId, operator); err != nil {
		return nil, err
	}
	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	seperator := ','
	if strings.HasSuffix(inp.File.Name, ".tsv") {
		seperator = '\t'
	}
	scenes := []id.SceneID{inp.SceneId}
	csv := dataset.NewCSVParser(inp.File.Content, inp.File.Name, seperator)
	err = csv.Init()
	if err != nil {
		return nil, err
	}

	// replacment mode
	if inp.SchemaId != nil {
		dss, err := i.datasetSchemaRepo.FindByID(ctx, *inp.SchemaId, scenes)
		if err != nil {
			return nil, err
		}
		err = csv.CheckCompatible(dss)
		if err != nil {
			return nil, err
		}
		toreplace, err := i.datasetRepo.FindBySchemaAll(ctx, *inp.SchemaId)
		if err != nil {
			return nil, err
		}
		err = i.datasetRepo.RemoveAll(ctx, toreplace.ToDatasetIds())
		if err != nil {
			return nil, err
		}
	} else {
		err = csv.GuessSchema(inp.SceneId)
		if err != nil {
			return nil, err
		}
	}

	schema, datasets, err := csv.ReadAll()
	if err != nil {
		return nil, err
	}

	err = i.datasetSchemaRepo.Save(ctx, schema)
	if err != nil {
		return nil, err
	}
	err = i.datasetRepo.SaveAll(ctx, datasets)
	if err != nil {
		return nil, err
	}

	if inp.SchemaId != nil {
		layergroups, err := i.layerRepo.FindGroupBySceneAndLinkedDatasetSchema(ctx, inp.SceneId, *inp.SchemaId)
		if err != nil {
			return nil, err
		}

		newProperties := make([]*property.Property, 0, len(datasets))
		representativeFieldID := schema.RepresentativeFieldID()
		removedProperties := []id.PropertyID{}
		removedLayers := []id.LayerID{}
		updatedLayers := append(layer.List{}, layergroups.ToLayerList()...)

		for _, lg := range layergroups {
			if lg.Layers().LayerCount() > 0 {
				children, err := i.layerRepo.FindByIDs(ctx, lg.Layers().Layers(), scenes)
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
				dsid := ds.ID()
				name := ""
				if rf := ds.FieldRef(representativeFieldID); rf != nil && rf.Type() == dataset.ValueTypeString {
					name = rf.Value().Value().(string)
				}
				layerItem, layerProperty, err := initializer.LayerItem{
					SceneID:         inp.SceneId,
					ParentLayerID:   lg.ID(),
					Plugin:          builtin.Plugin(),
					ExtensionID:     &extensionForLinkedLayers,
					LinkedDatasetID: &dsid,
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

func (i *Dataset) Fetch(ctx context.Context, ids []id.DatasetID, operator *usecase.Operator) (dataset.List, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}
	return i.datasetRepo.FindByIDs(ctx, ids, scenes)
}

func (i *Dataset) GraphFetch(ctx context.Context, id id.DatasetID, depth int, operator *usecase.Operator) (dataset.List, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}
	if depth < 0 || depth > 3 {
		return nil, interfaces.ErrDatasetInvalidDepth
	}
	it := dataset.GraphIteratorFrom(id, depth)
	res := dataset.List{}
	next := id
	done := false
	for {
		d, err := i.datasetRepo.FindByID(ctx, next, scenes)
		if err != nil {
			return nil, err
		}
		res = append(res, d)
		next, done = it.Next(d)
		if next.ID().IsNil() {
			return nil, err1.ErrInternalBy(errors.New("next id is nil"))
		}
		if done {
			break
		}
	}
	return res, nil
}

func (i *Dataset) FetchSchema(ctx context.Context, ids []id.DatasetSchemaID, operator *usecase.Operator) (dataset.SchemaList, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	return i.datasetSchemaRepo.FindByIDs(ctx, ids, scenes)
}

func (i *Dataset) GraphFetchSchema(ctx context.Context, id id.DatasetSchemaID, depth int, operator *usecase.Operator) (dataset.SchemaList, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	if depth < 0 || depth > 3 {
		return nil, interfaces.ErrDatasetInvalidDepth
	}

	it := dataset.SchemaGraphIteratorFrom(id, depth)
	res := dataset.SchemaList{}
	next := id
	done := false
	for {
		d, err := i.datasetSchemaRepo.FindByID(ctx, next, scenes)
		if err != nil {
			return nil, err
		}
		res = append(res, d)
		next, done = it.Next(d)
		if next.ID().IsNil() {
			return nil, err1.ErrInternalBy(errors.New("next id is nil"))
		}
		if done {
			break
		}
	}

	return res, nil
}

func (i *Dataset) FindBySchema(ctx context.Context, ds id.DatasetSchemaID, p *usecase.Pagination, operator *usecase.Operator) (dataset.List, *usecase.PageInfo, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, nil, err
	}

	return i.datasetRepo.FindBySchema(ctx, ds, scenes, p)
}

func (i *Dataset) FindSchemaByScene(ctx context.Context, sid id.SceneID, p *usecase.Pagination, operator *usecase.Operator) (dataset.SchemaList, *usecase.PageInfo, error) {
	if err := i.CanReadScene(ctx, sid, operator); err != nil {
		return nil, nil, err
	}

	return i.datasetSchemaRepo.FindByScene(ctx, sid, p)
}

func (i *Dataset) FindDynamicSchemaByScene(ctx context.Context, sid id.SceneID) (dataset.SchemaList, error) {
	return i.datasetSchemaRepo.FindAllDynamicByScene(ctx, sid)
}

func (i *Dataset) Sync(ctx context.Context, sceneID id.SceneID, url string, operator *usecase.Operator) (dss dataset.SchemaList, ds dataset.List, err error) {
	if err := i.CanWriteScene(ctx, sceneID, operator); err != nil {
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
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
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
	if err := i.layerRepo.RemoveAll(ctx, result.RemovedLayers.All()); err != nil {
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
	if err := i.CanWriteScene(ctx, inp.SceneId, operator); err != nil {
		return nil, err
	}

	// Begin Db transaction
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
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
	if operator == nil {
		return inp.SchemaId, interfaces.ErrOperationDenied
	}
	scenes, err := i.sceneRepo.FindIDsByTeam(ctx, operator.WritableTeams)
	if err != nil {
		return inp.SchemaId, err
	}
	s, err := i.datasetSchemaRepo.FindByID(ctx, inp.SchemaId, scenes)
	if err != nil {
		return inp.SchemaId, err
	}

	if s == nil {
		return inp.SchemaId, err1.ErrNotFound
	}

	datasets, err := i.datasetRepo.FindBySchemaAll(ctx, inp.SchemaId)
	if err != nil {
		return inp.SchemaId, err
	}
	if (inp.Force == nil || !*inp.Force) && len(datasets) != 0 {
		return inp.SchemaId, errors.New("can not remove non-empty schema")
	}

	// Begin Db transaction
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	// list of datasets attached by the schema
	dsids := []id.DatasetID{}
	var properties []*property.Property
	for _, d := range datasets {
		properties, err = i.propertyRepo.FindByDataset(ctx, inp.SchemaId, d.ID())
		if err != nil {
			return inp.SchemaId, err
		}

		for _, p := range properties {
			// unlinking fields
			p.UnlinkAllByDataset(inp.SchemaId, d.ID())
		}

		dsids = append(dsids, d.ID())
	}

	// unlink layers (items and groups) and save
	layers, err := i.layerRepo.FindAllByDatasetSchema(ctx, inp.SchemaId)
	if err != nil {
		return inp.SchemaId, err
	}

	for _, li := range layers.ToLayerItemList() {
		li.Unlink()
	}

	for _, lg := range layers.ToLayerGroupList() {
		lg.Unlink()

		groupItems, err := i.layerRepo.FindItemByIDs(ctx, lg.Layers().Layers(), scenes)
		if err != nil {
			return inp.SchemaId, err
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
		return inp.SchemaId, err
	}

	err = i.layerRepo.SaveAll(ctx, layers)
	if err != nil {
		return inp.SchemaId, err
	}

	err = i.datasetRepo.RemoveAll(ctx, dsids)
	if err != nil {
		return inp.SchemaId, err
	}

	err = i.datasetSchemaRepo.Remove(ctx, inp.SchemaId)
	if err != nil {
		return inp.SchemaId, err
	}

	tx.Commit()
	return inp.SchemaId, nil
}
