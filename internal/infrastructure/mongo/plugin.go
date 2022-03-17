package mongo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type pluginRepo struct {
	client *mongodoc.ClientCollection
	f      repo.SceneFilter
}

func NewPlugin(client *mongodoc.Client) repo.Plugin {
	r := &pluginRepo{client: client.WithCollection("plugin")}
	r.init()
	return r
}

func (r *pluginRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"scene"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "plugin", i)
	}
}

func (r *pluginRepo) Filtered(f repo.SceneFilter) repo.Plugin {
	return &pluginRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *pluginRepo) FindByID(ctx context.Context, pid id.PluginID) (*plugin.Plugin, error) {
	// TODO: separate built-in plugins to another repository
	if p := builtin.GetPlugin(pid); p != nil {
		return p, nil
	}
	if s := pid.Scene(); s != nil && !r.f.CanRead(*s) {
		return nil, rerror.ErrNotFound
	}
	return r.findOne(ctx, bson.M{
		"id": pid.String(),
	})
}

func (r *pluginRepo) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	// TODO: separate built-in plugins to another repository
	// exclude built-in
	b := plugin.Map{}
	ids2 := make([]id.PluginID, 0, len(ids))
	for _, id := range ids {
		if p := builtin.GetPlugin(id); p != nil {
			b[id] = p
		} else if s := id.Scene(); s == nil || r.f.CanRead(*s) {
			ids2 = append(ids2, id)
		}
	}

	res := make(plugin.List, 0, len(ids2))
	var err error

	if len(ids2) > 0 {
		filter := bson.M{
			"id": bson.M{"$in": id.PluginIDsToStrings(ids2)},
		}
		dst := make([]*plugin.Plugin, 0, len(ids2))
		res, err = r.find(ctx, dst, filter)
		if err != nil {
			return nil, err
		}
	}

	return res.Concat(b.List()).MapToIDs(ids), nil
}

func (r *pluginRepo) Save(ctx context.Context, plugin *plugin.Plugin) error {
	if plugin.ID().System() {
		return errors.New("cannnot save system plugin")
	}
	if s := plugin.ID().Scene(); s != nil && !r.f.CanWrite(*s) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewPlugin(plugin)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *pluginRepo) Remove(ctx context.Context, id id.PluginID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *pluginRepo) find(ctx context.Context, dst []*plugin.Plugin, filter interface{}) ([]*plugin.Plugin, error) {
	c := mongodoc.PluginConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *pluginRepo) findOne(ctx context.Context, filter interface{}) (*plugin.Plugin, error) {
	dst := make([]*plugin.Plugin, 0, 1)
	c := mongodoc.PluginConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *pluginRepo) readFilter(filter interface{}) interface{} {
	return applyOptionalSceneFilter(filter, r.f.Readable)
}

func (r *pluginRepo) writeFilter(filter interface{}) interface{} {
	return applyOptionalSceneFilter(filter, r.f.Writable)
}
