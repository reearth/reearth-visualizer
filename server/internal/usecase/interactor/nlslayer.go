package interactor

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"time"

	"net/http"
	"path"

	"github.com/reearth/orb"
	"github.com/reearth/orb/geojson"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrParentLayerNotFound                  error = errors.New("parent layer not found")
	ErrPluginNotFound                       error = errors.New("plugin not found")
	ErrExtensionNotFound                    error = errors.New("extension not found")
	ErrInfoboxNotFound                      error = errors.New("infobox not found")
	ErrInfoboxAlreadyExists                 error = errors.New("infobox already exists")
	ErrPhotoOverlayNotFound                 error = errors.New("photoOverlay not found")
	ErrPhotoOverlayAlreadyExists            error = errors.New("photoOverlay already exists")
	ErrCannotAddLayerToLinkedLayerGroup     error = errors.New("cannot add layer to linked layer group")
	ErrCannotRemoveLayerToLinkedLayerGroup  error = errors.New("cannot remove layer to linked layer group")
	ErrLinkedLayerItemCannotBeMoved         error = errors.New("linked layer item cannot be moved")
	ErrLayerCannotBeMovedToLinkedLayerGroup error = errors.New("layer cannot be moved to linked layer group")
	ErrCannotMoveLayerToOtherScene          error = errors.New("layer cannot layer to other scene")
	ErrExtensionTypeMustBePrimitive         error = errors.New("extension type must be primitive")
	ErrExtensionTypeMustBeBlock             error = errors.New("extension type must be block")
	ErrInvalidExtensionType                 error = errors.New("invalid extension type")
	ErrSketchNotFound                       error = errors.New("sketch not found")
	ErrFeatureCollectionNotFound            error = errors.New("featureCollection not found")
)

type NLSLayer struct {
	common
	commonSceneLock
	nlslayerRepo  repo.NLSLayer
	sceneLockRepo repo.SceneLock
	projectRepo   repo.Project
	sceneRepo     repo.Scene
	propertyRepo  repo.Property
	pluginRepo    repo.Plugin
	policyRepo    repo.Policy
	file          gateway.File
	workspaceRepo accountrepo.Workspace
	transaction   usecasex.Transaction

	propertySchemaRepo repo.PropertySchema
}

