package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/samber/lo"
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
		SceneID:       sceneId,
		StoryID:       storyId,
		Title:         input.Title,
		Index:         input.Index,
		PanelPosition: gqlmodel.FromStoryPositionRef(input.PanelPosition),
		BgColor:       input.BgColor,

		IsBasicAuthActive: input.IsBasicAuthActive,
		BasicAuthUsername: input.BasicAuthUsername,
		BasicAuthPassword: input.BasicAuthPassword,
		Alias:             input.Alias,
		PublicTitle:       input.PublicTitle,
		PublicDescription: input.PublicDescription,
		PublicImage:       input.PublicImage,
		PublicNoIndex:     input.PublicNoIndex,
		DeletePublicImage: input.DeletePublicImage,
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
	sID, err := gqlmodel.ToID[id.Story](input.StoryID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).StoryTelling.Publish(ctx, interfaces.PublishStoryInput{
		ID:     sID,
		Alias:  input.Alias,
		Status: gqlmodel.FromStoryPublishmentStatus(input.Status),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPayload{Story: gqlmodel.ToStory(res)}, nil
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

	layersId, err := gqlmodel.ToIDs[id.NLSLayer](input.Layers)
	if err != nil {
		return nil, err
	}

	swipeableLayersIds, err := gqlmodel.ToIDs[id.NLSLayer](input.SwipeableLayers)
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

	layersId, err := gqlmodel.ToIDs[id.NLSLayer](input.Layers)
	if err != nil {
		return nil, err
	}

	swipeableLayersIds, err := gqlmodel.ToIDs[id.NLSLayer](input.SwipeableLayers)
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
		Index:   input.Index,
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

func (r *mutationResolver) DuplicateStoryPage(ctx context.Context, input gqlmodel.DuplicateStoryPageInput) (*gqlmodel.StoryPagePayload, error) {
	sceneId, storyId, pageId, err := gqlmodel.ToID3[id.Scene, id.Story, id.Page](input.SceneID, input.StoryID, input.PageID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.DuplicatePageParam{
		SceneID: sceneId,
		StoryID: storyId,
		PageID:  pageId,
	}

	story, page, err := usecases(ctx).StoryTelling.DuplicatePage(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPagePayload{
		Story: gqlmodel.ToStory(story),
		Page:  gqlmodel.ToPage(page),
	}, nil
}

func (r *mutationResolver) AddPageLayer(ctx context.Context, input gqlmodel.PageLayerInput) (*gqlmodel.StoryPagePayload, error) {
	sceneId, storyId, pageId, layerId, err := gqlmodel.ToID4[id.Scene, id.Story, id.Page, id.NLSLayer](input.SceneID, input.StoryID, input.PageID, input.LayerID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.PageLayerParam{
		SceneID:   sceneId,
		StoryID:   storyId,
		PageID:    pageId,
		Swipeable: lo.FromPtrOr(input.Swipeable, false),
		LayerID:   layerId,
	}

	story, page, err := usecases(ctx).StoryTelling.AddPageLayer(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPagePayload{
		Story: gqlmodel.ToStory(story),
		Page:  gqlmodel.ToPage(page),
	}, nil
}

func (r *mutationResolver) RemovePageLayer(ctx context.Context, input gqlmodel.PageLayerInput) (*gqlmodel.StoryPagePayload, error) {
	sceneId, storyId, pageId, layerId, err := gqlmodel.ToID4[id.Scene, id.Story, id.Page, id.NLSLayer](input.SceneID, input.StoryID, input.PageID, input.LayerID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.PageLayerParam{
		SceneID:   sceneId,
		StoryID:   storyId,
		PageID:    pageId,
		Swipeable: lo.FromPtrOr(input.Swipeable, false),
		LayerID:   layerId,
	}

	story, page, err := usecases(ctx).StoryTelling.RemovePageLayer(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryPagePayload{
		Story: gqlmodel.ToStory(story),
		Page:  gqlmodel.ToPage(page),
	}, nil
}

func (r *mutationResolver) CreateStoryBlock(ctx context.Context, input gqlmodel.CreateStoryBlockInput) (*gqlmodel.CreateStoryBlockPayload, error) {
	sId, pId, err := gqlmodel.ToID2[id.Story, id.Page](input.StoryID, input.PageID)
	if err != nil {
		return nil, err
	}

	pid, err := gqlmodel.ToPluginID(input.PluginID)
	if err != nil {
		return nil, err
	}

	story, page, block, idx, err := usecases(ctx).StoryTelling.CreateBlock(ctx, interfaces.CreateBlockParam{
		StoryID:     sId,
		PageID:      pId,
		PluginID:    pid,
		ExtensionID: id.PluginExtensionID(input.ExtensionID),
		Index:       input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateStoryBlockPayload{
		Block: gqlmodel.ToBlock(block),
		Page:  gqlmodel.ToPage(page),
		Story: gqlmodel.ToStory(story),
		Index: idx,
	}, nil
}

func (r *mutationResolver) MoveStoryBlock(ctx context.Context, input gqlmodel.MoveStoryBlockInput) (*gqlmodel.MoveStoryBlockPayload, error) {
	sId, pId, bId, err := gqlmodel.ToID3[id.Story, id.Page, id.Block](input.StoryID, input.PageID, input.BlockID)
	if err != nil {
		return nil, err
	}

	story, page, blockId, idx, err := usecases(ctx).StoryTelling.MoveBlock(ctx, interfaces.MoveBlockParam{
		StoryID: sId,
		PageID:  pId,
		BlockID: bId,
		Index:   input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveStoryBlockPayload{
		Story:   gqlmodel.ToStory(story),
		Page:    gqlmodel.ToPage(page),
		BlockID: gqlmodel.IDFrom(*blockId),
		Index:   idx,
	}, nil
}

func (r *mutationResolver) RemoveStoryBlock(ctx context.Context, input gqlmodel.RemoveStoryBlockInput) (*gqlmodel.RemoveStoryBlockPayload, error) {
	sId, pId, bId, err := gqlmodel.ToID3[id.Story, id.Page, id.Block](input.StoryID, input.PageID, input.BlockID)
	if err != nil {
		return nil, err
	}

	story, page, removedBlockId, err := usecases(ctx).StoryTelling.RemoveBlock(ctx, interfaces.RemoveBlockParam{
		StoryID: sId,
		PageID:  pId,
		BlockID: bId,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	if removedBlockId == nil {
		return nil, errors.New("block not found")
	}

	return &gqlmodel.RemoveStoryBlockPayload{
		BlockID: gqlmodel.IDFrom(*removedBlockId),
		Page:    gqlmodel.ToPage(page),
		Story:   gqlmodel.ToStory(story),
	}, nil
}
