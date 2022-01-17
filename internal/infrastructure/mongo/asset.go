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

func (r *assetRepo) FindByID(ctx context.Context, id id.AssetID, teams []id.TeamID) (*asset.Asset, error) {
	filter := assetFilter(bson.M{
		"id": id.String(),
	}, teams)
	return r.findOne(ctx, filter)
}

func (r *assetRepo) FindByIDs(ctx context.Context, ids []id.AssetID, teams []id.TeamID) ([]*asset.Asset, error) {
	filter := assetFilter(bson.M{
		"id": bson.M{"$in": id.AssetIDsToStrings(ids)},
	}, teams)
	dst := make([]*asset.Asset, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterAssets(ids, res), nil
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

func (r *assetRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"team"})
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

func (r *assetRepo) find(ctx context.Context, dst []*asset.Asset, filter interface{}) ([]*asset.Asset, error) {
	c := mongodoc.AssetConsumer{
		Rows: dst,
	}
	if err2 := r.client.Find(ctx, filter, &c); err2 != nil {
		return nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, nil
}

func (r *assetRepo) findOne(ctx context.Context, filter interface{}) (*asset.Asset, error) {
	dst := make([]*asset.Asset, 0, 1)
	c := mongodoc.AssetConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterAssets(ids []id.AssetID, rows []*asset.Asset) []*asset.Asset {
	res := make([]*asset.Asset, 0, len(ids))
	for _, id := range ids {
		var r2 *asset.Asset
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func assetFilter(filter bson.M, teams []id.TeamID) bson.M {
	filter["team"] = bson.M{"$in": id.TeamIDsToStrings(teams)}
	return filter
}
