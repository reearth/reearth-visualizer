package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *mutationResolver) CreateTagItem(ctx context.Context, input gqlmodel.CreateTagItemInput) (*gqlmodel.CreateTagItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	tag, err := r.usecases.Tag.CreateItem(ctx, interfaces.CreateTagItemParam{
		Label:                 input.Label,
		SceneID:               id.SceneID(input.SceneID),
		LinkedDatasetSchemaID: id.DatasetSchemaIDFromRefID(input.LinkedDatasetSchemaID),
		LinkedDatasetID:       id.DatasetIDFromRefID(input.LinkedDatasetID),
		LinkedDatasetField:    id.DatasetSchemaFieldIDFromRefID(input.LinkedDatasetField),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.CreateTagItemPayload{
		Tag: gqlmodel.ToTagItem(tag),
	}, nil
}

func (r *mutationResolver) CreateTagGroup(ctx context.Context, input gqlmodel.CreateTagGroupInput) (*gqlmodel.CreateTagGroupPayload, error) {
	exit := trace(ctx)
	defer exit()

	tag, err := r.usecases.Tag.CreateGroup(ctx, interfaces.CreateTagGroupParam{
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
	exit := trace(ctx)
	defer exit()

	tag, err := r.usecases.Tag.UpdateTag(ctx, interfaces.UpdateTagParam{
		Label:   input.Label,
		SceneID: id.SceneID(input.SceneID),
		TagID:   id.TagID(input.TagID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.UpdateTagPayload{
		Tag: gqlmodel.ToTag(*tag),
	}, nil
}

func (r *mutationResolver) AttachTagItemToGroup(ctx context.Context, input gqlmodel.AttachTagItemToGroupInput) (*gqlmodel.AttachTagItemToGroupPayload, error) {
	exit := trace(ctx)
	defer exit()

	tag, err := r.usecases.Tag.AttachItemToGroup(ctx, interfaces.AttachItemToGroupParam{
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
	exit := trace(ctx)
	defer exit()

	tag, err := r.usecases.Tag.DetachItemFromGroup(ctx, interfaces.DetachItemToGroupParam{
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
	exit := trace(ctx)
	defer exit()

	tagID, err := r.usecases.Tag.Remove(ctx, id.TagID(input.TagID), getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.RemoveTagPayload{
		TagID: tagID.ID(),
	}, nil
}
