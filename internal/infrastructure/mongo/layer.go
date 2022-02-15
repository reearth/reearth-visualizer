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

func (r *layerRepo) FindByID(ctx context.Context, id id.LayerID, f []id.SceneID) (layer.Layer, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findOne(ctx, filter)
}

func (r *layerRepo) FindByIDs(ctx context.Context, ids []id.LayerID, f []id.SceneID) (layer.List, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.LayerIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*layer.Layer, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayers(ids, res), nil
}

func (r *layerRepo) FindAllByDatasetSchema(ctx context.Context, dsid id.DatasetSchemaID) (layer.List, error) {
	filter := bson.D{
		{Key: "group.linkeddatasetschema", Value: dsid.String()},
	}
	return r.find(ctx, nil, filter)
}

func (r *layerRepo) FindItemByID(ctx context.Context, id id.LayerID, f []id.SceneID) (*layer.Item, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findItemOne(ctx, filter)
}

func (r *layerRepo) FindItemByIDs(ctx context.Context, ids []id.LayerID, f []id.SceneID) (layer.ItemList, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.LayerIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*layer.Item, 0, len(ids))
	res, err := r.findItems(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayerItems(ids, res), nil
}

func (r *layerRepo) FindGroupByID(ctx context.Context, id id.LayerID, f []id.SceneID) (*layer.Group, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findGroupOne(ctx, filter)
}

func (r *layerRepo) FindGroupByIDs(ctx context.Context, ids []id.LayerID, f []id.SceneID) (layer.GroupList, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.LayerIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*layer.Group, 0, len(ids))
	res, err := r.findGroups(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterLayerGroups(ids, res), nil
}

func (r *layerRepo) FindGroupBySceneAndLinkedDatasetSchema(ctx context.Context, sceneID id.SceneID, datasetSchemaID id.DatasetSchemaID) (layer.GroupList, error) {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
		{Key: "group.linkeddatasetschema", Value: datasetSchemaID.String()},
	}
	return r.findGroups(ctx, nil, filter)
}

func (r *layerRepo) FindParentsByIDs(ctx context.Context, ids []id.LayerID, scenes []id.SceneID) (layer.GroupList, error) {
	f := bson.M{
		"group.layers": bson.M{"$in": id.LayerIDsToStrings(ids)},
	}
	filter := r.sceneFilter(f, scenes)
	return r.findGroups(ctx, nil, filter)
}

func (r *layerRepo) FindByPluginAndExtension(ctx context.Context, pid id.PluginID, eid *id.PluginExtensionID, scenes []id.SceneID) (layer.List, error) {
	f := bson.M{
		"plugin": pid.String(),
	}
	if eid != nil {
		f["extension"] = eid.String()
	}
	filter := r.sceneFilter(f, scenes)
	return r.find(ctx, nil, filter)
}

func (r *layerRepo) FindByPluginAndExtensionOfBlocks(ctx context.Context, pid id.PluginID, eid *id.PluginExtensionID, scenes []id.SceneID) (layer.List, error) {
	f := bson.M{
		"infobox.fields.plugin": pid.String(),
	}
	if eid != nil {
		f["infobox.fields.extension"] = eid.String()
	}
	filter := r.sceneFilter(f, scenes)
	return r.find(ctx, nil, filter)
}

func (r *layerRepo) FindByProperty(ctx context.Context, id id.PropertyID, f []id.SceneID) (layer.Layer, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "$or", Value: []bson.D{
			{{Key: "property", Value: id.String()}},
			{{Key: "infobox.property", Value: id.String()}},
			{{Key: "infobox.fields.property", Value: id.String()}},
		}},
	}, f)
	return r.findOne(ctx, filter)
}

func (r *layerRepo) FindParentByID(ctx context.Context, id id.LayerID, f []id.SceneID) (*layer.Group, error) {
	filter := r.sceneFilterD(bson.D{
		{Key: "group.layers", Value: id.String()},
	}, f)
	return r.findGroupOne(ctx, filter)
}

func (r *layerRepo) FindByScene(ctx context.Context, id id.SceneID) (layer.List, error) {
	filter := bson.D{
		{Key: "scene", Value: id.String()},
	}
	return r.find(ctx, nil, filter)
}

