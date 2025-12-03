package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"

	"github.com/reearth/reearthx/idx"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func (r *mutationResolver) CreateAsset(ctx context.Context, input gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPayload, error) {
	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	var pid *idx.ID[id.Project]
	if input.ProjectID != nil {
		pidValue, err := gqlmodel.ToID[id.Project](*input.ProjectID)
		if err != nil {
			return nil, err
		}
		pid = &pidValue
	}

	res, err := usecases(ctx).Asset.Create(ctx, interfaces.CreateAssetParam{
		WorkspaceID: tid,
		ProjectID:   pid,
		CoreSupport: input.CoreSupport,
		File:        gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateAssetPayload{Asset: gqlmodel.ToAsset(res)}, nil
}

func (r *mutationResolver) UpdateAsset(ctx context.Context, input gqlmodel.UpdateAssetInput) (*gqlmodel.UpdateAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.AssetID)
	if err != nil {
		return nil, err
	}

	var pid *id.ProjectID
	if project := input.ProjectID; project != nil {
		pidValue, err := gqlmodel.ToID[id.Project](*input.ProjectID)
		if err != nil {
			return nil, err
		}
		pid = &pidValue
	}

	a, p, err2 := usecases(ctx).Asset.Update(ctx, aid, pid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.UpdateAssetPayload{AssetID: gqlmodel.IDFrom(a), ProjectID: gqlmodel.IDFromRef(p)}, nil
}

func (r *mutationResolver) RemoveAsset(ctx context.Context, input gqlmodel.RemoveAssetInput) (*gqlmodel.RemoveAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.AssetID)
	if err != nil {
		return nil, err
	}

	res, err2 := usecases(ctx).Asset.Remove(ctx, aid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.RemoveAssetPayload{AssetID: gqlmodel.IDFrom(res)}, nil
}
