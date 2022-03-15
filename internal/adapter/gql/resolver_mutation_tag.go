package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *mutationResolver) CreateTagItem(ctx context.Context, input gqlmodel.CreateTagItemInput) (*gqlmodel.CreateTagItemPayload, error) {
	tag, parent, err := usecases(ctx).Tag.CreateItem(ctx, interfaces.CreateTagItemParam{
		Label:                 input.Label,
		SceneID:               id.SceneID(input.SceneID),
		Parent:                id.TagIDFromRefID(input.Parent),
		LinkedDatasetSchemaID: id.DatasetSchemaIDFromRefID(input.LinkedDatasetSchemaID),
		LinkedDatasetID:       id.DatasetIDFromRefID(input.LinkedDatasetID),
		LinkedDatasetField:    id.DatasetSchemaFieldIDFromRefID(input.LinkedDatasetField),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateTagItemPayload{
		Tag:    gqlmodel.ToTagItem(tag),
		Parent: gqlmodel.ToTagGroup(parent),
	}, nil
}

func (r *mutationResolver) CreateTagGroup(ctx context.Context, input gqlmodel.CreateTagGroupInput) (*gqlmodel.CreateTagGroupPayload, error) {
	tag, err := usecases(ctx).Tag.CreateGroup(ctx, interfaces.CreateTagGroupParam{
		Label:   input.Label,
		SceneID: id.SceneID(input.SceneID),
		Tags:    id.TagIDsFromIDRef(input.Tags),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.CreateTagGroupPayload{
		Tag: gqlmodel.ToTagGroup(tag),
	}, nil
}

func (r *mutationResolver) UpdateTag(ctx context.Context, input gqlmodel.UpdateTagInput) (*gqlmodel.UpdateTagPayload, error) {
	tag, err := usecases(ctx).Tag.UpdateTag(ctx, interfaces.UpdateTagParam{
		Label: input.Label,
		TagID: id.TagID(input.TagID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.UpdateTagPayload{
		Tag: gqlmodel.ToTag(*tag),
	}, nil
}

func (r *mutationResolver) AttachTagItemToGroup(ctx context.Context, input gqlmodel.AttachTagItemToGroupInput) (*gqlmodel.AttachTagItemToGroupPayload, error) {
	tag, err := usecases(ctx).Tag.AttachItemToGroup(ctx, interfaces.AttachItemToGroupParam{
		ItemID:  id.TagID(input.ItemID),
		GroupID: id.TagID(input.GroupID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.AttachTagItemToGroupPayload{
		Tag: gqlmodel.ToTagGroup(tag),
	}, nil
}

func (r *mutationResolver) DetachTagItemFromGroup(ctx context.Context, input gqlmodel.DetachTagItemFromGroupInput) (*gqlmodel.DetachTagItemFromGroupPayload, error) {
	tag, err := usecases(ctx).Tag.DetachItemFromGroup(ctx, interfaces.DetachItemToGroupParam{
		ItemID:  id.TagID(input.ItemID),
		GroupID: id.TagID(input.GroupID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.DetachTagItemFromGroupPayload{
		Tag: gqlmodel.ToTagGroup(tag),
	}, nil
}

func (r *mutationResolver) RemoveTag(ctx context.Context, input gqlmodel.RemoveTagInput) (*gqlmodel.RemoveTagPayload, error) {
	tagID, layers, err := usecases(ctx).Tag.Remove(ctx, id.TagID(input.TagID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	updatedLayers := make([]gqlmodel.Layer, 0, len(layers))
	for _, l := range layers {
		if l == nil {
			updatedLayers = append(updatedLayers, nil)
		} else {
			updatedLayers = append(updatedLayers, gqlmodel.ToLayer(*l, nil))
		}
	}

	return &gqlmodel.RemoveTagPayload{
		TagID:         tagID.ID(),
		UpdatedLayers: updatedLayers,
	}, nil
}
