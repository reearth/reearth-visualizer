package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

type Layer struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

var (
	layerIndexes = []string{
		"scene",
		"id,scene",
		"plugin",
		"extension",
		"property",
		"property,scene",
		"group.layers",
		"group.layers,scene",
		"tags.id",
		"tags.tags.id",
		"scene,infobox.fields",
		"infobox.property",
		"infobox.property,scene",
		"infobox.fields.property",
		"infobox.fields.property,scene",
		"group.linkeddatasetschema",
	}
	layerUniqueIndexes = []string{"id"}
)

func NewLayer(client *mongox.Client) *Layer {
	return &Layer{
		client: client.WithCollection("layer"),
	}
}

func (r *Layer) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, layerIndexes, layerUniqueIndexes)
}

func (r *Layer) Filtered(f repo.SceneFilter) repo.Layer {
	return &Layer{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Layer) FindByID(ctx context.Context, id id.LayerID) (layer.Layer, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Layer) FindByIDs(ctx context.Context, ids id.LayerIDList) (layer.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make([]*layer.Layer, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayers(ids, res), nil
}

func (r *Layer) FindAllByDatasetSchema(ctx context.Context, dsid id.DatasetSchemaID) (layer.List, error) {
	return r.find(ctx, nil, bson.M{
		"group.linkeddatasetschema": dsid.String(),
	})
}

func (r *Layer) FindItemByID(ctx context.Context, id id.LayerID) (*layer.Item, error) {
	return r.findItemOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Layer) FindItemByIDs(ctx context.Context, ids id.LayerIDList) (layer.ItemList, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make([]*layer.Item, 0, len(ids))
	res, err := r.findItems(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayerItems(ids, res), nil
}

func (r *Layer) FindGroupByID(ctx context.Context, id id.LayerID) (*layer.Group, error) {
	return r.findGroupOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Layer) FindGroupByIDs(ctx context.Context, ids id.LayerIDList) (layer.GroupList, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make([]*layer.Group, 0, len(ids))
	res, err := r.findGroups(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayerGroups(ids, res), nil
}

func (r *Layer) FindGroupBySceneAndLinkedDatasetSchema(ctx context.Context, sceneID id.SceneID, datasetSchemaID id.DatasetSchemaID) (layer.GroupList, error) {
	return r.findGroups(ctx, nil, bson.M{
		"scene":                     sceneID.String(),
		"group.linkeddatasetschema": datasetSchemaID.String(),
	})
}

func (r *Layer) FindParentsByIDs(ctx context.Context, ids id.LayerIDList) (layer.GroupList, error) {
	return r.findGroups(ctx, nil, bson.M{
		"group.layers": bson.M{"$in": ids.Strings()},
	})
}

func (r *Layer) FindByPluginAndExtension(ctx context.Context, pid id.PluginID, eid *id.PluginExtensionID) (layer.List, error) {
	filter := bson.M{
		"plugin": pid.String(),
	}
	if eid != nil {
		filter["extension"] = eid.String()
	}
	return r.find(ctx, nil, filter)
}

func (r *Layer) FindByPluginAndExtensionOfBlocks(ctx context.Context, pid id.PluginID, eid *id.PluginExtensionID) (layer.List, error) {
	filter := bson.M{
		"infobox.fields.plugin": pid.String(),
	}
	if eid != nil {
		filter["infobox.fields.extension"] = eid.String()
	}
	return r.find(ctx, nil, filter)
}

func (r *Layer) FindByProperty(ctx context.Context, id id.PropertyID) (layer.Layer, error) {
	return r.findOne(ctx, bson.M{
		"$or": []bson.M{
			{"property": id.String()},
			{"infobox.property": id.String()},
			{"infobox.fields.property": id.String()},
		},
	})
}

func (r *Layer) FindParentByID(ctx context.Context, id id.LayerID) (*layer.Group, error) {
	return r.findGroupOne(ctx, bson.M{
		"group.layers": id.String(),
	})
}

func (r *Layer) FindByScene(ctx context.Context, id id.SceneID) (layer.List, error) {
	if !r.f.CanRead(id) {
		return nil, nil
	}
	return r.find(ctx, nil, bson.M{
		"scene": id.String(),
	})
}

func (r *Layer) FindByTag(ctx context.Context, tagID id.TagID) (layer.List, error) {
	return r.find(ctx, nil, bson.M{
		"$or": []bson.M{
			{"tags.id": tagID.String()},
			{"tags.tags.id": tagID.String()},
		},
	})
}

func (r *Layer) CountByScene(ctx context.Context, sid id.SceneID) (int, error) {
	if !r.f.CanRead(sid) {
		return 0, repo.ErrOperationDenied
	}

	c, err := r.client.Count(ctx, bson.M{
		"scene":      sid.String(),
		"group.root": bson.M{"$ne": true},
	})
	return int(c), err
}

func (r *Layer) Save(ctx context.Context, layer layer.Layer) error {
	if !r.f.CanWrite(layer.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewLayer(layer)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Layer) SaveAll(ctx context.Context, layers layer.List) error {
	if len(layers) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewLayers(layers, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *Layer) UpdatePlugin(ctx context.Context, old, new id.PluginID) error {
	return r.client.UpdateManyMany(
		ctx,
		[]mongox.Update{
			{
				Filter: r.writeFilter(bson.M{"plugin": old.String()}),
				Update: bson.M{"plugin": new.String()},
			},
			{
				Filter: r.writeFilter(bson.M{"infobox.fields": bson.M{"$type": "array"}}),
				Update: bson.M{"infobox.fields.$[if].plugin": new.String()},
				ArrayFilters: []interface{}{
					bson.M{"if.plugin": old.String()},
				},
			},
		},
	)
}

func (r *Layer) Remove(ctx context.Context, id id.LayerID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Layer) RemoveAll(ctx context.Context, ids id.LayerIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *Layer) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
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

func (r *Layer) find(ctx context.Context, dst layer.List, filter interface{}) (layer.List, error) {
	c := mongodoc.NewLayerConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return lo.ToSlicePtr(c.Result), nil
}

func (r *Layer) findOne(ctx context.Context, filter interface{}) (layer.Layer, error) {
	c := mongodoc.NewLayerConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.Result[0], nil
}

func (r *Layer) findItemOne(ctx context.Context, filter interface{}) (*layer.Item, error) {
	c := mongodoc.NewLayerConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return layer.ToLayerItem(c.Result[0]), nil
}

func (r *Layer) findGroupOne(ctx context.Context, filter interface{}) (*layer.Group, error) {
	c := mongodoc.NewLayerConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return layer.ToLayerGroup(c.Result[0]), nil
}

func (r *Layer) findItems(ctx context.Context, dst layer.ItemList, filter interface{}) (layer.ItemList, error) {
	c := mongodoc.NewLayerConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return layer.List(lo.ToSlicePtr(c.Result)).ToLayerItemList(), nil
}

func (r *Layer) findGroups(ctx context.Context, dst layer.GroupList, filter interface{}) (layer.GroupList, error) {
	c := mongodoc.NewLayerConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return layer.List(lo.ToSlicePtr(c.Result)).ToLayerGroupList(), nil
}

func filterLayers(ids []id.LayerID, rows []*layer.Layer) []*layer.Layer {
	res := make([]*layer.Layer, 0, len(ids))
	for _, id := range ids {
		var r2 *layer.Layer
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

func filterLayerItems(ids []id.LayerID, rows []*layer.Item) []*layer.Item {
	res := make([]*layer.Item, 0, len(ids))
	for _, id := range ids {
		var r2 *layer.Item
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

func filterLayerGroups(ids []id.LayerID, rows []*layer.Group) []*layer.Group {
	res := make([]*layer.Group, 0, len(ids))
	for _, id := range ids {
		var r2 *layer.Group
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

// func (r *Layer) readFilter(filter interface{}) interface{} {
// 	return applySceneFilter(filter, r.f.Readable)
// }

func (r *Layer) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
