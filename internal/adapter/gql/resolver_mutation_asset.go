package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *mutationResolver) CreateAsset(ctx context.Context, input gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPayload, error) {
	res, err := usecases(ctx).Asset.Create(ctx, interfaces.CreateAssetParam{
		TeamID: id.TeamID(input.TeamID),
		File:   gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateAssetPayload{Asset: gqlmodel.ToAsset(res)}, nil
}

func (r *mutationResolver) RemoveAsset(ctx context.Context, input gqlmodel.RemoveAssetInput) (*gqlmodel.RemoveAssetPayload, error) {
	res, err2 := usecases(ctx).Asset.Remove(ctx, id.AssetID(input.AssetID), getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.RemoveAssetPayload{AssetID: res.ID()}, nil
}
