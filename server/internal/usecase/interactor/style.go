package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/sceneops"
	"github.com/reearth/reearthx/usecasex"
	"go.opentelemetry.io/otel"
)

type Style struct {
	common
	commonSceneLock
	styleRepo     repo.Style
	sceneLockRepo repo.SceneLock
	transaction   usecasex.Transaction
	redis         gateway.RedisGateway
}

func NewStyle(r *repo.Container, redis gateway.RedisGateway) interfaces.Style {
	return &Style{
		commonSceneLock: commonSceneLock{sceneLockRepo: r.SceneLock},
		styleRepo:       r.Style,
		sceneLockRepo:   r.SceneLock,
		transaction:     r.Transaction,
		redis:           redis,
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

	tx.Commit()

	err = setToCache[*scene.Style](ctx, i.redis, scene.StyleCacheKey(style.ID()), style)
	if err != nil {
		return nil, err
	}

	return style, nil
}

func (i *Style) UpdateStyle(ctx context.Context, param interfaces.UpdateStyleInput, operator *usecase.Operator) (*scene.Style, error) {
	tr := otel.Tracer("interactor")
	_, span := tr.Start(ctx, "Style.UpdateStyle")
	defer span.End()

	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			span.RecordError(err2)
			err = err2
		}
	}()

	var style *scene.Style
	_, redisSpan := tr.Start(ctx, "Style.UpdateStyle.RedisGetValue")
	style, err = getFromCache[*scene.Style](ctx, i.redis, scene.StyleCacheKey(param.StyleID))
	if err != nil {
		redisSpan.RecordError(err)
		redisSpan.End()
		return nil, err
	}
	redisSpan.End()

	if style == nil {
		_, dbSpan := tr.Start(ctx, "Style.UpdateStyle.DBFindById")
		style, err = i.styleRepo.FindByID(ctx, param.StyleID)
		if err != nil {
			dbSpan.RecordError(err)
			dbSpan.End()
			return nil, err
		}
		dbSpan.End()

		if style == nil {
			return nil, nil
		}
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

	tx.Commit()

	_, dbSpan := tr.Start(ctx, "Style.UpdateStyle.RedisSetValue")
	err = setToCache[*scene.Style](ctx, i.redis, scene.StyleCacheKey(style.ID()), style)
	if err != nil {
		dbSpan.RecordError(err)
		dbSpan.End()
		return nil, err
	}

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

	var style *scene.Style
	style, err = getFromCache[*scene.Style](ctx, i.redis, scene.StyleCacheKey(styleID))
	if err != nil {
		return styleID, err
	}

	if style == nil {
		style, err = i.styleRepo.FindByID(ctx, styleID)
		if err != nil {
			return styleID, err
		}
	}

	// if err := i.CanWriteScene(s.Scene(), operator); err != nil {
	// 	return styleID, err
	// }

	if err := i.CheckSceneLock(ctx, style.Scene()); err != nil {
		return styleID, err
	}

	err = i.styleRepo.Remove(ctx, styleID)
	if err != nil {
		return
	}

	tx.Commit()

	err = deleteFromCache(ctx, i.redis, scene.StyleCacheKey(styleID))
	if err != nil {
		return styleID, err
	}

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

	var style *scene.Style
	style, err = getFromCache[*scene.Style](ctx, i.redis, scene.StyleCacheKey(styleID))
	if err != nil {
		return nil, err
	}

	if style == nil {
		style, err = i.styleRepo.FindByID(ctx, styleID)
		if err != nil {
			return nil, err
		}
	}

	// if err := i.CanWriteScene(s.Scene(), operator); err != nil {
	// 	return nil, err
	// }

	duplicatedStyle := style.Duplicate()

	if err := i.styleRepo.Save(ctx, *duplicatedStyle); err != nil {
		return nil, err
	}

	tx.Commit()

	err = setToCache[*scene.Style](ctx, i.redis, scene.StyleCacheKey(styleID), duplicatedStyle)
	if err != nil {
		return nil, err
	}

	return duplicatedStyle, nil
}
