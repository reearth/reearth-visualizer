package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/nlslayer/nlslayerops"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type NLSLayer struct {
	common
	commonSceneLock
	nlslayerRepo  repo.NLSLayer
	sceneLockRepo repo.SceneLock
	propertyRepo  repo.Property
	pluginRepo    repo.Plugin
	transaction   usecasex.Transaction
	redis         gateway.RedisGateway
}

func NewNLSLayer(r *repo.Container, redis gateway.RedisGateway) interfaces.NLSLayer {
	return &NLSLayer{
		commonSceneLock: commonSceneLock{sceneLockRepo: r.SceneLock},
		nlslayerRepo:    r.NLSLayer,
		sceneLockRepo:   r.SceneLock,
		propertyRepo:    r.Property,
		pluginRepo:      r.Plugin,
		transaction:     r.Transaction,
		redis:           redis,
	}
}

func (i *NLSLayer) Fetch(ctx context.Context, ids id.NLSLayerIDList, operator *usecase.Operator) (nlslayer.NLSLayerList, error) {
	return i.nlslayerRepo.FindByIDs(ctx, ids)
}

func (i *NLSLayer) FetchLayerSimple(ctx context.Context, ids id.NLSLayerIDList, operator *usecase.Operator) (nlslayer.NLSLayerSimpleList, error) {
	return i.nlslayerRepo.FindNLSLayerSimpleByIDs(ctx, ids)
}

func (i *NLSLayer) FetchParent(ctx context.Context, pid id.NLSLayerID, operator *usecase.Operator) (*nlslayer.NLSLayerGroup, error) {
	return i.nlslayerRepo.FindParentByID(ctx, pid)
}

func (i *NLSLayer) FetchByScene(ctx context.Context, sid id.SceneID, _ *usecase.Operator) (nlslayer.NLSLayerList, error) {
	return i.nlslayerRepo.FindByScene(ctx, sid)
}

func (i *NLSLayer) AddLayerSimple(ctx context.Context, inp interfaces.AddNLSLayerSimpleInput, operator *usecase.Operator) (_ *nlslayer.NLSLayerSimple, err error) {
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

	if err := i.CanWriteScene(inp.SceneID, operator); err != nil {
		return nil, interfaces.ErrOperationDenied
	}

	layerSimple, err := nlslayerops.LayerSimple{
		SceneID:   inp.SceneID,
		Config:    inp.Config,
		LayerType: inp.LayerType,
		Index:     inp.Index,
		Title:     inp.Title,
		Visible:   inp.Visible,
	}.Initialize()
	if err != nil {
		return nil, err
	}

	if inp.Schema != nil {
		featureCollection := nlslayer.NewFeatureCollection(
			"FeatureCollection",
			[]nlslayer.Feature{},
		)
		sketchInfo := nlslayer.NewSketchInfo(
			inp.Schema,
			featureCollection,
		)

		layerSimple.SetIsSketch(true)
		layerSimple.SetSketch(sketchInfo)
	}

	err = i.nlslayerRepo.Save(ctx, layerSimple)
	if err != nil {
		return nil, err
	}

	tx.Commit()

	err = setToCache[nlslayer.NLSLayer](ctx, i.redis, nlslayer.NLSLayerCacheKey(layerSimple.ID()), layerSimple)
	if err != nil {
		return nil, err
	}

	return layerSimple, nil
}

func (i *NLSLayer) fetchAllChildren(ctx context.Context, l nlslayer.NLSLayer) ([]id.NLSLayerID, error) {
	lidl := nlslayer.ToNLSLayerGroup(l).Children().Layers()
	layers, err := i.nlslayerRepo.FindByIDs(ctx, lidl)
	if err != nil {
		return nil, err
	}
	for _, ll := range layers {
		lg := nlslayer.ToNLSLayerGroup(*ll)
		if lg != nil {
			childrenLayers, err := i.fetchAllChildren(ctx, lg)
			if err != nil {
				return nil, err
			}
			lidl = append(lidl, childrenLayers...)

		}
	}
	return lidl, nil
}

