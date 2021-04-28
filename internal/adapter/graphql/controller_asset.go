package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type AssetControlerConfig struct {
	AssetInput func() interfaces.Asset
}

type AssetController struct {
	config AssetControlerConfig
}

func NewAssetController(config AssetControlerConfig) *AssetController {
	return &AssetController{config: config}
}

func (c *AssetController) usecase() interfaces.Asset {
	if c == nil {
		return nil
	}
	return c.config.AssetInput()
}

func (c *AssetController) Create(ctx context.Context, i *CreateAssetInput, o *usecase.Operator) (*CreateAssetPayload, error) {
	res, err := c.usecase().Create(ctx, interfaces.CreateAssetParam{
		TeamID: id.TeamID(i.TeamID),
		File:   fromFile(&i.File),
	}, o)
	if err != nil {
		return nil, err
	}

	return &CreateAssetPayload{Asset: toAsset(res)}, nil
}

func (c *AssetController) Remove(ctx context.Context, i *RemoveAssetInput, o *usecase.Operator) (*RemoveAssetPayload, error) {
	res, err2 := c.usecase().Remove(ctx, id.AssetID(i.AssetID), o)
	if err2 != nil {
		return nil, err2
	}

	return &RemoveAssetPayload{AssetID: res.ID()}, nil
}

func (c *AssetController) FindByTeam(ctx context.Context, teamID id.ID, first *int, last *int, before *usecase.Cursor, after *usecase.Cursor, operator *usecase.Operator) (*AssetConnection, error) {
	p := usecase.NewPagination(first, last, before, after)
	assets, pi, err := c.usecase().FindByTeam(ctx, id.TeamID(teamID), p, operator)
	if err != nil {
		return nil, err
	}

	edges := make([]*AssetEdge, 0, len(assets))
	nodes := make([]*Asset, 0, len(assets))
	for _, a := range assets {
		asset := toAsset(a)
		edges = append(edges, &AssetEdge{
			Node:   asset,
			Cursor: usecase.Cursor(asset.ID.String()),
		})
		nodes = append(nodes, asset)
	}

	return &AssetConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   toPageInfo(pi),
		TotalCount: pi.TotalCount(),
	}, nil
}
