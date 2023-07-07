package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
)

func (r *mutationResolver) CreateStorytelling(ctx context.Context, input gqlmodel.CreateStoryInput) (*gqlmodel.StoryPayload, error) {
	sId, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.CreateStoryInput{
		SceneID: sId,
		Title:   input.Title,
		Index:   input.Index,
	}

	res, err := usecases(ctx).StoryTelling.Create(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPayload{
		Story: gqlmodel.ToStory(res),
	}, nil
}

func (r *mutationResolver) UpdateStorytelling(ctx context.Context, input gqlmodel.UpdateStoryInput) (*gqlmodel.StoryPayload, error) {
	sId, err := gqlmodel.ToID[id.Story](input.StoryID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.UpdateStoryInput{
		StoryID: sId,
		Title:   input.Title,
		Index:   input.Index,
	}

	res, err := usecases(ctx).StoryTelling.Update(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPayload{
		Story: gqlmodel.ToStory(res),
	}, nil
}

func (r *mutationResolver) DeleteStorytelling(ctx context.Context, input gqlmodel.DeleteStoryInput) (*gqlmodel.DeleteStoryPayload, error) {
	sId, err := gqlmodel.ToID[id.Story](input.StoryID)
	if err != nil {
		return nil, err
	}

	if _, err := usecases(ctx).StoryTelling.Remove(ctx, sId, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteStoryPayload{
		StoryID: input.StoryID,
	}, nil
}

func (r *mutationResolver) PublishStorytelling(ctx context.Context, input gqlmodel.PublishStoryInput) (*gqlmodel.StoryPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) MoveStorytelling(ctx context.Context, input gqlmodel.MoveStoryInput) (*gqlmodel.MoveStoryPayload, error) {
	scId, sId, err := gqlmodel.ToID2[id.Scene, id.Story](input.SceneID, input.StoryID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.MoveStoryInput{
		StoryID: sId,
		Index:   input.Index,
	}

	_, i, err := usecases(ctx).StoryTelling.Move(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	stories, err := usecases(ctx).StoryTelling.FetchByScene(ctx, scId, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveStoryPayload{
		StoryID: input.StoryID,
		Index:   i,
		Stories: gqlmodel.ToStories(*stories),
	}, nil
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