func (i *NLSLayer) Remove(ctx context.Context, lid id.NLSLayerID, operator *usecase.Operator) (_ id.NLSLayerID, _ *nlslayer.NLSLayerGroup, err error) {
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

	var layer nlslayer.NLSLayer
	layerSimple, err := getFromCache[*nlslayer.NLSLayerSimple](ctx, i.redis, nlslayer.NLSLayerCacheKey(lid))
	if err != nil {
		return lid, nil, err
	}

	if layerSimple == nil {
		layer, err = i.nlslayerRepo.FindByID(ctx, lid)
		if err != nil {
			return lid, nil, err
		}
	} else {
		layer = layerSimple
	}

	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return lid, nil, err
	}

	if err := i.CheckSceneLock(ctx, layer.Scene()); err != nil {
		return lid, nil, err
	}

	parentLayer, err := i.nlslayerRepo.FindParentByID(ctx, lid)
	if err != nil && err != rerror.ErrNotFound {
		return lid, nil, err
	}
	if parentLayer != nil {
		if layer.Scene() != parentLayer.Scene() {
			return lid, nil, errors.New("invalid layer")
		}
	}

	if parentLayer != nil {
		return lid, nil, interfaces.ErrCannotRemoveLayerToLinkedLayerGroup
	}
	if parentLayer != nil {
		parentLayer.Children().RemoveLayer(lid)
		err = i.nlslayerRepo.Save(ctx, parentLayer)
		if err != nil {
			return lid, nil, err
		}
	}
	layers, err := i.fetchAllChildren(ctx, layer)
	if err != nil {
		return lid, nil, err
	}
	layers = append(layers, layer.ID())
	err = i.nlslayerRepo.RemoveAll(ctx, layers)
	if err != nil {
		return lid, nil, err
	}

	tx.Commit()

	for _, l := range layers {
		err = deleteFromCache(ctx, i.redis, nlslayer.NLSLayerCacheKey(l))
		if err != nil {
			return l, nil, err
		}
	}

	return lid, parentLayer, nil
}

func (i *NLSLayer) Update(ctx context.Context, inp interfaces.UpdateNLSLayerInput, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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

	var layer nlslayer.NLSLayer
	layerSimple, err := getFromCache[*nlslayer.NLSLayerSimple](ctx, i.redis, nlslayer.NLSLayerCacheKey(inp.LayerID))
	if err != nil {
		return nil, err
	}

	if layerSimple == nil {
		layer, err = i.nlslayerRepo.FindByID(ctx, inp.LayerID)
		if err != nil {
			return nil, err
		}
	} else {
		layer = layerSimple
	}

	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, err
	}

	if inp.Name != nil {
		layer.Rename(*inp.Name)
	}

	if inp.Visible != nil {
		layer.SetVisible(*inp.Visible)
	}

	if inp.Config != nil {
		layer.UpdateConfig(inp.Config)
	}

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	tx.Commit()

	err = setToCache[nlslayer.NLSLayer](ctx, i.redis, nlslayer.NLSLayerCacheKey(layer.ID()), layer)
	if err != nil {
		return nil, err
	}

	return layer, nil
}

func (i *NLSLayer) CreateNLSInfobox(ctx context.Context, lid id.NLSLayerID, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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

	l, err := i.nlslayerRepo.FindByID(ctx, lid)
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

	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDBetaInfobox)
	property, err := property.New().NewID().Schema(schema.ID()).Scene(l.Scene()).Build()
	if err != nil {
		return nil, err
	}
	infobox = nlslayer.NewInfobox(nil, property.ID())
	l.SetInfobox(infobox)

	err = i.propertyRepo.Save(ctx, property)
	if err != nil {
		return nil, err
	}
	err = i.nlslayerRepo.Save(ctx, l)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return l, nil
}

