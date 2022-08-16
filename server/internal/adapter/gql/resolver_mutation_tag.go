package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

func (r *mutationResolver) CreateTagItem(ctx context.Context, input gqlmodel.CreateTagItemInput) (*gqlmodel.CreateTagItemPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	tag, parent, err := usecases(ctx).Tag.CreateItem(ctx, interfaces.CreateTagItemParam{
		Label:                 input.Label,
		SceneID:               sid,
		Parent:                gqlmodel.ToIDRef[id.Tag](input.Parent),
		LinkedDatasetSchemaID: gqlmodel.ToIDRef[id.DatasetSchema](input.LinkedDatasetSchemaID),
		LinkedDatasetID:       gqlmodel.ToIDRef[id.Dataset](input.LinkedDatasetID),
		LinkedDatasetField:    gqlmodel.ToIDRef[id.DatasetField](input.LinkedDatasetField),
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
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	tags, err := util.TryMap(input.Tags, gqlmodel.ToID[id.Tag])
	if err != nil {
		return nil, err
	}

	tag, err := usecases(ctx).Tag.CreateGroup(ctx, interfaces.CreateTagGroupParam{
		Label:   input.Label,
		SceneID: sid,
		Tags:    tags,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.CreateTagGroupPayload{
		Tag: gqlmodel.ToTagGroup(tag),
	}, nil
}

func (r *mutationResolver) UpdateTag(ctx context.Context, input gqlmodel.UpdateTagInput) (*gqlmodel.UpdateTagPayload, error) {
	tid, err := gqlmodel.ToID[id.Tag](input.TagID)
	if err != nil {
		return nil, err
	}

	tag, err := usecases(ctx).Tag.UpdateTag(ctx, interfaces.UpdateTagParam{
		Label: input.Label,
		TagID: tid,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.UpdateTagPayload{
		Tag: gqlmodel.ToTag(*tag),
	}, nil
}

func (r *mutationResolver) AttachTagItemToGroup(ctx context.Context, input gqlmodel.AttachTagItemToGroupInput) (*gqlmodel.AttachTagItemToGroupPayload, error) {
	iid, gid, err := gqlmodel.ToID2[id.Tag, id.Tag](input.ItemID, input.GroupID)
	if err != nil {
		return nil, err
	}

	tag, err := usecases(ctx).Tag.AttachItemToGroup(ctx, interfaces.AttachItemToGroupParam{
		ItemID:  iid,
		GroupID: gid,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.AttachTagItemToGroupPayload{
		Tag: gqlmodel.ToTagGroup(tag),
	}, nil
}

func (r *mutationResolver) DetachTagItemFromGroup(ctx context.Context, input gqlmodel.DetachTagItemFromGroupInput) (*gqlmodel.DetachTagItemFromGroupPayload, error) {
	iid, gid, err := gqlmodel.ToID2[id.Tag, id.Tag](input.ItemID, input.GroupID)
	if err != nil {
		return nil, err
	}

	tag, err := usecases(ctx).Tag.DetachItemFromGroup(ctx, interfaces.DetachItemToGroupParam{
		ItemID:  iid,
		GroupID: gid,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.DetachTagItemFromGroupPayload{
		Tag: gqlmodel.ToTagGroup(tag),
	}, nil
}

func (r *mutationResolver) RemoveTag(ctx context.Context, input gqlmodel.RemoveTagInput) (*gqlmodel.RemoveTagPayload, error) {
	tid, err := gqlmodel.ToID[id.Tag](input.TagID)
	if err != nil {
		return nil, err
	}

	_, layers, err := usecases(ctx).Tag.Remove(ctx, tid, getOperator(ctx))
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
		TagID:         input.TagID,
		UpdatedLayers: updatedLayers,
	}, nil
}
