package interactor

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"errors"
	"io"
	"strings"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/decoding"
	"github.com/reearth/reearth-backend/pkg/layer/encoding"
	"github.com/reearth/reearth-backend/pkg/layer/layerops"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/shp"
	"github.com/reearth/reearth-backend/pkg/tag"
)

// TODO: レイヤー作成のドメインロジックがここに多く漏れ出しているのでドメイン層に移す

type Layer struct {
	common
	commonSceneLock
	layerRepo          repo.Layer
	tagRepo            repo.Tag
	pluginRepo         repo.Plugin
	propertyRepo       repo.Property
	propertySchemaRepo repo.PropertySchema
	datasetRepo        repo.Dataset
	datasetSchemaRepo  repo.DatasetSchema
	sceneRepo          repo.Scene
	sceneLockRepo      repo.SceneLock
	transaction        repo.Transaction
}

func NewLayer(r *repo.Container) interfaces.Layer {
	return &Layer{
		commonSceneLock:    commonSceneLock{sceneLockRepo: r.SceneLock},
		layerRepo:          r.Layer,
		tagRepo:            r.Tag,
		pluginRepo:         r.Plugin,
		propertyRepo:       r.Property,
		datasetRepo:        r.Dataset,
		propertySchemaRepo: r.PropertySchema,
		datasetSchemaRepo:  r.DatasetSchema,
		sceneRepo:          r.Scene,
		sceneLockRepo:      r.SceneLock,
		transaction:        r.Transaction,
	}
}

func (i *Layer) Fetch(ctx context.Context, ids []id.LayerID, operator *usecase.Operator) (layer.List, error) {
	return i.layerRepo.FindByIDs(ctx, ids)
}

func (i *Layer) FetchGroup(ctx context.Context, ids []id.LayerID, operator *usecase.Operator) ([]*layer.Group, error) {
	return i.layerRepo.FindGroupByIDs(ctx, ids)
}

func (i *Layer) FetchItem(ctx context.Context, ids []id.LayerID, operator *usecase.Operator) ([]*layer.Item, error) {
	return i.layerRepo.FindItemByIDs(ctx, ids)
}

func (i *Layer) FetchParent(ctx context.Context, pid id.LayerID, operator *usecase.Operator) (*layer.Group, error) {
	return i.layerRepo.FindParentByID(ctx, pid)
}

func (i *Layer) FetchByProperty(ctx context.Context, pid id.PropertyID, operator *usecase.Operator) (layer.Layer, error) {
	return i.layerRepo.FindByProperty(ctx, pid)
}

func (i *Layer) FetchMerged(ctx context.Context, org id.LayerID, parent *id.LayerID, operator *usecase.Operator) (*layer.Merged, error) {
	ids := []id.LayerID{org}
	if parent != nil {
		ids = append(ids, *parent)
	}
	layers, err := i.layerRepo.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	layers2 := []*layer.Layer(layers)

	var orgl *layer.Item
	var parentl *layer.Group
	if parent != nil && len(layers2) == 2 {
		l := layers2[0]
		orgl = layer.ToLayerItemRef(l)
		l = layers2[1]
		parentl = layer.ToLayerGroupRef(l)
	} else if parent == nil && len(layers2) == 1 {
		l := layers2[0]
		if l != nil {
			orgl = layer.ToLayerItemRef(l)
		}
	}

	return layer.Merge(orgl, parentl), nil
}

func (i *Layer) FetchParentAndMerged(ctx context.Context, org id.LayerID, operator *usecase.Operator) (*layer.Merged, error) {
	orgl, err := i.layerRepo.FindItemByID(ctx, org)
	if err != nil {
		return nil, err
	}
	parent, err := i.layerRepo.FindParentByID(ctx, org)
	if err != nil {
		return nil, err
	}

	return layer.Merge(orgl, parent), nil
}

func (i *Layer) FetchByTag(ctx context.Context, tag id.TagID, operator *usecase.Operator) (layer.List, error) {
	return i.layerRepo.FindByTag(ctx, tag)
}

