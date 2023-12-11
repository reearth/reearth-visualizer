package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/nlslayer/nlslayerops"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type NLSLayer struct {
	common
	commonSceneLock
	nlslayerRepo  repo.NLSLayer
	sceneLockRepo repo.SceneLock
	transaction   usecasex.Transaction
}

func NewNLSLayer(r *repo.Container) interfaces.NLSLayer {
	return &NLSLayer{
		commonSceneLock: commonSceneLock{sceneLockRepo: r.SceneLock},
		nlslayerRepo:    r.NLSLayer,
		sceneLockRepo:   r.SceneLock,
		transaction:     r.Transaction,
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

	err = i.nlslayerRepo.Save(ctx, layerSimple)
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
	layers, err := i.fetchAllChildren(ctx, l)
	if err != nil {
		return lid, nil, err
	}
	layers = append(layers, l.ID())
	err = i.nlslayerRepo.RemoveAll(ctx, layers)
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
	return layer, nil
}