func NewNLSLayer(r *repo.Container, gr *gateway.Container) interfaces.NLSLayer {
	return &NLSLayer{
		commonSceneLock: commonSceneLock{sceneLockRepo: r.SceneLock},
		nlslayerRepo:    r.NLSLayer,
		sceneLockRepo:   r.SceneLock,
		projectRepo:     r.Project,
		sceneRepo:       r.Scene,
		propertyRepo:    r.Property,
		pluginRepo:      r.Plugin,
		policyRepo:      r.Policy,
		file:            gr.File,
		workspaceRepo:   r.Workspace,
		transaction:     r.Transaction,

		propertySchemaRepo: r.PropertySchema,
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

	builder := nlslayer.NewNLSLayerSimple().
		NewID().
		Scene(inp.SceneID).
		Config(inp.Config).
		LayerType(inp.LayerType).
		Title(inp.Title).
		Index(inp.Index)
	if inp.Visible != nil {
		builder.IsVisible(*inp.Visible)
	} else {
		builder.IsVisible(true)
	}
	var layerSimple *nlslayer.NLSLayerSimple
	if inp.LayerType.IsValidLayerType() {
		layerSimple, err = builder.Build()
		if err != nil {
			return nil, err
		}
	} else {
		return nil, errors.New("layer type must be 'simple' or 'group'")
	}

	if err != nil {
		return nil, err
	}

	s, err := i.sceneRepo.FindByID(ctx, inp.SceneID)
	if err != nil {
		return nil, err
	}

	ws, err := i.workspaceRepo.FindByID(ctx, s.Workspace())
	if err != nil {
		return nil, err
	}

	if policyID := operator.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return nil, err
		}
		s, err := i.nlslayerRepo.CountByScene(ctx, s.ID())
		if err != nil {
			return nil, err
		}
		if err := p.EnforceNLSLayersCount(s + 1); err != nil {
			return nil, err
		}
	}

	// geojson validate
	if data, ok := (*inp.Config)["data"].(map[string]interface{}); ok {
		if type_, ok := data["type"].(string); ok && type_ == "geojson" {
			if url, ok := data["url"].(string); ok {
				maxDownloadSize := 10 * 1024 * 1024 // 10MB
				buf, err := downloadToBuffer(url, int64(maxDownloadSize))
				if err != nil {
					// If the download fails, it will be downloaded directly from the Asset repository.
					if err := i.validateGeoJsonOfAssets(ctx, path.Base(url)); err != nil {
						return nil, err
					}
				} else {
					if err := validateGeoJSONFeatureCollection(buf.Bytes()); err != nil {
						return nil, err
					}
				}
			} else if value, ok := data["value"].(map[string]interface{}); ok {
				geojsonData, err := json.Marshal(value)
				if err != nil {
					return nil, err
				}
				if err := validateGeoJSONFeatureCollection(geojsonData); err != nil {
					return nil, err
				}
			}
		}
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

	err = updateProjectUpdatedAtByScene(ctx, layerSimple.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
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

	l, err := i.nlslayerRepo.FindByID(ctx, lid)
	if err != nil {
		return lid, nil, err
	}
	if err := i.CanWriteScene(l.Scene(), operator); err != nil {
		return lid, nil, err
	}

	if err := i.CheckSceneLock(ctx, l.Scene()); err != nil {
		return lid, nil, err
	}

	parentLayer, err := i.nlslayerRepo.FindParentByID(ctx, lid)
	if err != nil && err != rerror.ErrNotFound {
		return lid, nil, err
	}
	if parentLayer != nil {
		if l.Scene() != parentLayer.Scene() {
			return lid, nil, errors.New("invalid layer")
		}
		parentLayer.Children().RemoveLayer(lid)
		err = i.nlslayerRepo.Save(ctx, parentLayer)
		if err != nil {
			return lid, nil, err
		}
	}
	layers, err := i.fetchAllChildren(ctx, l)
	if err != nil {
		return lid, nil, err
	}
	layers = append(layers, l.ID())
	err = i.nlslayerRepo.RemoveAll(ctx, layers)
	if err != nil {
		return lid, nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, l.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return lid, nil, err
	}

	tx.Commit()
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

	layer, err := i.nlslayerRepo.FindByID(ctx, inp.LayerID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, err
	}

	if inp.Name != nil {
		layer.Rename(*inp.Name)
		if config := layer.Config(); config != nil {
			c := *config
			if properties, ok := c["properties"].(map[string]interface{}); ok {
				properties["name"] = *inp.Name
			}
		}
	}

	if inp.Visible != nil {
		layer.SetVisible(*inp.Visible)
	}

	if inp.Config != nil {
		layer.UpdateConfig(inp.Config)
	}

	if inp.Index != nil {
		layer.SetIndex(inp.Index)
	}
	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
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
		return nil, ErrInfoboxAlreadyExists
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

	err = updateProjectUpdatedAtByScene(ctx, l.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return l, nil
}

func (i *NLSLayer) CreateNLSPhotoOverlay(ctx context.Context, lid id.NLSLayerID, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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

	photooverlay := l.PhotoOverlay()
	if photooverlay != nil {
		return nil, ErrPhotoOverlayAlreadyExists
	}

	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDPhotoOverlay)
	property, err := property.New().NewID().Schema(schema.ID()).Scene(l.Scene()).Build()
	if err != nil {
		return nil, err
	}
	photooverlay = nlslayer.NewPhotoOverlay(property.ID())
	l.SetPhotoOverlay(photooverlay)

	err = i.propertyRepo.Save(ctx, property)
	if err != nil {
		return nil, err
	}
	err = i.nlslayerRepo.Save(ctx, l)
	if err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, l.Scene(), i.projectRepo, i.sceneRepo)
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
		return nil, ErrInfoboxNotFound
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

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *NLSLayer) RemoveNLSPhotoOverlay(ctx context.Context, layerID id.NLSLayerID, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {

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

	photooverlay := layer.PhotoOverlay()
	if photooverlay == nil {
		return nil, ErrPhotoOverlayNotFound
	}

	layer.SetPhotoOverlay(nil)

	err = i.propertyRepo.Remove(ctx, photooverlay.Property())
	if err != nil {
		return nil, err
	}

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *NLSLayer) getPlugin(ctx context.Context, p *id.PluginID, e *id.PluginExtensionID, filter *repo.SceneFilter) (*plugin.Plugin, *plugin.Extension, error) {
	if p == nil {
		return nil, nil, nil
	}
	var plugin *plugin.Plugin
	var err error

	if filter == nil {
		plugin, err = i.pluginRepo.FindByID(ctx, *p)
	} else {
		plugin, err = i.pluginRepo.Filtered(*filter).FindByID(ctx, *p)
	}
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil, ErrPluginNotFound
		}
		return nil, nil, err
	}

	if e == nil {
		return plugin, nil, nil
	}

	extension := plugin.Extension(*e)
	if extension == nil {
		return nil, nil, ErrExtensionNotFound
	}

	return plugin, extension, nil
}

