package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"go.opentelemetry.io/otel"
)

func (r *mutationResolver) AddStyle(ctx context.Context, input gqlmodel.AddStyleInput) (*gqlmodel.AddStylePayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	s, err := usecases(ctx).Style.AddStyle(ctx, interfaces.AddStyleInput{
		SceneID: sid,
		Name:    input.Name,
		Value:   gqlmodel.ToStyleValue(input.Value),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddStylePayload{
		Style: gqlmodel.ToStyle(s),
	}, nil
}

func (r *mutationResolver) UpdateStyle(ctx context.Context, input gqlmodel.UpdateStyleInput) (*gqlmodel.UpdateStylePayload, error) {
	tracer := otel.Tracer("gql")
	ctx, span := tracer.Start(ctx, "mutationResolver.UpdateStyle")
	defer span.End()

	sid, err := gqlmodel.ToID[id.Style](input.StyleID)
	if err != nil {
		return nil, err
	}

	s, err := usecases(ctx).Style.UpdateStyle(ctx, interfaces.UpdateStyleInput{
		StyleID: sid,
		Name:    input.Name,
		Value:   gqlmodel.ToStyleValue(input.Value),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateStylePayload{
		Style: gqlmodel.ToStyle(s),
	}, nil
}

func (r *mutationResolver) RemoveStyle(ctx context.Context, input gqlmodel.RemoveStyleInput) (*gqlmodel.RemoveStylePayload, error) {
	sid, err := gqlmodel.ToID[id.Style](input.StyleID)
	if err != nil {
		return nil, err
	}

	id, err := usecases(ctx).Style.RemoveStyle(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveStylePayload{
		StyleID: gqlmodel.IDFrom(id),
	}, nil
}

func (r *mutationResolver) DuplicateStyle(ctx context.Context, input gqlmodel.DuplicateStyleInput) (*gqlmodel.DuplicateStylePayload, error) {
	sid, err := gqlmodel.ToID[id.Style](input.StyleID)
	if err != nil {
		return nil, err
	}

	s, err := usecases(ctx).Style.DuplicateStyle(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DuplicateStylePayload{
		Style: gqlmodel.ToStyle(s),
	}, nil
}
