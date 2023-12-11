package mongo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/scene"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
)

var (
	styleIndexes       = []string{"scene", "id,scene", "scene,infobox.fields"}
	styleUniqueIndexes = []string{"id"}
)

type Style struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewStyle(client *mongox.Client) *Style {
	return &Style{
		client: client.WithCollection("style"),
	}
}

func (r *Style) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, styleIndexes, styleUniqueIndexes)
}

func (r *Style) Filtered(f repo.SceneFilter) repo.Style {
	return &Style{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Style) FindByID(ctx context.Context, id id.StyleID) (*scene.Style, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	}, true)
}

func (r *Style) FindByIDs(ctx context.Context, ids id.StyleIDList) (*scene.StyleList, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterStyles(ids, *res), nil
}

func (r *Style) FindByScene(ctx context.Context, id id.SceneID) (*scene.StyleList, error) {
	if !r.f.CanRead(id) {
		return nil, nil
	}
	return r.find(ctx, bson.M{
		"scene": id.String(),
	})
}

func (r *Style) Save(ctx context.Context, style scene.Style) error {
	if !r.f.CanWrite(style.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, sId := mongodoc.NewStyle(style)
	return r.client.SaveOne(ctx, sId, doc)
}

func (r *Style) SaveAll(ctx context.Context, styles scene.StyleList) error {
	for _, s := range styles {
		if !r.f.CanWrite(s.Scene()) {
			return repo.ErrOperationDenied
		}
	}

	doc, sId := mongodoc.NewStyles(styles, r.f.Writable)
	return r.client.SaveAll(ctx, sId, doc)
}

func (r *Style) Remove(ctx context.Context, id id.StyleID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Style) RemoveAll(ctx context.Context, ids id.StyleIDList) error {
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *Style) RemoveByScene(ctx context.Context, id id.SceneID) error {
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{"scene": id.String()}))
}

func (r *Style) find(ctx context.Context, filter interface{}) (*scene.StyleList, error) {
	c := mongodoc.NewStyleConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return (*scene.StyleList)(&c.Result), nil
}

func (r *Style) findOne(ctx context.Context, filter any, filterByScene bool) (*scene.Style, error) {
	var f []id.SceneID
	if filterByScene {
		f = r.f.Readable
	}
	c := mongodoc.NewStyleConsumer(f)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func filterStyles(ids id.StyleIDList, rows scene.StyleList) *scene.StyleList {
	res := make(scene.StyleList, 0, len(ids))
	for _, sId := range ids {
		var s *scene.Style
		for _, r := range rows {
			if r.ID() == sId {
				s = r
				break
			}
		}
		res = append(res, s)
	}
	return &res
}

func (r *Style) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