func (i *NLSLayer) getInfoboxBlockPlugin(ctx context.Context, pid string, eid string, filter *repo.SceneFilter) (*id.PluginID, *id.PluginExtensionID, *plugin.Extension, error) {

	pluginID, err := id.PluginIDFrom(pid)
	if err != nil {
		return nil, nil, nil, err
	}

	extensionID := id.PluginExtensionID(eid)
	_, extension, err := i.getPlugin(ctx, &pluginID, &extensionID, filter)
	if err != nil {
		return nil, nil, nil, err
	}

	if extension.Type() != plugin.ExtensionTypeInfoboxBlock {
		return nil, nil, nil, ErrExtensionTypeMustBeBlock
	}

	return &pluginID, &extensionID, extension, nil
}

func (i *NLSLayer) addNewProperty(ctx context.Context, schemaID id.PropertySchemaID, sceneID id.SceneID, filter *repo.SceneFilter) (*property.Property, error) {
	prop, err := property.New().NewID().Schema(schemaID).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}
	if filter == nil {
		if err = i.propertyRepo.Save(ctx, prop); err != nil {
			return nil, err
		}
	} else {
		if err = i.propertyRepo.Filtered(*filter).Save(ctx, prop); err != nil {
			return nil, err
		}
	}
	return prop, nil
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
		return nil, nil, ErrInfoboxNotFound
	}

	_, _, extension, err := i.getInfoboxBlockPlugin(ctx, inp.PluginID.String(), inp.ExtensionID.String(), nil)
	if err != nil {
		return nil, nil, err
	}

	property, err := i.addNewProperty(ctx, extension.Schema(), l.Scene(), nil)
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

	err = i.nlslayerRepo.Save(ctx, l)
	if err != nil {
		return nil, nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, l.Scene(), i.projectRepo, i.sceneRepo)
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
		return inp.InfoboxBlockID, nil, -1, ErrInfoboxNotFound
	}

	infobox.Move(inp.InfoboxBlockID, inp.Index)

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return inp.InfoboxBlockID, nil, -1, err
	}

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
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
		return inp.InfoboxBlockID, nil, ErrInfoboxNotFound
	}

	infobox.Remove(inp.InfoboxBlockID)

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return inp.InfoboxBlockID, nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
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

	layer, err := i.nlslayerRepo.FindByID(ctx, lid)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, err
	}

	duplicatedLayer := layer.Duplicate()

	err = i.nlslayerRepo.Save(ctx, duplicatedLayer)
	if err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return duplicatedLayer, nil
}

func (i *NLSLayer) AddOrUpdateCustomProperties(ctx context.Context, inp interfaces.AddOrUpdateCustomPropertiesInput, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, interfaces.ErrOperationDenied
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

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *NLSLayer) ChangeCustomPropertyTitle(ctx context.Context, inp interfaces.AddOrUpdateCustomPropertiesInput, oldTitle string, newTitle string, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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

	if layer.Sketch() == nil || layer.Sketch().FeatureCollection() == nil {
		return nil, ErrSketchNotFound
	}
	if err := i.CanWriteScene(layer.Scene(), operator); err != nil {
		return nil, interfaces.ErrOperationDenied
	}

	titleExists := false
	for _, feature := range layer.Sketch().FeatureCollection().Features() {
		if props := feature.Properties(); props != nil && *props != nil {
			if _, ok := (*props)[oldTitle]; ok {
				titleExists = true
			}
			if _, ok := (*props)[newTitle]; ok {
				return nil, fmt.Errorf("property with title %s already exists", newTitle)
			}
		}
	}

	if titleExists {
		for _, feature := range layer.Sketch().FeatureCollection().Features() {
			if props := feature.Properties(); props != nil {
				for k, v := range *props {
					if k == oldTitle {
						value := v
						delete(*props, k)
						(*props)[newTitle] = value
					}
				}
			}
		}
	}

	layer.Sketch().SetCustomPropertySchema(&inp.Schema)

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return layer, nil
}