func (l *Layer) Export(ctx context.Context, lid id.LayerID, ext string) (io.Reader, string, error) {
	_, err := l.layerRepo.FindByID(ctx, lid)
	if err != nil {
		return nil, "", err
	}

	reader, writer := io.Pipe()
	e := encoding.EncoderFromExt(strings.ToLower(ext), writer)
	if e == nil {
		return nil, "", rerror.ErrNotFound
	}
	ex := &encoding.Exporter{
		Merger: &merging.Merger{
			LayerLoader:    repo.LayerLoaderFrom(l.layerRepo),
			PropertyLoader: repo.PropertyLoaderFrom(l.propertyRepo),
		},
		Sealer: &merging.Sealer{
			DatasetGraphLoader: repo.DatasetGraphLoaderFrom(l.datasetRepo),
		},
		Encoder: e,
	}

	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = ex.ExportLayerByID(ctx, lid)
	}()

	if err != nil {
		return nil, "", err
	}
	return reader, e.MimeType(), nil
}

func (i *Layer) AddItem(ctx context.Context, inp interfaces.AddLayerItemInput, operator *usecase.Operator) (_ *layer.Item, _ *layer.Group, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	parentLayer, err := i.layerRepo.FindGroupByID(ctx, inp.ParentLayerID)
	if err != nil {
		return nil, nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, parentLayer.Scene()); err != nil {
		return nil, nil, err
	}

	if parentLayer.IsLinked() {
		return nil, nil, interfaces.ErrCannotAddLayerToLinkedLayerGroup
	}

	var pid *id.PluginID
	if inp.ExtensionID != nil {
		pid = &id.OfficialPluginID
	}
	plugin, extension, err := i.getPlugin(ctx, parentLayer.Scene(), pid, inp.ExtensionID)
	if err != nil {
		return nil, nil, err
	}

	propertySchema, err := i.propertySchemaRepo.FindByID(ctx, extension.Schema())
	if err != nil {
		return nil, nil, err
	}

	layerItem, property, err := layerops.LayerItem{
		SceneID:                parentLayer.Scene(),
		ParentLayerID:          parentLayer.ID(),
		Plugin:                 plugin,
		ExtensionID:            inp.ExtensionID,
		LinkedDatasetID:        inp.LinkedDatasetID,
		LinkablePropertySchema: propertySchema,
		LatLng:                 inp.LatLng,
		Name:                   inp.Name,
		Index:                  inp.Index,
	}.Initialize()
	if err != nil {
		return nil, nil, err
	}

	index := -1
	if inp.Index != nil {
		index = *inp.Index
	}

	parentLayer.Layers().AddLayer(layerItem.ID(), index)

	if property != nil {
		err = i.propertyRepo.Save(ctx, property)
		if err != nil {
			return nil, nil, err
		}
	}

	err = i.layerRepo.Save(ctx, layerItem)
	if err != nil {
		return nil, nil, err
	}
	err = i.layerRepo.Save(ctx, parentLayer)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return layerItem, parentLayer, nil
}

