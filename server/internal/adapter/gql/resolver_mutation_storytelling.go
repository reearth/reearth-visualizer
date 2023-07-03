package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateStorytelling(ctx context.Context, input gqlmodel.CreateStoryInput) (*gqlmodel.StoryPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) UpdateStorytelling(ctx context.Context, input gqlmodel.UpdateStoryInput) (*gqlmodel.StoryPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) DeleteStorytelling(ctx context.Context, input gqlmodel.DeleteStoryInput) (*gqlmodel.DeleteStoryPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) PublishStorytelling(ctx context.Context, input gqlmodel.PublishStoryInput) (*gqlmodel.StoryPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) MoveStorytelling(ctx context.Context, input gqlmodel.PublishStoryInput) (*gqlmodel.StoryPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) CreatePage(ctx context.Context, input gqlmodel.CreatePageInput) (*gqlmodel.CreatePagePayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) UpdatePage(ctx context.Context, input gqlmodel.UpdatePageInput) (*gqlmodel.UpdatePagePayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) RemovePage(ctx context.Context, input gqlmodel.DeletePageInput) (*gqlmodel.DeletePagePayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) MovePage(ctx context.Context, input gqlmodel.MovePageInput) (*gqlmodel.MovePagePayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) CreateBlock(ctx context.Context, input gqlmodel.CreateBlockInput) (*gqlmodel.CreateBlockPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) MoveBlock(ctx context.Context, input gqlmodel.MoveBlockInput) (*gqlmodel.MoveBlockPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) RemoveBlock(ctx context.Context, input gqlmodel.RemoveBlockInput) (*gqlmodel.RemoveBlockPayload, error) {
	return nil, ErrNotImplemented
}
