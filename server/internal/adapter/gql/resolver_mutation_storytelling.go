package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
)

func (r *mutationResolver) CreateStory(ctx context.Context, input gqlmodel.CreateStoryInput) (*gqlmodel.StoryPayload, error) {
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

func (r *mutationResolver) UpdateStory(ctx context.Context, input gqlmodel.UpdateStoryInput) (*gqlmodel.StoryPayload, error) {
	sceneId, storyId, err := gqlmodel.ToID2[id.Scene, id.Story](input.SceneID, input.StoryID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.UpdateStoryInput{
		SceneID: sceneId,
		StoryID: storyId,
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

func (r *mutationResolver) DeleteStory(ctx context.Context, input gqlmodel.DeleteStoryInput) (*gqlmodel.DeleteStoryPayload, error) {
	sceneId, storyId, err := gqlmodel.ToID2[id.Scene, id.Story](input.SceneID, input.StoryID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.RemoveStoryInput{
		SceneID: sceneId,
		StoryID: storyId,
	}

	if _, err := usecases(ctx).StoryTelling.Remove(ctx, inp, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteStoryPayload{
		StoryID: input.StoryID,
	}, nil
}

func (r *mutationResolver) PublishStory(ctx context.Context, input gqlmodel.PublishStoryInput) (*gqlmodel.StoryPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) MoveStory(ctx context.Context, input gqlmodel.MoveStoryInput) (*gqlmodel.MoveStoryPayload, error) {
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

func (r *mutationResolver) CreateStoryPage(ctx context.Context, input gqlmodel.CreateStoryPageInput) (*gqlmodel.StoryPagePayload, error) {
	sceneId, storyId, err := gqlmodel.ToID2[id.Scene, id.Story](input.SceneID, input.StoryID)
	if err != nil {
		return nil, err
	}

	layersId, err := gqlmodel.ToIDs[id.Layer](input.Layers)
	if err != nil {
		return nil, err
	}

	swipeableLayersIds, err := gqlmodel.ToIDs[id.Layer](input.SwipeableLayers)
	if err != nil {
		return nil, err
	}

	inp := interfaces.CreatePageParam{
		SceneID:         sceneId,
		StoryID:         storyId,
		Title:           input.Title,
		Swipeable:       input.Swipeable,
		Layers:          layersId,
		SwipeableLayers: swipeableLayersIds,
		Index:           input.Index,
	}

	story, page, err := usecases(ctx).StoryTelling.CreatePage(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPagePayload{
		Story: gqlmodel.ToStory(story),
		Page:  gqlmodel.ToPage(page),
	}, nil
}

func (r *mutationResolver) UpdateStoryPage(ctx context.Context, input gqlmodel.UpdateStoryPageInput) (*gqlmodel.StoryPagePayload, error) {
	sceneId, storyId, pageId, err := gqlmodel.ToID3[id.Scene, id.Story, id.Page](input.SceneID, input.StoryID, input.PageID)
	if err != nil {
		return nil, err
	}

	layersId, err := gqlmodel.ToIDs[id.Layer](input.Layers)
	if err != nil {
		return nil, err
	}

	swipeableLayersIds, err := gqlmodel.ToIDs[id.Layer](input.SwipeableLayers)
	if err != nil {
		return nil, err
	}

	inp := interfaces.UpdatePageParam{
		SceneID:         sceneId,
		StoryID:         storyId,
		PageID:          pageId,
		Title:           input.Title,
		Swipeable:       input.Swipeable,
		Layers:          layersId,
		SwipeableLayers: swipeableLayersIds,
		Index:           input.Index,
	}

	story, page, err := usecases(ctx).StoryTelling.UpdatePage(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPagePayload{
		Story: gqlmodel.ToStory(story),
		Page:  gqlmodel.ToPage(page),
	}, nil
}

func (r *mutationResolver) RemoveStoryPage(ctx context.Context, input gqlmodel.DeleteStoryPageInput) (*gqlmodel.DeleteStoryPagePayload, error) {
	sceneId, storyId, pageId, err := gqlmodel.ToID3[id.Scene, id.Story, id.Page](input.SceneID, input.StoryID, input.PageID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.RemovePageParam{
		SceneID: sceneId,
		StoryID: storyId,
		PageID:  pageId,
	}

	story, _, err := usecases(ctx).StoryTelling.RemovePage(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteStoryPagePayload{
		Story:  gqlmodel.ToStory(story),
		PageID: input.PageID,
	}, nil
}

func (r *mutationResolver) MoveStoryPage(ctx context.Context, input gqlmodel.MoveStoryPageInput) (*gqlmodel.MoveStoryPagePayload, error) {
	storyId, pageId, err := gqlmodel.ToID2[id.Story, id.Page](input.StoryID, input.PageID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.MovePageParam{
		StoryID: storyId,
		PageID:  pageId,
	}

	story, page, idx, err := usecases(ctx).StoryTelling.MovePage(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveStoryPagePayload{
		Story: gqlmodel.ToStory(story),
		Page:  gqlmodel.ToPage(page),
		Index: idx,
	}, nil
}

func (r *mutationResolver) AddPageLayer(ctx context.Context, input gqlmodel.PageLayerInput) (*gqlmodel.StoryPagePayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) RemovePageLayer(ctx context.Context, input gqlmodel.PageLayerInput) (*gqlmodel.StoryPagePayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) CreateStoryBlock(ctx context.Context, input gqlmodel.CreateStoryBlockInput) (*gqlmodel.CreateStoryBlockPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) MoveStoryBlock(ctx context.Context, input gqlmodel.MoveStoryBlockInput) (*gqlmodel.MoveStoryBlockPayload, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) RemoveStoryBlock(ctx context.Context, input gqlmodel.RemoveStoryBlockInput) (*gqlmodel.RemoveStoryBlockPayload, error) {
	return nil, ErrNotImplemented
}