func (i *Layer) AddGroup(ctx context.Context, inp interfaces.AddLayerGroupInput, operator *usecase.Operator) (_ *layer.Group, _ *layer.Group, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	parentLayer, err := i.layerRepo.FindGroupByID(ctx, inp.ParentLayerID)
	if err != nil {
		return nil, nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, parentLayer.Scene()); err != nil {
		return nil, nil, err
	}

	if parentLayer.IsLinked() {
		return nil, nil, interfaces.ErrCannotAddLayerToLinkedLayerGroup
	}

	var extensionSchemaID id.PropertySchemaID
	var propertySchema *property.Schema

	var pid *id.PluginID
	if inp.ExtensionID != nil {
		pid = &id.OfficialPluginID
	}
	plug, extension, err := i.getPlugin(ctx, parentLayer.Scene(), pid, inp.ExtensionID)
	if err != nil {
		return nil, nil, err
	}
	if extension != nil {
		if extension.Type() != plugin.ExtensionTypePrimitive {
			return nil, nil, interfaces.ErrExtensionTypeMustBePrimitive
		}
		extensionSchemaID = extension.Schema()
	}

	var datasetSchema *dataset.Schema
	var ds dataset.List
	if inp.LinkedDatasetSchemaID != nil {
		datasetSchema2, err := i.datasetSchemaRepo.FindByID(ctx, *inp.LinkedDatasetSchemaID)
		if err != nil {
			return nil, nil, err
		}
		datasetSchema = datasetSchema2

		ds, err = i.datasetRepo.FindBySchemaAll(ctx,
			*inp.LinkedDatasetSchemaID,
		)
		if err != nil {
			return nil, nil, err
		}
	} else {
		ds = []*dataset.Dataset{}
	}

	var p *property.Property
	builder := layer.NewGroup().NewID().Scene(parentLayer.Scene())
	if inp.Name == "" && datasetSchema != nil {
		builder = builder.Name(datasetSchema.Name())
	} else {
		builder = builder.Name(inp.Name)
	}
	if inp.ExtensionID != nil {
		builder = builder.Plugin(&id.OfficialPluginID)
		propertySchema, err = i.propertySchemaRepo.FindByID(ctx, extensionSchemaID)
		if err != nil {
			return nil, nil, err
		}

		builder = builder.Extension(inp.ExtensionID)
		p, err = property.New().
			NewID().
			Schema(extensionSchemaID).
			Scene(parentLayer.Scene()).
			Build()
		if err != nil {
			return nil, nil, err
		}

		// auto linking
		p.AutoLinkField(
			propertySchema,
			property.ValueTypeLatLng,
			datasetSchema.ID(),
			datasetSchema.FieldByType(dataset.ValueTypeLatLng).IDRef(),
			nil)
		p.AutoLinkField(
			propertySchema,
			property.ValueTypeURL,
			datasetSchema.ID(),
			datasetSchema.FieldByType(dataset.ValueTypeURL).IDRef(),
			nil)

		builder = builder.Property(p.ID().Ref())
	}
	if inp.LinkedDatasetSchemaID != nil {
		builder = builder.LinkedDatasetSchema(inp.LinkedDatasetSchemaID)
	}
	layerGroup, err := builder.Build()
	if err != nil {
		return nil, nil, err
	}

	// create item layers
	var representativeFieldID *id.DatasetFieldID
	if inp.RepresentativeFieldId != nil {
		representativeFieldID = inp.RepresentativeFieldId
	} else {
		representativeFieldID = datasetSchema.RepresentativeFieldID()
	}

	layerItems := make([]*layer.Item, 0, len(ds))
	layerItemProperties := make([]*property.Property, 0, len(ds))
	index := -1
	for _, ds := range ds {
		dsid := ds.ID()

		name := ""
		if rf := ds.FieldRef(representativeFieldID); rf != nil && rf.Type() == dataset.ValueTypeString {
			name = rf.Value().Value().(string)
		}

		layerItem, property, err := layerops.LayerItem{
			SceneID:         parentLayer.Scene(),
			ParentLayerID:   layerGroup.ID(),
			Plugin:          plug,
			ExtensionID:     inp.ExtensionID,
			Index:           &index,
			LinkedDatasetID: &dsid,
			Name:            name,
		}.Initialize()

		if err != nil {
			return nil, nil, err
		}
		layerItems = append(layerItems, layerItem)
		layerItemProperties = append(layerItemProperties, property)
		layerGroup.Layers().AddLayer(layerItem.ID(), -1)
	}

	// add group to parent
	if inp.Index != nil {
		index = *inp.Index
	}

	parentLayer.Layers().AddLayer(layerGroup.ID(), index)

	// save
	var pl layer.Layer = parentLayer
	var gl layer.Layer = layerGroup
	layers := layer.List{&pl, &gl}
	properties := []*property.Property{}
	if p != nil {
		properties = append(properties, p)
	}

	for index, item := range layerItems {
		var l layer.Layer = item
		layers = append(layers, &l)
		if p := layerItemProperties[index]; p != nil {
			properties = append(properties, p)
		}
	}

	err = i.propertyRepo.SaveAll(ctx, properties)
	if err != nil {
		return nil, nil, err
	}

	err = i.layerRepo.SaveAll(ctx, layers)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return layerGroup, parentLayer, nil
}

