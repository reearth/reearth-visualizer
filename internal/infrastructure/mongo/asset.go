package mongo

import (
	"context"
	"fmt"
	"regexp"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/asset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type assetRepo struct {
	client *mongodoc.ClientCollection
	f      repo.TeamFilter
}

func NewAsset(client *mongodoc.Client) repo.Asset {
	r := &assetRepo{client: client.WithCollection("asset")}
	r.init()
	return r
}

func (r *assetRepo) Filtered(f repo.TeamFilter) repo.Asset {
	return &assetRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *assetRepo) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *assetRepo) FindByIDs(ctx context.Context, ids []id.AssetID) ([]*asset.Asset, error) {
	filter := bson.M{
		"id": bson.M{"$in": id.AssetIDsToStrings(ids)},
	}
	dst := make([]*asset.Asset, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterAssets(ids, res), nil
}

func (r *assetRepo) FindByTeam(ctx context.Context, id id.TeamID, uFilter repo.AssetFilter) ([]*asset.Asset, *usecase.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecase.EmptyPageInfo(), nil
	}

	var filter interface{} = bson.M{
		"team": id.String(),
	}

	if uFilter.Keyword != nil {
		filter = mongodoc.And(filter, "name", bson.M{
			"$regex": primitive.Regex{Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*uFilter.Keyword)), Options: "i"},
		})
	}

	return r.paginate(ctx, filter, uFilter.Sort, uFilter.Pagination)
}

func (r *assetRepo) Save(ctx context.Context, asset *asset.Asset) error {
	if !r.f.CanWrite(asset.Team()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewAsset(asset)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *assetRepo) Remove(ctx context.Context, id id.AssetID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{
		"id": id.String(),
	}))
}

func (r *assetRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"team"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "asset", i)
	}
}

func (r *assetRepo) paginate(ctx context.Context, filter interface{}, sort *asset.SortType, pagination *usecase.Pagination) ([]*asset.Asset, *usecase.PageInfo, error) {
	var sortstr *string
	if sort != nil {
		sortstr2 := string(*sort)
		sortstr = &sortstr2
	}

	var c mongodoc.AssetConsumer
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), sortstr, pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Rows, pageInfo, nil
}

func (r *assetRepo) find(ctx context.Context, dst []*asset.Asset, filter interface{}) ([]*asset.Asset, error) {
	c := mongodoc.AssetConsumer{
		Rows: dst,
	}
	if err2 := r.client.Find(ctx, r.readFilter(filter), &c); err2 != nil {
		return nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, nil
}

func (r *assetRepo) findOne(ctx context.Context, filter interface{}) (*asset.Asset, error) {
	dst := make([]*asset.Asset, 0, 1)
	c := mongodoc.AssetConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
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

func (r *assetRepo) readFilter(filter interface{}) interface{} {
	return applyTeamFilter(filter, r.f.Readable)
}

func (r *assetRepo) writeFilter(filter interface{}) interface{} {
	return applyTeamFilter(filter, r.f.Writable)
}