func (i *NLSLayer) RemoveNLSInfobox(ctx context.Context, layerID id.NLSLayerID, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {

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

	layer, err := i.nlslayerRepo.FindByID(ctx, layerID)
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

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *NLSLayer) getPlugin(ctx context.Context, sid id.SceneID, p *id.PluginID, e *id.PluginExtensionID) (*plugin.Plugin, *plugin.Extension, error) {
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

func (i *NLSLayer) AddNLSInfoboxBlock(ctx context.Context, inp interfaces.AddNLSInfoboxBlockParam, operator *usecase.Operator) (_ *nlslayer.InfoboxBlock, _ nlslayer.NLSLayer, err error) {
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

	l, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
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
	if extension.Type() != plugin.ExtensionTypeInfoboxBlock {
		return nil, nil, interfaces.ErrExtensionTypeMustBeBlock
	}
	property, err := property.New().NewID().Schema(extension.Schema()).Scene(l.Scene()).Build()
	if err != nil {
		return nil, nil, err
	}

	block, err := nlslayer.NewInfoboxBlock().
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
	infobox.Add(block, index)

	err = i.propertyRepo.Save(ctx, property)
	if err != nil {
		return nil, nil, err
	}

	err = i.nlslayerRepo.Save(ctx, l)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return block, l, err
}

func (i *NLSLayer) MoveNLSInfoboxBlock(ctx context.Context, inp interfaces.MoveNLSInfoboxBlockParam, operator *usecase.Operator) (_ id.InfoboxBlockID, _ nlslayer.NLSLayer, _ int, err error) {
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

	layer, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return inp.InfoboxBlockID, nil, -1, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return inp.InfoboxBlockID, nil, -1, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, layer.Scene()); err != nil {
		return inp.InfoboxBlockID, nil, -1, err
	}

	infobox := layer.Infobox()
	if infobox == nil {
		return inp.InfoboxBlockID, nil, -1, interfaces.ErrInfoboxNotFound
	}

	infobox.Move(inp.InfoboxBlockID, inp.Index)

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return inp.InfoboxBlockID, nil, -1, err
	}

	tx.Commit()
	return inp.InfoboxBlockID, layer, inp.Index, err
}

func (i *NLSLayer) RemoveNLSInfoboxBlock(ctx context.Context, inp interfaces.RemoveNLSInfoboxBlockParam, operator *usecase.Operator) (_ id.InfoboxBlockID, _ nlslayer.NLSLayer, err error) {
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

	layer, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return inp.InfoboxBlockID, nil, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return inp.InfoboxBlockID, nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, layer.Scene()); err != nil {
		return inp.InfoboxBlockID, nil, err
	}

	infobox := layer.Infobox()
	if infobox == nil {
		return inp.InfoboxBlockID, nil, interfaces.ErrInfoboxNotFound
	}

	infobox.Remove(inp.InfoboxBlockID)

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return inp.InfoboxBlockID, nil, err
	}

	tx.Commit()
	return inp.InfoboxBlockID, layer, err
}

func (i *NLSLayer) Duplicate(ctx context.Context, lid id.NLSLayerID, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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

	var layer nlslayer.NLSLayer
	layerSimple, err := getFromCache[*nlslayer.NLSLayerSimple](ctx, i.redis, nlslayer.NLSLayerCacheKey(lid))
	if err != nil {
		return nil, err
	}

	if layerSimple == nil {
		layer, err = i.nlslayerRepo.FindByID(ctx, lid)
		if err != nil {
			return nil, err
		}
	} else {
		layer = layerSimple
	}

	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, err
	}

	duplicatedLayer := layer.Duplicate()

	err = i.nlslayerRepo.Save(ctx, duplicatedLayer)
	if err != nil {
		return nil, err
	}

	tx.Commit()

	err = setToCache[nlslayer.NLSLayer](ctx, i.redis, nlslayer.NLSLayerCacheKey(duplicatedLayer.ID()), duplicatedLayer)
	if err != nil {
		return nil, err
	}

	return duplicatedLayer, nil
}