func (i *Layer) fetchAllChildren(ctx context.Context, l layer.Layer) ([]id.LayerID, []id.PropertyID, error) {
	lidl := layer.ToLayerGroup(l).Layers().Layers()
	layers, err := i.layerRepo.FindByIDs(ctx, lidl)
	if err != nil {
		return nil, nil, err
	}
	properties := append(make([]id.PropertyID, 0), l.Properties()...)
	for _, ll := range layers {
		lg := layer.ToLayerGroup(*ll)
		li := layer.ToLayerItem(*ll)
		if lg != nil {
			childrenLayers, childrenProperties, err := i.fetchAllChildren(ctx, lg)
			if err != nil {
				return nil, nil, err
			}
			properties = append(properties, childrenProperties...)
			lidl = append(lidl, childrenLayers...)

		}
		if li != nil {
			properties = append(properties, l.Properties()...)
		}

	}
	return lidl, properties, nil
}

func (i *Layer) Remove(ctx context.Context, lid id.LayerID, operator *usecase.Operator) (_ id.LayerID, _ *layer.Group, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	l, err := i.layerRepo.FindByID(ctx, lid)
	if err != nil {
		return lid, nil, err
	}
	if err := i.CanWriteScene(l.Scene(), operator); err != nil {
		return lid, nil, err
	}

	if err := i.CheckSceneLock(ctx, l.Scene()); err != nil {
		return lid, nil, err
	}

	if gl := layer.GroupFromLayer(l); gl != nil && gl.IsRoot() {
		return lid, nil, errors.New("root layer cannot be deleted")
	}

	parentLayer, err := i.layerRepo.FindParentByID(ctx, lid)
	if err != nil && err != rerror.ErrNotFound {
		return lid, nil, err
	}
	if parentLayer != nil {
		if l.Scene() != parentLayer.Scene() {
			return lid, nil, errors.New("invalid layer")
		}
	}

	if parentLayer != nil && parentLayer.IsLinked() {
		return lid, nil, interfaces.ErrCannotRemoveLayerToLinkedLayerGroup
	}
	if parentLayer != nil {
		parentLayer.Layers().RemoveLayer(lid)
		err = i.layerRepo.Save(ctx, parentLayer)
		if err != nil {
			return lid, nil, err
		}
	}
	layers, properties, err := i.fetchAllChildren(ctx, l)
	if err != nil {
		return lid, nil, err
	}
	layers = append(layers, l.ID())
	err = i.layerRepo.RemoveAll(ctx, layers)
	if err != nil {
		return lid, nil, err
	}
	err = i.propertyRepo.RemoveAll(ctx, properties)
	if err != nil {
		return lid, nil, err
	}

	tx.Commit()
	return lid, parentLayer, nil
}

