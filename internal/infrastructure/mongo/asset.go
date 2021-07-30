package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/asset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type assetRepo struct {
	client *mongodoc.ClientCollection
}

func NewAsset(client *mongodoc.Client) repo.Asset {
	r := &assetRepo{client: client.WithCollection("asset")}
	r.init()
	return r
}

func (r *assetRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "asset", i)
	}
}

func (r *assetRepo) paginate(ctx context.Context, filter bson.D, pagination *usecase.Pagination) ([]*asset.Asset, *usecase.PageInfo, error) {
	var c mongodoc.AssetConsumer
	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
	if err2 != nil {
		return nil, nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, pageInfo, nil
}

func (r *assetRepo) findOne(ctx context.Context, filter bson.D) (*asset.Asset, error) {
	dst := make([]*asset.Asset, 0, 1)
	c := mongodoc.AssetConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *assetRepo) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	filter := bson.D{
		{Key: "id", Value: id.String()},
	}
	return r.findOne(ctx, filter)
}

func (r *assetRepo) Save(ctx context.Context, asset *asset.Asset) error {
	doc, id := mongodoc.NewAsset(asset)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *assetRepo) Remove(ctx context.Context, id id.AssetID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *assetRepo) FindByTeam(ctx context.Context, id id.TeamID, pagination *usecase.Pagination) ([]*asset.Asset, *usecase.PageInfo, error) {
	filter := bson.D{
		{Key: "team", Value: id.String()},
	}
	return r.paginate(ctx, filter, pagination)
}
