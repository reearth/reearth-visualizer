package mongo

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"sync"
	"regexp"
	"strings"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/sync/errgroup"
)

// Batching parameters for RemoveByProjectWithFile. Chosen so a single batch
// lives comfortably in memory and one DeleteMany covers a full batch. The GCS
// concurrency limit keeps cleanup from saturating the storage client pool when
// multiple project deletions overlap.
const (
	removeByProjectBatchSize     = 100
	removeByProjectMaxConcurrent = 10
)

var (
	assetIndexes       = []string{"workspace"}
	assetUniqueIndexes = []string{"id"}
)

type Asset struct {
	client *mongox.ClientCollection
	f      repo.WorkspaceFilter
}

func NewAsset(client *mongox.Client) *Asset {
	return &Asset{client: client.WithCollection("asset")}
}

func (r *Asset) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, assetIndexes, assetUniqueIndexes)
}

func (r *Asset) Filtered(f repo.WorkspaceFilter) repo.Asset {
	return &Asset{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Asset) FindByURL(ctx context.Context, path string) (*asset.Asset, error) {
	return r.findOne(ctx, bson.M{
		"url": path,
	})
}

func (r *Asset) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Asset) FindByIDs(ctx context.Context, ids id.AssetIDList) ([]*asset.Asset, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	res, err := r.find(ctx, bson.M{
		"id": bson.M{"$in": ids.Strings()},
	})
	if err != nil {
		return nil, err
	}
	return filterAssets(ids, res), nil
}

func (r *Asset) FindByWorkspaceProject(ctx context.Context, id accountsID.WorkspaceID, projectId *id.ProjectID, uFilter repo.AssetFilter) ([]*asset.Asset, *usecasex.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	filter := bson.M{
		"coresupport": true,
	}

	if projectId != nil {
		filter["project"] = projectId.String()
	} else {
		filter["workspace"] = id.String()
	}

	if uFilter.Keyword != nil {
		keyword := fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*uFilter.Keyword))
		filter["name"] = bson.M{"$regex": primitive.Regex{Pattern: keyword, Options: "i"}}
	}

	bucketPattern := adapter.CurrentHost(ctx)
	if bucketPattern == "" {
		bucketPattern = "example.com" // e2e test
	} else if strings.Contains(bucketPattern, "localhost") {
		bucketPattern = "localhost"
	} else {
		bucketPattern = "visualizer"
	}

	if andFilter, ok := mongox.And(filter, "url", bson.M{
		"$regex": primitive.Regex{Pattern: bucketPattern, Options: "i"},
	}).(bson.M); ok {
		filter = andFilter
	}

	return r.paginate(ctx, filter, uFilter.Sort, uFilter.Pagination)
}

func (r *Asset) TotalSizeByWorkspace(ctx context.Context, wid accountsID.WorkspaceID) (int64, error) {
	if !r.f.CanRead(wid) {
		return 0, repo.ErrOperationDenied
	}

	c, err := r.client.Client().Aggregate(ctx, []bson.M{
		{"$match": bson.M{"workspace": wid.String()}},
		{"$group": bson.M{"_id": nil, "size": bson.M{"$sum": "$size"}}},
	})
	if err != nil {
		return 0, rerror.ErrInternalByWithContext(ctx, err)
	}
	defer func() {
		_ = c.Close(ctx)
	}()

	if !c.Next(ctx) {
		return 0, nil
	}

	type resp struct {
		Size int64
	}
	var res resp
	if err := c.Decode(&res); err != nil {
		return 0, rerror.ErrInternalByWithContext(ctx, err)
	}
	return res.Size, nil
}

func (r *Asset) Save(ctx context.Context, asset *asset.Asset) error {
	if !r.f.CanWrite(asset.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewAsset(asset)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Asset) Remove(ctx context.Context, id id.AssetID) error {
	writeFilter := applyWorkspaceFilter(bson.M{
		"id": id.String(),
	}, r.f.Writable)

	return r.client.RemoveOne(ctx, writeFilter)
}

func (r *Asset) RemoveByProjectWithFile(ctx context.Context, pid id.ProjectID, f gateway.File) error {
	baseFilter := bson.M{
		"coresupport": true,
		"project":     pid.String(),
	}

	for {
		// Find is bounded by removeByProjectBatchSize. After each batch is
		// deleted, the next call naturally returns the following page because
		// the previous rows no longer match.
		batch, err := r.find(ctx, baseFilter, options.Find().SetLimit(removeByProjectBatchSize))
		if err != nil {
			return err
		}
		if len(batch) == 0 {
			return nil
		}

		for _, a := range batch {
			if !r.f.CanWrite(a.Workspace()) {
				return repo.ErrOperationDenied
			}
		}

		var (
			mu      sync.Mutex
			failIDs = map[string]struct{}{}
		)
		g, gctx := errgroup.WithContext(ctx)
		g.SetLimit(removeByProjectMaxConcurrent)
		for _, a := range batch {
			a := a
			g.Go(func() error {
				u, perr := url.Parse(a.URL())
				if perr != nil || u == nil {
					return nil
				}
				if err := f.RemoveAsset(gctx, u); err != nil {
					// Log and skip DB deletion so the row survives for retry.
					log.Errorfc(gctx, "asset: gcs delete failed for %s: %v", a.ID(), err)
					mu.Lock()
					failIDs[a.ID().String()] = struct{}{}
					mu.Unlock()
				}
				return nil
			})
		}
		_ = g.Wait()

		ids := make([]string, 0, len(batch))
		for _, a := range batch {
			if _, failed := failIDs[a.ID().String()]; !failed {
				ids = append(ids, a.ID().String())
			}
		}
		writeFilter := applyWorkspaceFilter(bson.M{"id": bson.M{"$in": ids}}, r.f.Writable)
		if err := r.client.RemoveAll(ctx, writeFilter); err != nil {
			return err
		}

		if len(batch) < removeByProjectBatchSize {
			return nil
		}
	}
}

func (r *Asset) paginate(ctx context.Context, filter any, sort *asset.SortType, pagination *usecasex.Pagination) ([]*asset.Asset, *usecasex.PageInfo, error) {
	var usort *usecasex.Sort
	if sort != nil {
		usort = &usecasex.Sort{
			Key:      sort.Key,
			Reverted: sort.Desc,
		}
	}
	c := mongodoc.NewAssetConsumer(r.f.Readable)
	pageInfo, err := r.client.Paginate(ctx, filter, usort, pagination, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	return c.Result, pageInfo, nil
}

func (r *Asset) find(ctx context.Context, filter any, opts ...*options.FindOptions) ([]*asset.Asset, error) {
	c := mongodoc.NewAssetConsumer(r.f.Readable)
	if err2 := r.client.Find(ctx, filter, c, opts...); err2 != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err2)
	}
	return c.Result, nil
}

func (r *Asset) findOne(ctx context.Context, filter any) (*asset.Asset, error) {
	c := mongodoc.NewAssetConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) < 1 {
		return nil, errors.New("asset not found")
	}
	return c.Result[0], nil
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