func (i *Layer) Update(ctx context.Context, inp interfaces.UpdateLayerInput, operator *usecase.Operator) (_ layer.Layer, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	layer, err := i.layerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, layer.Scene()); err != nil {
		return nil, err
	}

	if inp.Name != nil {
		layer.Rename(*inp.Name)
	}

	if inp.Visible != nil {
		layer.SetVisible(*inp.Visible)
	}

	err = i.layerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *Layer) Move(ctx context.Context, inp interfaces.MoveLayerInput, operator *usecase.Operator) (_ id.LayerID, _ *layer.Group, _ *layer.Group, _ int, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	parentLayer, err := i.layerRepo.FindParentByID(ctx, inp.LayerID)
	if err != nil {
		return inp.LayerID, nil, nil, -1, err
	}
	if err := i.CanWriteScene(parentLayer.Scene(), operator); err != nil {
		return inp.LayerID, nil, nil, -1, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, parentLayer.Scene()); err != nil {
		return inp.LayerID, nil, nil, -1, err
	}

	var toParentLayer *layer.Group
	if inp.DestLayerID == nil || parentLayer.ID() == *inp.DestLayerID {
		toParentLayer = parentLayer
	} else if parentLayer.IsLinked() {
		return inp.LayerID, nil, nil, -1, interfaces.ErrLinkedLayerItemCannotBeMoved
	} else {
		toParentLayer, err = i.layerRepo.FindGroupByID(ctx, *inp.DestLayerID)
		if err != nil {
			return inp.LayerID, nil, nil, -1, err
		}
		if toParentLayer.Scene() != parentLayer.Scene() {
			return inp.LayerID, nil, nil, -1, interfaces.ErrCannotMoveLayerToOtherScene
		}
		if toParentLayer.IsLinked() {
			return inp.LayerID, nil, nil, -1, interfaces.ErrLayerCannotBeMovedToLinkedLayerGroup
		}
	}

	toParentLayer.MoveLayerFrom(inp.LayerID, inp.Index, parentLayer)

	layers := layer.List{parentLayer.LayerRef()}
	if parentLayer.ID() != toParentLayer.ID() {
		layers = append(layers, toParentLayer.LayerRef())
	}
	err = i.layerRepo.SaveAll(ctx, layers)
	if err != nil {
		return inp.LayerID, nil, nil, -1, err
	}

	tx.Commit()
	return inp.LayerID,
		parentLayer,
		toParentLayer,
		toParentLayer.Layers().FindLayerIndex(inp.LayerID),
		nil
}

func (i *Layer) CreateInfobox(ctx context.Context, lid id.LayerID, operator *usecase.Operator) (_ layer.Layer, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	l, err := i.layerRepo.FindByID(ctx, lid)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(l.Scene(), operator); err != nil {
		return nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, l.Scene()); err != nil {
		return nil, err
	}

	infobox := l.Infobox()
	if infobox != nil {
		return nil, interfaces.ErrInfoboxAlreadyExists
	}

	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDInfobox)
	property, err := property.New().NewID().Schema(schema.ID()).Scene(l.Scene()).Build()
	if err != nil {
		return nil, err
	}
	infobox = layer.NewInfobox(nil, property.ID())
	l.SetInfobox(infobox)

	err = i.propertyRepo.Save(ctx, property)
	if err != nil {
		return nil, err
	}
	err = i.layerRepo.Save(ctx, l)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return l, nil
}

func (i *Layer) RemoveInfobox(ctx context.Context, layerID id.LayerID, operator *usecase.Operator) (_ layer.Layer, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	layer, err := i.layerRepo.FindByID(ctx, layerID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, layer.Scene()); err != nil {
		return nil, err
	}

	infobox := layer.Infobox()
	if infobox == nil {
		return nil, interfaces.ErrInfoboxNotFound
	}

	layer.SetInfobox(nil)

	err = i.propertyRepo.Remove(ctx, infobox.Property())
	if err != nil {
		return nil, err
	}

	err = i.layerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *Layer) AddInfoboxField(ctx context.Context, inp interfaces.AddInfoboxFieldParam, operator *usecase.Operator) (_ *layer.InfoboxField, _ layer.Layer, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	l, err := i.layerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteScene(l.Scene(), operator); err != nil {
		return nil, nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, l.Scene()); err != nil {
		return nil, nil, err
	}

	infobox := l.Infobox()
	if infobox == nil {
		return nil, nil, interfaces.ErrInfoboxNotFound
	}

	_, extension, err := i.getPlugin(ctx, l.Scene(), &inp.PluginID, &inp.ExtensionID)
	if err != nil {
		return nil, nil, err
	}
	if extension.Type() != plugin.ExtensionTypeBlock {
		return nil, nil, interfaces.ErrExtensionTypeMustBeBlock
	}

	property, err := property.New().NewID().Schema(extension.Schema()).Scene(l.Scene()).Build()
	if err != nil {
		return nil, nil, err
	}

	field, err := layer.NewInfoboxField().
		NewID().
		Plugin(inp.PluginID).
		Extension(inp.ExtensionID).
		Property(property.ID()).
		Build()
	if err != nil {
		return nil, nil, err
	}

	index := -1
	if inp.Index != nil {
		index = *inp.Index
	}
	infobox.Add(field, index)

	err = i.propertyRepo.Save(ctx, property)
	if err != nil {
		return nil, nil, err
	}

	err = i.layerRepo.Save(ctx, l)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return field, l, err
}

