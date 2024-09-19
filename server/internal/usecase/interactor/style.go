package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearth/server/pkg/scene/sceneops"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/usecasex"
)

type Style struct {
	common
	commonSceneLock
	styleRepo     repo.Style
	projectRepo   repo.Project
	sceneRepo     repo.Scene
	sceneLockRepo repo.SceneLock
	transaction   usecasex.Transaction
}

func NewStyle(r *repo.Container) interfaces.Style {
	return &Style{
		commonSceneLock: commonSceneLock{sceneLockRepo: r.SceneLock},
		styleRepo:       r.Style,
		projectRepo:     r.Project,
		sceneRepo:       r.Scene,
		sceneLockRepo:   r.SceneLock,
		transaction:     r.Transaction,
	}
}

func (i *Style) Fetch(ctx context.Context, ids id.StyleIDList, operator *usecase.Operator) (*scene.StyleList, error) {
	return i.styleRepo.FindByIDs(ctx, ids)
}

func (i *Style) FetchByScene(ctx context.Context, sid id.SceneID, _ *usecase.Operator) (*scene.StyleList, error) {
	return i.styleRepo.FindByScene(ctx, sid)
}

func (i *Style) AddStyle(ctx context.Context, param interfaces.AddStyleInput, operator *usecase.Operator) (*scene.Style, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	// if err := i.CanWriteScene(param.SceneID, operator); err != nil {
	// 	return nil, interfaces.ErrOperationDenied
	// }

	style, err := sceneops.Style{
		SceneID: param.SceneID,
		Value:   param.Value,
		Name:    param.Name,
	}.Initialize()
	if err != nil {
		return nil, err
	}

	if err := i.styleRepo.Save(ctx, *style); err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, style.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return style, nil
}

func (i *Style) UpdateStyle(ctx context.Context, param interfaces.UpdateStyleInput, operator *usecase.Operator) (*scene.Style, error) {

	tx, err := i.transaction.Begin(ctx)

	if err != nil {
		return nil, err
	}

	ctx = tx.Context()

	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	style, err := i.styleRepo.FindByID(ctx, param.StyleID)
	if err != nil {
		return nil, err
	}

	if param.Name != nil {
		style.Rename(*param.Name)
	}

	if param.Value != nil {
		style.UpdateValue(param.Value)
	}

	if err := i.styleRepo.Save(ctx, *style); err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, style.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return style, nil
}

func (i *Style) RemoveStyle(ctx context.Context, styleID id.StyleID, operator *usecase.Operator) (_ id.StyleID, err error) {
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

	s, err := i.styleRepo.FindByID(ctx, styleID)
	if err != nil {
		return styleID, err
	}

	// if err := i.CanWriteScene(s.Scene(), operator); err != nil {
	// 	return styleID, err
	// }

	if err := i.CheckSceneLock(ctx, s.Scene()); err != nil {
		return styleID, err
	}

	err = i.styleRepo.Remove(ctx, styleID)
	if err != nil {
		return
	}

	err = updateProjectUpdatedAtByScene(ctx, s.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return styleID, err
	}

	tx.Commit()
	return styleID, nil
}

func (i *Style) DuplicateStyle(ctx context.Context, styleID id.StyleID, operator *usecase.Operator) (*scene.Style, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	style, err := i.styleRepo.FindByID(ctx, styleID)
	if err != nil {
		return nil, err
	}

	// if err := i.CanWriteScene(s.Scene(), operator); err != nil {
	// 	return nil, err
	// }

	duplicatedStyle := style.Duplicate()

	if err := i.styleRepo.Save(ctx, *duplicatedStyle); err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, style.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return duplicatedStyle, nil
}

func (i *Style) ImportStyles(ctx context.Context, sceneData map[string]interface{}) (scene.StyleList, error) {
	sceneJSON, err := builder.ParseSceneJSON(ctx, sceneData)
	if err != nil {
		return nil, err
	}
	sceneID, err := id.SceneIDFrom(sceneJSON.ID)
	if err != nil {
		return nil, err
	}

	styleIDs := idx.List[id.Style]{}
	styles := []*scene.Style{}
	for _, layerStyleJson := range sceneJSON.LayerStyles {
		styleID, err := id.StyleIDFrom(layerStyleJson.ID)
		if err != nil {
			return nil, err
		}
		styleIDs = append(styleIDs, styleID)
		style, err := scene.NewStyle().
			ID(styleID).
			Name(layerStyleJson.Name).
			Value((*scene.StyleValue)(layerStyleJson.Value)).
			Scene(sceneID).
			Build()
		if err != nil {
			return nil, err
		}
		styles = append(styles, style)
	}

	// save
	styleList := scene.StyleList(styles)
	if err := i.styleRepo.SaveAll(ctx, styleList); err != nil {
		return nil, err
	}

	styles2, err := i.styleRepo.FindByIDs(ctx, styleIDs)
	if err != nil {
		return nil, err
	}
	return *styles2, nil
}