func (i *NLSLayer) RemoveCustomProperty(ctx context.Context, inp interfaces.AddOrUpdateCustomPropertiesInput, removedTitle string, operator *usecase.Operator) (_ nlslayer.NLSLayer, err error) {
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
	if layer.Sketch() == nil || layer.Sketch().FeatureCollection() == nil {
		return nil, ErrSketchNotFound
	}

	// Check if removedTitle exists
	titleExists := false
	for _, feature := range layer.Sketch().FeatureCollection().Features() {
		if props := feature.Properties(); props != nil {
			if _, ok := (*props)[removedTitle]; ok {
				titleExists = true
				break
			}
		}
	}

	if titleExists {
		for _, feature := range layer.Sketch().FeatureCollection().Features() {
			if props := feature.Properties(); props != nil && *props != nil {
				for k := range *props {
					if k == removedTitle {
						delete(*props, k)
					}
				}
			}
		}
	}

	layer.Sketch().SetCustomPropertySchema(&inp.Schema)

	err = i.nlslayerRepo.Save(ctx, layer)
	if err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
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

	feature, err := nlslayer.NewFeature(
		id.NewFeatureID(),
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

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
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

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
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

	err = updateProjectUpdatedAtByScene(ctx, layer.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return id.FeatureID{}, err
	}

	tx.Commit()
	return inp.FeatureID, nil
}

func (i *NLSLayer) ImportNLSLayers(ctx context.Context, sceneID id.SceneID, data *[]byte) (nlslayer.NLSLayerList, error) {

	sceneJSON, err := builder.ParseSceneJSONByByte(data)
	if err != nil {
		return nil, err
	}

	if sceneJSON.NLSLayers == nil {
		return nil, nil
	}

	filter := Filter(sceneID)

	nlayerIDs := id.NLSLayerIDList{}
	for _, nlsLayerJSON := range sceneJSON.NLSLayers {

		for k, v := range nlsLayerJSON.Children {
			fmt.Println("Unsupported nlsLayerJSON.Children ", k, v)
		}

		newNLSLayerID := id.NewNLSLayerID()
		nlayerIDs = append(nlayerIDs, newNLSLayerID)

		// Replace new layer id
		*data = bytes.Replace(*data, []byte(nlsLayerJSON.ID), []byte(newNLSLayerID.String()), -1)

		nlBuilder := nlslayer.New().
			ID(newNLSLayerID).Simple().
			Scene(sceneID).
			Index(nlsLayerJSON.Index).
			Title(nlsLayerJSON.Title).
			LayerType(nlslayer.LayerType(nlsLayerJSON.LayerType)).
			Config((*nlslayer.Config)(nlsLayerJSON.Config)).
			IsVisible(nlsLayerJSON.IsVisible).
			IsSketch(nlsLayerJSON.IsSketch)

		// Infobox --------
		if nlsLayerJSON.Infobox != nil {

			nlsInfoboxJSON := nlsLayerJSON.Infobox
			betaInfoboxSchema := builtin.GetPropertySchema(builtin.PropertySchemaIDBetaInfobox)
			propI, err := i.addNewProperty(ctx, betaInfoboxSchema.ID(), sceneID, &filter)
			if err != nil {
				return nil, err
			}
			builder.PropertyUpdate(ctx, propI, i.propertyRepo, i.propertySchemaRepo, nlsInfoboxJSON.Property)

			infobox := nlslayer.NewInfobox(nil, propI.ID())
			nlBuilder.Infobox(infobox)

			blocks := make([]*nlslayer.InfoboxBlock, 0)
			for _, nlsInfoboxBlockJSON := range nlsLayerJSON.Infobox.Blocks {

				pluginId, extensionId, extension, err := i.getInfoboxBlockPlugin(ctx, nlsInfoboxBlockJSON.PluginId, nlsInfoboxBlockJSON.ExtensionId, &filter)
				if err != nil {
					return nil, err
				}

				propB, err := i.addNewProperty(ctx, extension.Schema(), sceneID, &filter)
				if err != nil {
					return nil, err
				}
				builder.PropertyUpdate(ctx, propB, i.propertyRepo, i.propertySchemaRepo, nlsInfoboxBlockJSON.Property)
				for k, v := range nlsInfoboxBlockJSON.Plugins {
					fmt.Println("Unsupported nlsInfoboxBlockJSON.Plugins ", k, v)
				}

				block, err := nlslayer.NewInfoboxBlock().
					NewID().
					Plugin(*pluginId).
					Extension(*extensionId).
					Property(propB.ID()).
					Build()
				if err != nil {
					return nil, err
				}

				blocks = append(blocks, block)
			}

			nlBuilder = nlBuilder.Infobox(nlslayer.NewInfobox(blocks, propI.ID()))
		}

		// PhotoOverlay --------
		if nlsLayerJSON.PhotoOverlay != nil {

			nlsPhotoOverlayJSON := nlsLayerJSON.PhotoOverlay
			betaPhotoOverlaySchema := builtin.GetPropertySchema(builtin.PropertySchemaIDPhotoOverlay)
			propI, err := i.addNewProperty(ctx, betaPhotoOverlaySchema.ID(), sceneID, &filter)
			if err != nil {
				return nil, err
			}
			builder.PropertyUpdate(ctx, propI, i.propertyRepo, i.propertySchemaRepo, nlsPhotoOverlayJSON.Property)

			photooverlay := nlslayer.NewPhotoOverlay(propI.ID())
			nlBuilder.PhotoOverlay(photooverlay)

			nlBuilder = nlBuilder.PhotoOverlay(nlslayer.NewPhotoOverlay(propI.ID()))
		}

		// SketchInfo --------
		if nlsLayerJSON.SketchInfo != nil {
			sketchInfoJSON := nlsLayerJSON.SketchInfo

			featureCollectionJSON := sketchInfoJSON.FeatureCollection

			features := make([]nlslayer.Feature, 0)
			for _, featureJSON := range featureCollectionJSON.Features {

				var geometry nlslayer.Geometry
				for _, g := range featureJSON.Geometry {
					if geometryMap, ok := g.(map[string]any); ok {
						geometry, err = nlslayer.NewGeometryFromMap(geometryMap)
						if err != nil {
							return nil, err
						}
					}
				}

				feature, err := nlslayer.NewFeature(
					id.NewFeatureID(),
					featureJSON.Type,
					geometry,
				)
				if err != nil {
					return nil, err
				}

				feature.UpdateProperties(featureJSON.Properties)
				features = append(features, *feature)
			}

			featureCollection := nlslayer.NewFeatureCollection(
				featureCollectionJSON.Type,
				features,
			)

			sketchInfo := nlslayer.NewSketchInfo(
				sketchInfoJSON.PropertySchema,
				featureCollection,
			)

			nlBuilder = nlBuilder.Sketch(sketchInfo)
		}

		nlayer, err := nlBuilder.Build()
		if err != nil {
			return nil, err
		}

		if err := i.nlslayerRepo.Filtered(filter).Save(ctx, nlayer); err != nil {
			return nil, err
		}

	}

	results, err := i.nlslayerRepo.Filtered(filter).FindByIDs(ctx, nlayerIDs)
	if err != nil {
		return nil, err
	}
	return results, nil
}

func downloadToBuffer(url string, maxDownloadSize int64) (*bytes.Buffer, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := resp.Body.Close(); err2 != nil && err == nil {
			err = err2
		}
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download file, status code: %d", resp.StatusCode)
	}
	if resp.ContentLength > maxDownloadSize {
		return nil, fmt.Errorf("file too large: %d bytes", resp.ContentLength)
	}
	reader := io.LimitReader(resp.Body, maxDownloadSize)

	var buf bytes.Buffer
	_, err = io.Copy(&buf, reader)
	if err != nil {
		return nil, err
	}

	return &buf, nil
}