func (i *Layer) MoveInfoboxField(ctx context.Context, inp interfaces.MoveInfoboxFieldParam, operator *usecase.Operator) (_ id.InfoboxFieldID, _ layer.Layer, _ int, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	layer, err := i.layerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return inp.InfoboxFieldID, nil, -1, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return inp.InfoboxFieldID, nil, -1, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, layer.Scene()); err != nil {
		return inp.InfoboxFieldID, nil, -1, err
	}

	infobox := layer.Infobox()
	if infobox == nil {
		return inp.InfoboxFieldID, nil, -1, interfaces.ErrInfoboxNotFound
	}

	infobox.Move(inp.InfoboxFieldID, inp.Index)

	err = i.layerRepo.Save(ctx, layer)
	if err != nil {
		return inp.InfoboxFieldID, nil, -1, err
	}

	tx.Commit()
	return inp.InfoboxFieldID, layer, inp.Index, err
}

func (i *Layer) RemoveInfoboxField(ctx context.Context, inp interfaces.RemoveInfoboxFieldParam, operator *usecase.Operator) (_ id.InfoboxFieldID, _ layer.Layer, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	layer, err := i.layerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return inp.InfoboxFieldID, nil, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return inp.InfoboxFieldID, nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, layer.Scene()); err != nil {
		return inp.InfoboxFieldID, nil, err
	}

	infobox := layer.Infobox()
	if infobox == nil {
		return inp.InfoboxFieldID, nil, interfaces.ErrInfoboxNotFound
	}

	infobox.Remove(inp.InfoboxFieldID)

	err = i.layerRepo.Save(ctx, layer)
	if err != nil {
		return inp.InfoboxFieldID, nil, err
	}

	tx.Commit()
	return inp.InfoboxFieldID, layer, err
}

func (i *Layer) getPlugin(ctx context.Context, sid id.SceneID, p *id.PluginID, e *id.PluginExtensionID) (*plugin.Plugin, *plugin.Extension, error) {
	if p == nil {
		return nil, nil, nil
	}

	plugin, err := i.pluginRepo.FindByID(ctx, *p)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil, interfaces.ErrPluginNotFound
		}
		return nil, nil, err
	}

	if e == nil {
		return plugin, nil, nil
	}

	extension := plugin.Extension(*e)
	if extension == nil {
		return nil, nil, interfaces.ErrExtensionNotFound
	}

	return plugin, extension, nil
}