func (i *NLSLayer) AddCustomProperties(ctx context.Context, inp interfaces.AddCustomPropertiesInput, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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

	layer, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return nil, err
	}

	if layer.Sketch() == nil {
		featureCollection := nlslayer.NewFeatureCollection(
			"FeatureCollection",
			[]nlslayer.Feature{},
		)
		sketchInfo := nlslayer.NewSketchInfo(
			&inp.Schema,
			featureCollection,
		)

		layer.SetIsSketch(true)
		layer.SetSketch(sketchInfo)
	} else {
		layer.Sketch().SetCustomPropertySchema(&inp.Schema)
	}

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *NLSLayer) AddGeoJSONFeature(ctx context.Context, inp interfaces.AddNLSLayerGeoJSONFeatureParams, operator *usecase.Operator) (_ nlslayer.Feature, err error) {
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

	layer, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return nlslayer.Feature{}, err
	}

	geometry, err := nlslayer.NewGeometryFromMap(inp.Geometry)
	if err != nil {
		return nlslayer.Feature{}, err
	}

	feature, err := nlslayer.NewFeatureWithNewId(
		inp.Type,
		geometry,
	)
	if err != nil {
		return nlslayer.Feature{}, err
	}

	if inp.Properties != nil {
		feature.UpdateProperties(inp.Properties)
	}

	if layer.Sketch() == nil {
		featureCollection := nlslayer.NewFeatureCollection(
			"FeatureCollection",
			[]nlslayer.Feature{*feature},
		)

		sketchInfo := nlslayer.NewSketchInfo(
			nil,
			featureCollection,
		)

		layer.SetIsSketch(true)
		layer.SetSketch(sketchInfo)
	} else {
		layer.Sketch().FeatureCollection().AddFeature(*feature)
	}

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nlslayer.Feature{}, err
	}

	tx.Commit()
	return *feature, nil
}

func (i *NLSLayer) UpdateGeoJSONFeature(ctx context.Context, inp interfaces.UpdateNLSLayerGeoJSONFeatureParams, operator *usecase.Operator) (_ nlslayer.Feature, err error) {
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

	layer, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return nlslayer.Feature{}, err
	}

	if layer.Sketch() == nil || layer.Sketch().FeatureCollection() == nil || layer.Sketch().FeatureCollection().Features() == nil || len(layer.Sketch().FeatureCollection().Features()) == 0 {
		return nlslayer.Feature{}, interfaces.ErrFeatureNotFound
	}

	var updatedFeature nlslayer.Feature
	var errUp error

	if inp.Geometry != nil {
		geometry, err := nlslayer.NewGeometryFromMap(*inp.Geometry)
		if err != nil {
			return nlslayer.Feature{}, err
		}
		updatedFeature, errUp = layer.Sketch().FeatureCollection().UpdateFeatureGeometry(inp.FeatureID, geometry)
		if errUp != nil {
			return nlslayer.Feature{}, errUp
		}
	}

	if inp.Properties != nil {
		updatedFeature, errUp = layer.Sketch().FeatureCollection().UpdateFeatureProperty(inp.FeatureID, *inp.Properties)
		if errUp != nil {
			return nlslayer.Feature{}, errUp
		}
	}

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nlslayer.Feature{}, err
	}

	tx.Commit()
	return updatedFeature, nil
}

func (i *NLSLayer) DeleteGeoJSONFeature(ctx context.Context, inp interfaces.DeleteNLSLayerGeoJSONFeatureParams, operator *usecase.Operator) (_ id.FeatureID, err error) {
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

	layer, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return id.FeatureID{}, err
	}

	if layer.Sketch() == nil || layer.Sketch().FeatureCollection() == nil || layer.Sketch().FeatureCollection().Features() == nil || len(layer.Sketch().FeatureCollection().Features()) == 0 {
		return id.FeatureID{}, interfaces.ErrFeatureNotFound
	}

	err = layer.Sketch().FeatureCollection().RemoveFeature(inp.FeatureID)
	if err != nil {
		return id.FeatureID{}, err
	}

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return id.FeatureID{}, err
	}

	tx.Commit()
	return inp.FeatureID, nil
}
