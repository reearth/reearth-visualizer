package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type layerRepo struct {
	client *mongodoc.ClientCollection
	f      repo.SceneFilter
}

func NewLayer(client *mongodoc.Client) repo.Layer {
	r := &layerRepo{client: client.WithCollection("layer")}
	r.init()
	return r
}

func (r *layerRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"plugin", "extension", "scene", "group.layers", "tags.id", "tags.tags.id"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "layer", i)
	}
}

func (r *layerRepo) Filtered(f repo.SceneFilter) repo.Layer {
	return &layerRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *layerRepo) FindByID(ctx context.Context, id id.LayerID) (layer.Layer, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *layerRepo) FindByIDs(ctx context.Context, ids []id.LayerID) (layer.List, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.LayerIDsToStrings(ids),
		},
	}
	dst := make([]*layer.Layer, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayers(ids, res), nil
}

func (r *layerRepo) FindAllByDatasetSchema(ctx context.Context, dsid id.DatasetSchemaID) (layer.List, error) {
	return r.find(ctx, nil, bson.M{
		"group.linkeddatasetschema": dsid.String(),
	})
}

func (r *layerRepo) FindItemByID(ctx context.Context, id id.LayerID) (*layer.Item, error) {
	return r.findItemOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *layerRepo) FindItemByIDs(ctx context.Context, ids []id.LayerID) (layer.ItemList, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.LayerIDsToStrings(ids),
		},
	}
	dst := make([]*layer.Item, 0, len(ids))
	res, err := r.findItems(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayerItems(ids, res), nil
}

func (r *layerRepo) FindGroupByID(ctx context.Context, id id.LayerID) (*layer.Group, error) {
	return r.findGroupOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *layerRepo) FindGroupByIDs(ctx context.Context, ids []id.LayerID) (layer.GroupList, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.LayerIDsToStrings(ids),
		},
	}
	dst := make([]*layer.Group, 0, len(ids))
	res, err := r.findGroups(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayerGroups(ids, res), nil
}

func (r *layerRepo) FindGroupBySceneAndLinkedDatasetSchema(ctx context.Context, sceneID id.SceneID, datasetSchemaID id.DatasetSchemaID) (layer.GroupList, error) {
	return r.findGroups(ctx, nil, bson.M{
		"scene":                     sceneID.String(),
		"group.linkeddatasetschema": datasetSchemaID.String(),
	})
}

func (r *layerRepo) FindParentsByIDs(ctx context.Context, ids []id.LayerID) (layer.GroupList, error) {
	return r.findGroups(ctx, nil, bson.M{
		"group.layers": bson.M{"$in": id.LayerIDsToStrings(ids)},
	})
}

func (r *layerRepo) FindByPluginAndExtension(ctx context.Context, pid id.PluginID, eid *id.PluginExtensionID) (layer.List, error) {
	filter := bson.M{
		"plugin": pid.String(),
	}
	if eid != nil {
		filter["extension"] = eid.String()
	}
	return r.find(ctx, nil, filter)
}

func (r *layerRepo) FindByPluginAndExtensionOfBlocks(ctx context.Context, pid id.PluginID, eid *id.PluginExtensionID) (layer.List, error) {
	filter := bson.M{
		"infobox.fields.plugin": pid.String(),
	}
	if eid != nil {
		filter["infobox.fields.extension"] = eid.String()
	}
	return r.find(ctx, nil, filter)
}

func (r *layerRepo) FindByProperty(ctx context.Context, id id.PropertyID) (layer.Layer, error) {
	return r.findOne(ctx, bson.M{
		"$or": []bson.M{
			{"property": id.String()},
			{"infobox.property": id.String()},
			{"infobox.fields.property": id.String()},
		},
	})
}

func (r *layerRepo) FindParentByID(ctx context.Context, id id.LayerID) (*layer.Group, error) {
	return r.findGroupOne(ctx, bson.M{
		"group.layers": id.String(),
	})
}

func (r *layerRepo) FindByScene(ctx context.Context, id id.SceneID) (layer.List, error) {
	if !r.f.CanRead(id) {
		return nil, nil
	}
	return r.find(ctx, nil, bson.M{
		"scene": id.String(),
	})
}

func (r *layerRepo) FindByTag(ctx context.Context, tagID id.TagID) (layer.List, error) {
	return r.find(ctx, nil, bson.M{
		"$or": []bson.M{
			{"tags.id": tagID.String()},
			{"tags.tags.id": tagID.String()},
		},
	})
}

func (r *layerRepo) Save(ctx context.Context, layer layer.Layer) error {
	if !r.f.CanWrite(layer.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewLayer(layer)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *layerRepo) SaveAll(ctx context.Context, layers layer.List) error {
	if layers == nil || len(layers) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewLayers(layers, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *layerRepo) UpdatePlugin(ctx context.Context, old, new id.PluginID) error {
	return r.client.UpdateManyMany(
		ctx,
		[]mongodoc.Update{
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

func (r *layerRepo) Remove(ctx context.Context, id id.LayerID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *layerRepo) RemoveAll(ctx context.Context, ids []id.LayerID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": id.LayerIDsToStrings(ids)},
	}))
}

func (r *layerRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Collection().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *layerRepo) find(ctx context.Context, dst layer.List, filter interface{}) (layer.List, error) {
	c := mongodoc.LayerConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *layerRepo) findOne(ctx context.Context, filter interface{}) (layer.Layer, error) {
	c := mongodoc.LayerConsumer{}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	if len(c.Rows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return *c.Rows[0], nil
}

func (r *layerRepo) findItemOne(ctx context.Context, filter interface{}) (*layer.Item, error) {
	c := mongodoc.LayerConsumer{}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	if len(c.ItemRows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.ItemRows[0], nil
}

func (r *layerRepo) findGroupOne(ctx context.Context, filter interface{}) (*layer.Group, error) {
	c := mongodoc.LayerConsumer{}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	if len(c.GroupRows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.GroupRows[0], nil
}

func (r *layerRepo) findItems(ctx context.Context, dst layer.ItemList, filter interface{}) (layer.ItemList, error) {
	c := mongodoc.LayerConsumer{
		ItemRows: dst,
	}
	if c.ItemRows != nil {
		c.Rows = make(layer.List, 0, len(c.ItemRows))
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.ItemRows, nil
}

func (r *layerRepo) findGroups(ctx context.Context, dst layer.GroupList, filter interface{}) (layer.GroupList, error) {
	c := mongodoc.LayerConsumer{
		GroupRows: dst,
	}
	if c.GroupRows != nil {
		c.Rows = make(layer.List, 0, len(c.GroupRows))
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.GroupRows, nil
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

func (r *layerRepo) readFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Readable)
}

func (r *layerRepo) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
