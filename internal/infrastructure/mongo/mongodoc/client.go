package mongodoc

import (
	"context"
	"errors"
	"fmt"
	"io"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Client struct {
	database string
	client   *mongo.Client
}

func NewClient(database string, c *mongo.Client) *Client {
	return &Client{
		database: database,
		client:   c,
	}
}

func (c *Client) WithCollection(col string) *ClientCollection {
	return &ClientCollection{
		Client:         c,
		CollectionName: col,
	}
}

func (c *Client) Collection(col string) *mongo.Collection {
	return c.client.Database(c.database).Collection(col)
}

func (c *Client) Find(ctx context.Context, col string, filter interface{}, consumer Consumer) error {
	cursor, err := c.Collection(col).Find(ctx, filter)
	if errors.Is(err, mongo.ErrNilDocument) || errors.Is(err, mongo.ErrNoDocuments) {
		return rerror.ErrNotFound
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = cursor.Close(ctx)
	}()

	for {
		c := cursor.Next(ctx)
		if err := cursor.Err(); err != nil && !errors.Is(err, io.EOF) {
			return rerror.ErrInternalBy(err)
		}

		if !c {
			if err := consumer.Consume(nil); err != nil {
				return rerror.ErrInternalBy(err)
			}
			break
		}

		if err := consumer.Consume(cursor.Current); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}
	return nil
}

func (c *Client) FindOne(ctx context.Context, col string, filter interface{}, consumer Consumer) error {
	raw, err := c.Collection(col).FindOne(ctx, filter).DecodeBytes()
	if errors.Is(err, mongo.ErrNilDocument) || errors.Is(err, mongo.ErrNoDocuments) {
		return rerror.ErrNotFound
	}
	if err := consumer.Consume(raw); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (c *Client) Count(ctx context.Context, col string, filter interface{}) (int64, error) {
	count, err := c.Collection(col).CountDocuments(ctx, filter)
	if err != nil {
		return count, rerror.ErrInternalBy(err)
	}
	return count, nil
}

func (c *Client) RemoveOne(ctx context.Context, col string, f interface{}) error {
	_, err := c.Collection(col).DeleteOne(ctx, f)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (c *Client) RemoveAll(ctx context.Context, col string, f interface{}) error {
	_, err := c.Collection(col).DeleteMany(ctx, f)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

var (
	replaceOption = (&options.ReplaceOptions{}).SetUpsert(true)
)

func (c *Client) SaveOne(ctx context.Context, col string, id string, replacement interface{}) error {
	_, err := c.Collection(col).ReplaceOne(ctx, bson.M{"id": id}, replacement, replaceOption)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (c *Client) SaveAll(ctx context.Context, col string, ids []string, updates []interface{}) error {
	if len(ids) == 0 || len(updates) == 0 {
		return nil
	}
	if len(ids) != len(updates) {
		return rerror.ErrInternalBy(errors.New("invalid save args"))
	}

	writeModels := make([]mongo.WriteModel, 0, len(updates))
	for i, u := range updates {
		id := ids[i]
		writeModels = append(
			writeModels,
			(&mongo.ReplaceOneModel{}).
				SetUpsert(true).
				SetFilter(bson.M{"id": id}).
				SetReplacement(u),
		)
	}

	_, err := c.Collection(col).BulkWrite(ctx, writeModels)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (c *Client) UpdateMany(ctx context.Context, col string, filter, update interface{}) error {
	_, err := c.Collection(col).UpdateMany(ctx, filter, bson.M{
		"$set": update,
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

type Update struct {
	Filter       interface{}
	Update       interface{}
	ArrayFilters []interface{}
}

func (c *Client) UpdateManyMany(ctx context.Context, col string, updates []Update) error {
	writeModels := make([]mongo.WriteModel, 0, len(updates))
	for _, w := range updates {
		wm := mongo.NewUpdateManyModel().SetFilter(w.Filter).SetUpdate(bson.M{
			"$set": w.Update,
		})
		if len(w.ArrayFilters) > 0 {
			wm.SetArrayFilters(options.ArrayFilters{
				Filters: w.ArrayFilters,
			})
		}
		writeModels = append(writeModels, wm)
	}

	_, err := c.Collection(col).BulkWrite(ctx, writeModels)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func getCursor(raw bson.Raw, key string) (*usecase.Cursor, error) {
	val, err := raw.LookupErr(key)
	if err != nil {
		return nil, fmt.Errorf("failed to lookup cursor: %v", err.Error())
	}
	var s string
	if err := val.Unmarshal(&s); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cursor: %v", err.Error())
	}
	c := usecase.Cursor(s)
	return &c, nil
}

func (c *Client) Paginate(ctx context.Context, col string, filter interface{}, sort *string, p *Pagination, consumer Consumer) (*usecase.PageInfo, error) {
	if p == nil {
		return nil, nil
	}
	coll := c.Collection(col)
	const key = "id"

	findOptions := options.Find().SetCollation(&options.Collation{Strength: 1, Locale: "en"})

	sortOptions, sortKey := sortOptionsFrom(sort, p, key)

	findOptions.Sort = sortOptions

	count, err := coll.CountDocuments(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to count documents: %v", err.Error())
	}

	filter, limit, err := paginationFilter(ctx, coll, p, sortKey, key, filter)
	if err != nil {
		return nil, err
	}

	// 更に読める要素があるのか確かめるために一つ多めに読み出す
	// Read one more element so that we can see whether there's a further one
	limit++
	findOptions.Limit = &limit

	cursor, err := coll.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to find: %v", err.Error())
	}
	defer func() {
		_ = cursor.Close(ctx)
	}()

	results := make([]bson.Raw, 0, limit)
	for cursor.Next(ctx) {
		raw := make(bson.Raw, len(cursor.Current))
		copy(raw, cursor.Current)
		results = append(results, raw)
	}
	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("failed to read cursor: %v", err.Error())
	}

	hasMore := false
	if len(results) == int(limit) {
		hasMore = true
		// Remove the extra one reading.
		results = results[:len(results)-1]
	}

	for _, result := range results {
		if err := consumer.Consume(result); err != nil {
			return nil, err
		}
	}

	var startCursor, endCursor *usecase.Cursor
	if len(results) > 0 {
		sc, err := getCursor(results[0], key)
		if err != nil {
			return nil, fmt.Errorf("failed to get start cursor: %v", err.Error())
		}
		startCursor = sc
		ec, err := getCursor(results[len(results)-1], key)
		if err != nil {
			return nil, fmt.Errorf("failed to get end cursor: %v", err.Error())
		}
		endCursor = ec
	}

	// ref: https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo.Fields
	// If first is set, false can be returned unless it can be efficiently determined whether or not a previous page exists.
	// If last is set, false can be returned unless it can be efficiently determined whether or not a next page exists.
	// Returning absolutely false because the existing implementation cannot determine it efficiently.
	var hasNextPage, hasPreviousPage bool
	switch {
	case p.First != nil:
		hasNextPage = hasMore
	case p.Last != nil:
		hasPreviousPage = hasMore
	}

	return usecase.NewPageInfo(int(count), startCursor, endCursor, hasNextPage, hasPreviousPage), nil
}

func sortOptionsFrom(sort *string, p *Pagination, key string) (bson.D, string) {
	var sortOptions bson.D
	var sortKey = ""
	if sort != nil && len(*sort) > 0 && *sort != "id" {
		sortKey = *sort
		sortOptions = append(sortOptions, bson.E{Key: sortKey, Value: p.SortDirection()})
	}
	sortOptions = append(sortOptions, bson.E{Key: key, Value: p.SortDirection()})
	return sortOptions, sortKey
}

func paginationFilter(ctx context.Context, coll *mongo.Collection, p *Pagination, sortKey, key string, filter interface{}) (interface{}, int64, error) {
	limit, op, cur, err := p.Parameters()
	if err != nil {
		return nil, 0, fmt.Errorf("failed to parse pagination parameters: %w", err)
	}

	var paginationFilter bson.M

	if cur != nil {

		if sortKey == "" {
			paginationFilter = bson.M{key: bson.M{op: *cur}}
		} else {
			var curObj bson.M
			if err := coll.FindOne(ctx, bson.M{key: *cur}).Decode(&curObj); err != nil {
				return nil, 0, fmt.Errorf("failed to find cursor element")
			}
			if curObj[sortKey] == nil {
				return nil, 0, fmt.Errorf("invalied sort key")
			}
			paginationFilter = bson.M{
				"$or": []bson.M{
					{sortKey: bson.M{op: curObj[sortKey]}},
					{
						sortKey: curObj[sortKey],
						key:     bson.M{op: *cur},
					},
				},
			}
		}
	}

	return And(
		filter,
		"",
		paginationFilter,
	), limit, nil
}

func (c *Client) CreateIndex(ctx context.Context, col string, keys []string) []string {
	return c.CreateUniqueIndex(ctx, col, keys, []string{})
}

func (c *Client) CreateUniqueIndex(ctx context.Context, col string, keys, uniqueKeys []string) []string {
	coll := c.Collection(col)
	indexedKeys := indexes(ctx, coll)

	// store unique keys as map to check them in an efficient way
	ukm := map[string]struct{}{}
	for _, k := range append([]string{"id"}, uniqueKeys...) {
		ukm[k] = struct{}{}
	}

	var newIndexes []mongo.IndexModel
	for _, k := range append([]string{"id"}, keys...) {
		if _, ok := indexedKeys[k]; ok {
			continue
		}
		indexBg := true
		_, isUnique := ukm[k]
		newIndexes = append(newIndexes, mongo.IndexModel{
			Keys: map[string]int{
				k: 1,
			},
			Options: &options.IndexOptions{
				Background: &indexBg,
				Unique:     &isUnique,
			},
		})
	}

	if len(newIndexes) > 0 {
		index, err := coll.Indexes().CreateMany(ctx, newIndexes)
		if err != nil {
			panic(err)
		}
		return index
	}
	return nil
}

func indexes(ctx context.Context, coll *mongo.Collection) map[string]struct{} {
	c, err := coll.Indexes().List(ctx, nil)
	if err != nil {
		panic(err)
	}
	indexes := []struct{ Key map[string]int }{}
	err = c.All(ctx, &indexes)
	if err != nil {
		panic(err)
	}
	keys := map[string]struct{}{}
	for _, i := range indexes {
		for k := range i.Key {
			keys[k] = struct{}{}
		}
	}
	return keys
}

func (c *Client) BeginTransaction() (repo.Tx, error) {
	s, err := c.client.StartSession()
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	if err := s.StartTransaction(&options.TransactionOptions{}); err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	return &Tx{session: s, commit: false}, nil
}

type Tx struct {
	session mongo.Session
	commit  bool
}

func (t *Tx) Commit() {
	if t == nil {
		return
	}
	t.commit = true
}

func (t *Tx) End(ctx context.Context) error {
	if t == nil {
		return nil
	}

	if t.commit {
		if err := t.session.CommitTransaction(ctx); err != nil {
			return rerror.ErrInternalBy(err)
		}
	} else if err := t.session.AbortTransaction(ctx); err != nil {
		return rerror.ErrInternalBy(err)
	}

	t.session.EndSession(ctx)
	return nil
}
