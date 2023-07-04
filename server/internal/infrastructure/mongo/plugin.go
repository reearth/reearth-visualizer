package mongo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
)

var (
	pluginIndexes       = []string{"scene"}
	pluginUniqueIndexes = []string{"id"}
)

type Plugin struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewPlugin(client *mongox.Client) *Plugin {
	return &Plugin{
		client: client.WithCollection("plugin"),
	}
}

func (r *Plugin) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, pluginIndexes, pluginUniqueIndexes)
}

func (r *Plugin) Filtered(f repo.SceneFilter) repo.Plugin {
	return &Plugin{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Plugin) FindByID(ctx context.Context, pid id.PluginID) (*plugin.Plugin, error) {
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

func (r *Plugin) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	if len(ids) == 0 {
		return nil, nil
	}

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
		res, err = r.find(ctx, bson.M{
			"id": bson.M{"$in": id.PluginIDsToStrings(ids2)},
		})
		if err != nil {
			return nil, err
		}
	}

	return res.Concat(b.List()).MapToIDs(ids), nil
}

func (r *Plugin) Save(ctx context.Context, plugin *plugin.Plugin) error {
	if plugin.ID().System() {
		return errors.New("cannnot save system plugin")
	}
	if s := plugin.ID().Scene(); s != nil && !r.f.CanWrite(*s) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewPlugin(plugin)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Plugin) Remove(ctx context.Context, id id.PluginID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Plugin) find(ctx context.Context, filter any) ([]*plugin.Plugin, error) {
	c := mongodoc.NewPluginConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Plugin) findOne(ctx context.Context, filter any) (*plugin.Plugin, error) {
	c := mongodoc.NewPluginConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

// func (r *Plugin) readFilter(filter any) any {
// 	return applyOptionalSceneFilter(filter, r.f.Readable)
// }

func (r *Plugin) writeFilter(filter any) any {
	return applyOptionalSceneFilter(filter, r.f.Writable)
}