func (i *NLSLayer) validateGeoJsonOfAssets(ctx context.Context, assetFileName string) error {
	fileData, err := i.file.ReadAsset(ctx, assetFileName)
	if err != nil {
		return err
	}
	defer func() {
		if err2 := fileData.Close(); err2 != nil && err == nil {
			err = err2
		}
	}()
	var buf bytes.Buffer
	if _, err := io.Copy(&buf, fileData); err != nil {
		return err
	}
	if err := validateGeoJSONFeatureCollection(buf.Bytes()); err != nil {
		return err
	}
	return nil
}

func validateGeoJSONFeatureCollection(data []byte) error {
	var validationErrors []error

	f, err := geojson.UnmarshalFeature(data)
	if f != nil && err == nil {
		if f.Type == "Feature" {
			if errs := validateGeoJSONFeature(f); len(errs) > 0 {
				validationErrors = append(validationErrors, errs...)
			}
		} else {
			validationErrors = append(validationErrors, errors.New("Invalid feature type"))
		}
	} else {
		fc, err := geojson.UnmarshalFeatureCollection(data)
		if fc == nil || err != nil {
			validationErrors = append(validationErrors, errors.New("Invalid GeoJSON data"))
		} else {
			if fc.BBox != nil && !fc.BBox.Valid() {
				validationErrors = append(validationErrors, fmt.Errorf("Invalid BBox: %w", err))
			}
			for _, feature := range fc.Features {
				if errs := validateGeoJSONFeature(feature); len(errs) > 0 {
					validationErrors = append(validationErrors, errs...)
				}
			}
		}
	}

	if len(validationErrors) > 0 {
		return fmt.Errorf("Validation failed: %v", validationErrors)
	}

	return nil
}