func (r *layerRepo) Save(ctx context.Context, layer layer.Layer) error {
	doc, id := mongodoc.NewLayer(layer)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *layerRepo) SaveAll(ctx context.Context, layers layer.List) error {
	if layers == nil || len(layers) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewLayers(layers)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *layerRepo) UpdatePlugin(ctx context.Context, old, new id.PluginID, scenes []id.SceneID) error {
	return r.client.UpdateManyMany(
		ctx,
		[]mongodoc.Update{
			{
				Filter: r.sceneFilter(bson.M{"plugin": old.String()}, scenes),
				Update: bson.M{"plugin": new.String()},
			},
			{
				Filter: r.sceneFilter(bson.M{"infobox.fields": bson.M{"$type": "array"}}, scenes),
				Update: bson.M{"infobox.fields.$[if].plugin": new.String()},
				ArrayFilters: []interface{}{
					bson.M{"if.plugin": old.String()},
				},
			},
		},
	)
}

func (r *layerRepo) Remove(ctx context.Context, id id.LayerID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *layerRepo) RemoveAll(ctx context.Context, ids []id.LayerID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, id.LayerIDsToStrings(ids))
}

func (r *layerRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Collection().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *layerRepo) FindByTag(ctx context.Context, tagID id.TagID, f []id.SceneID) (layer.List, error) {
	ids := []id.TagID{tagID}
	tags := id.TagIDsToStrings(ids)
	filter := r.sceneFilter(bson.M{
		"$or": []bson.M{
			{"tags.id": bson.M{"$in": tags}},
			{"tags.tags.id": bson.M{"$in": tags}},
		},
	}, f)

	return r.find(ctx, nil, filter)
}

func (r *layerRepo) find(ctx context.Context, dst layer.List, filter interface{}) (layer.List, error) {
	c := mongodoc.LayerConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *layerRepo) findOne(ctx context.Context, filter bson.D) (layer.Layer, error) {
	c := mongodoc.LayerConsumer{}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	if len(c.Rows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return *c.Rows[0], nil
}

func (r *layerRepo) findItemOne(ctx context.Context, filter bson.D) (*layer.Item, error) {
	c := mongodoc.LayerConsumer{}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	if len(c.ItemRows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.ItemRows[0], nil
}

func (r *layerRepo) findGroupOne(ctx context.Context, filter bson.D) (*layer.Group, error) {
	c := mongodoc.LayerConsumer{}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
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
	if err := r.client.Find(ctx, filter, &c); err != nil {
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
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.GroupRows, nil
}

// func (r *layerRepo) paginate(ctx context.Context, filter bson.D, pagination *usecase.Pagination) (layer.List, *usecase.PageInfo, error) {
// 	var c mongodoc.LayerConsumer
// 	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
// 	if err2 != nil {
// 		return nil, nil, rerror.ErrInternalBy(err2)
// 	}
// 	return c.Rows, pageInfo, nil
// }

// func (r *layerRepo) paginateItems(ctx context.Context, filter bson.D, pagination *usecase.Pagination) (layer.ItemList, *usecase.PageInfo, error) {
// 	var c mongodoc.LayerConsumer
// 	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
// 	if err2 != nil {
// 		return nil, nil, rerror.ErrInternalBy(err2)
// 	}
// 	return c.ItemRows, pageInfo, nil
// }

// func (r *layerRepo) paginateGroups(ctx context.Context, filter bson.D, pagination *usecase.Pagination) (layer.GroupList, *usecase.PageInfo, error) {
// 	var c mongodoc.LayerConsumer
// 	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
// 	if err2 != nil {
// 		return nil, nil, rerror.ErrInternalBy(err2)
// 	}
// 	return c.GroupRows, pageInfo, nil
// }

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

func (*layerRepo) sceneFilterD(filter bson.D, scenes []id.SceneID) bson.D {
	if scenes == nil {
		return filter
	}
	filter = append(filter, bson.E{
		Key:   "scene",
		Value: bson.D{{Key: "$in", Value: id.SceneIDsToStrings(scenes)}},
	})
	return filter
}

func (*layerRepo) sceneFilter(filter bson.M, scenes []id.SceneID) bson.M {
	if scenes == nil {
		return filter
	}
	filter["scene"] = bson.M{"$in": id.SceneIDsToStrings(scenes)}
	return filter
}
