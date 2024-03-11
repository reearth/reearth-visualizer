package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	nlsLayerIndexes = []string{
		"scene",
		"id,scene",
		"scene,infobox.blocks",
		"group.children",
		"group.children,scene",
		"infobox.property",
		"infobox.property,scene",
		"infobox.blocks.property",
		"infobox.blocks.property,scene",
	}
	nlsLayerUniqueIndexes = []string{"id"}
)

type NLSLayer struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewNLSLayer(client *mongox.Client) *NLSLayer {
	return &NLSLayer{
		client: client.WithCollection("nlsLayer"),
	}
}

func (r *NLSLayer) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, nlsLayerIndexes, nlsLayerUniqueIndexes)
}

func (r *NLSLayer) Filtered(f repo.SceneFilter) repo.NLSLayer {
	return &NLSLayer{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *NLSLayer) FindByID(ctx context.Context, id id.NLSLayerID) (nlslayer.NLSLayer, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *NLSLayer) FindByIDs(ctx context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerList, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make([]*nlslayer.NLSLayer, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterNLSLayers(ids, res), nil
}

func (r *NLSLayer) FindNLSLayerSimpleByID(ctx context.Context, id id.NLSLayerID) (*nlslayer.NLSLayerSimple, error) {
	return r.findNLSLayerSimpleOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *NLSLayer) FindNLSLayerSimpleByIDs(ctx context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerSimpleList, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make([]*nlslayer.NLSLayerSimple, 0, len(ids))
	res, err := r.findNLSLayerSimples(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterNLSLayerSimples(ids, res), nil
}

func (r *NLSLayer) FindNLSLayerGroupByID(ctx context.Context, id id.NLSLayerID) (*nlslayer.NLSLayerGroup, error) {
	return r.findNLSLayerGroupOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *NLSLayer) FindNLSLayerGroupByIDs(ctx context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerGroupList, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make([]*nlslayer.NLSLayerGroup, 0, len(ids))
	res, err := r.findNLSLayerGroups(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterNLSLayerGroups(ids, res), nil
}

func (r *NLSLayer) FindParentByID(ctx context.Context, id id.NLSLayerID) (*nlslayer.NLSLayerGroup, error) {
	return r.findNLSLayerGroupOne(ctx, bson.M{
		"group.children": id.String(),
	})
}

func (r *NLSLayer) FindParentsByIDs(ctx context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerGroupList, error) {
	return r.findNLSLayerGroups(ctx, nil, bson.M{
		"group.children": bson.M{"$in": ids.Strings()},
	})
}

func (r *NLSLayer) FindByScene(ctx context.Context, id id.SceneID) (nlslayer.NLSLayerList, error) {
	if !r.f.CanRead(id) {
		return nil, nil
	}
	return r.find(ctx, nil, bson.M{
		"scene": id.String(),
	})
}

func (r *NLSLayer) Save(ctx context.Context, layer nlslayer.NLSLayer) error {
	if !r.f.CanWrite(layer.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewNLSLayer(layer)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *NLSLayer) SaveAll(ctx context.Context, layers nlslayer.NLSLayerList) error {
	if len(layers) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewNLSLayers(layers, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *NLSLayer) Remove(ctx context.Context, id id.NLSLayerID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *NLSLayer) RemoveAll(ctx context.Context, ids id.NLSLayerIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *NLSLayer) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Client().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}
	return nil
}

func (r *NLSLayer) findOne(ctx context.Context, filter interface{}) (nlslayer.NLSLayer, error) {
	c := mongodoc.NewNLSLayerConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.Result[0], nil
}

func filterNLSLayers(ids []id.NLSLayerID, rows []*nlslayer.NLSLayer) nlslayer.NLSLayerList {
	res := make([]*nlslayer.NLSLayer, 0, len(ids))
	for _, id := range ids {
		var r2 *nlslayer.NLSLayer
		for _, r := range rows {
			if r == nil {
				continue
			}
			if r3 := *r; r3 != nil && r3.ID() == id {
				r2 = &r3
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func (r *NLSLayer) find(ctx context.Context, dst nlslayer.NLSLayerList, filter interface{}) (nlslayer.NLSLayerList, error) {
	c := mongodoc.NewNLSLayerConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return lo.ToSlicePtr(c.Result), nil
}

func (r *NLSLayer) findNLSLayerSimpleOne(ctx context.Context, filter interface{}) (*nlslayer.NLSLayerSimple, error) {
	c := mongodoc.NewNLSLayerConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return nlslayer.ToNLSLayerSimple(c.Result[0]), nil
}

func (r *NLSLayer) findNLSLayerGroupOne(ctx context.Context, filter interface{}) (*nlslayer.NLSLayerGroup, error) {
	c := mongodoc.NewNLSLayerConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return nlslayer.ToNLSLayerGroup(c.Result[0]), nil
}

func (r *NLSLayer) findNLSLayerSimples(ctx context.Context, dst nlslayer.NLSLayerSimpleList, filter interface{}) (nlslayer.NLSLayerSimpleList, error) {
	c := mongodoc.NewNLSLayerConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return nlslayer.NLSLayerList(lo.ToSlicePtr(c.Result)).ToLayerItemList(), nil
}

func (r *NLSLayer) findNLSLayerGroups(ctx context.Context, dst nlslayer.NLSLayerGroupList, filter interface{}) (nlslayer.NLSLayerGroupList, error) {
	c := mongodoc.NewNLSLayerConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return nlslayer.NLSLayerList(lo.ToSlicePtr(c.Result)).ToNLSLayerGroupList(), nil
}

func filterNLSLayerSimples(ids []id.NLSLayerID, rows []*nlslayer.NLSLayerSimple) []*nlslayer.NLSLayerSimple {
	res := make([]*nlslayer.NLSLayerSimple, 0, len(ids))
	for _, id := range ids {
		var r2 *nlslayer.NLSLayerSimple
		for _, r := range rows {
			if r != nil && r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func filterNLSLayerGroups(ids []id.NLSLayerID, rows []*nlslayer.NLSLayerGroup) []*nlslayer.NLSLayerGroup {
	res := make([]*nlslayer.NLSLayerGroup, 0, len(ids))
	for _, id := range ids {
		var r2 *nlslayer.NLSLayerGroup
		for _, r := range rows {
			if r != nil && r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func (r *NLSLayer) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