func (i *Layer) ImportLayer(ctx context.Context, inp interfaces.ImportLayerParam, operator *usecase.Operator) (_ layer.List, _ *layer.Group, err error) {
	if inp.File == nil {
		return nil, nil, interfaces.ErrFileNotIncluded
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

	parent, err := i.layerRepo.FindGroupByID(ctx, inp.LayerID)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteScene(parent.Scene(), operator); err != nil {
		return nil, nil, err
	}

	var decoder decoding.Decoder
	switch inp.Format {
	case decoding.LayerEncodingFormatKML:
		d := xml.NewDecoder(inp.File.Content)
		decoder = decoding.NewKMLDecoder(d, parent.Scene())
	case decoding.LayerEncodingFormatGEOJSON:
		decoder = decoding.NewGeoJSONDecoder(inp.File.Content, parent.Scene())
	case decoding.LayerEncodingFormatCZML:
		d := json.NewDecoder(inp.File.Content)
		decoder = decoding.NewCZMLDecoder(d, parent.Scene())
	case decoding.LayerEncodingFormatREEARTH:
		d := json.NewDecoder(inp.File.Content)
		decoder = decoding.NewReearthDecoder(d, parent.Scene())
	case decoding.LayerEncodingFormatSHAPE:
		// limit file size to 2m
		if inp.File.Size > 2097152 {
			return nil, nil, errors.New("file is too big")
		}
		var reader decoding.ShapeReader
		if inp.File.ContentType == "application/octet-stream" && strings.HasSuffix(inp.File.Path, ".shp") {
			reader, err = shp.ReadFrom(inp.File.Content)
			if err != nil {
				return nil, nil, err
			}
			decoder = decoding.NewShapeDecoder(reader, parent.Scene())
		} else if inp.File.ContentType == "application/zip" && strings.HasSuffix(inp.File.Path, ".zip") {
			reader, err = shp.ReadZipFrom(inp.File.Content)
			if err != nil {
				return nil, nil, err
			}
		}
		decoder = decoding.NewShapeDecoder(reader, parent.Scene())
	}
	if decoder == nil {
		return nil, nil, errors.New("unsupported format")
	}
	result, err := decoder.Decode()
	if err != nil {
		return nil, nil, err
	}

	properties := result.Properties.List()
	if err := (property.Validator{
		SchemaLoader: repo.PropertySchemaLoaderFrom(i.propertySchemaRepo),
	}.Validate(ctx, properties)); err != nil {
		return nil, nil, err
	}

	rootLayers := result.RootLayers()
	if len(rootLayers) == 0 {
		return nil, nil, errors.New("no layers are imported")
	}

	if result.Root.LayerCount() > 0 {
		parent.Layers().AppendLayers(result.Root.Layers()...)
	}

	if err := i.layerRepo.SaveAll(ctx, append(result.Layers.List(), parent.LayerRef())); err != nil {
		return nil, nil, err
	}

	if err := i.propertyRepo.SaveAll(ctx, properties); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return rootLayers, parent, nil
}

func (i *Layer) AttachTag(ctx context.Context, layerID id.LayerID, tagID id.TagID, operator *usecase.Operator) (layer.Layer, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	// ensure the tag exists
	t, err := i.tagRepo.FindByID(ctx, tagID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(t.Scene(), operator); err != nil {
		return nil, err
	}

	l, err := i.layerRepo.FindByID(ctx, layerID)
	if err != nil {
		return nil, err
	}

	updated := false
	if tg := tag.ToTagGroup(t); tg != nil {
		updated = l.Tags().Add(layer.NewTagGroup(tagID, nil))
	} else if ti := tag.ToTagItem(t); ti != nil {
		if p := ti.Parent(); p != nil {
			updated = l.Tags().FindGroup(*ti.Parent()).Add(layer.NewTagItem(ti.ID()))
		} else {
			updated = l.Tags().Add(layer.NewTagItem(ti.ID()))
		}
	}

	if updated {
		if err := i.layerRepo.Save(ctx, l); err != nil {
			return nil, err
		}
	}

	tx.Commit()
	return l, nil
}

func (i *Layer) DetachTag(ctx context.Context, layerID id.LayerID, tagID id.TagID, operator *usecase.Operator) (layer.Layer, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	layer, err := i.layerRepo.FindByID(ctx, layerID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, err
	}

	if layer.Tags().Delete(tagID) {
		if err := i.layerRepo.Save(ctx, layer); err != nil {
			return nil, err
		}
	}

	tx.Commit()
	return layer, nil
}