func validateGeoJSONFeature(feature *geojson.Feature) []error {
	var validationErrors []error

	if feature.Geometry == nil {
		validationErrors = append(validationErrors, errors.New("Geometry is missing"))
		return validationErrors
	}

	switch g := feature.Geometry.(type) {
	case orb.Point:
		if !isValidLatLon(g) {
			validationErrors = append(validationErrors, errors.New("Point latitude or longitude is invalid"))
		}
	case orb.MultiPoint:
		if len(g) == 0 {
			validationErrors = append(validationErrors, errors.New("MultiPoint must contain at least one coordinate"))
		}
		for _, point := range g {
			if !isValidLatLon(point) {
				validationErrors = append(validationErrors, errors.New("MultiPoint contains invalid latitude or longitude"))
			}
		}
	case orb.LineString:
		if len(g) < 2 {
			validationErrors = append(validationErrors, errors.New("LineString must contain at least two coordinates"))
		}
		for _, coords := range g {
			if !isValidLatLon(coords) {
				validationErrors = append(validationErrors, errors.New("LineString contains invalid latitude or longitude"))
			}
		}
	case orb.MultiLineString:
		if len(g) == 0 {
			validationErrors = append(validationErrors, errors.New("MultiLineString must contain at least one LineString"))
		}
		for _, lineString := range g {
			if len(lineString) < 2 {
				validationErrors = append(validationErrors, errors.New("MultiLineString contains a LineString with fewer than two coordinates"))
			}
			for _, coords := range lineString {
				if !isValidLatLon(coords) {
					validationErrors = append(validationErrors, errors.New("MultiLineString contains invalid latitude or longitude"))
				}
			}
		}
	case orb.Polygon:
		if len(g) == 0 {
			validationErrors = append(validationErrors, errors.New("Polygon must contain coordinates"))
		}
		for _, ring := range g {
			if len(ring) < 4 || !pointsEqual(ring[0], ring[len(ring)-1]) {
				validationErrors = append(validationErrors, errors.New("Polygon ring is not closed"))
			}
			for _, coords := range ring {
				if !isValidLatLon(coords) {
					validationErrors = append(validationErrors, errors.New("Polygon contains invalid latitude or longitude"))
				}
			}
		}
	case orb.MultiPolygon:
		if len(g) == 0 {
			validationErrors = append(validationErrors, errors.New("MultiPolygon must contain at least one Polygon"))
		}
		for _, polygon := range g {
			for _, ring := range polygon {
				if len(ring) < 4 || !pointsEqual(ring[0], ring[len(ring)-1]) {
					validationErrors = append(validationErrors, errors.New("MultiPolygon ring is not closed"))
				}
				for _, coords := range ring {
					if !isValidLatLon(coords) {
						validationErrors = append(validationErrors, errors.New("MultiPolygon contains invalid latitude or longitude"))
					}
				}
			}
		}
	default:
		validationErrors = append(validationErrors, fmt.Errorf("Unsupported Geometry type: %T", g))
	}

	return validationErrors
}

func pointsEqual(a, b orb.Point) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func isValidLatLon(coords orb.Point) bool {
	if len(coords) != 2 && len(coords) != 3 {
		return false
	}
	lat, lon := coords[1], coords[0]
	return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}
