package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	sceneIndexes       = []string{"project", "team"}
	sceneUniqueIndexes = []string{"id"}
)

type Scene struct {
	client *mongox.ClientCollection
	f      repo.WorkspaceFilter
}

func NewScene(client *mongox.Client) *Scene {
	return &Scene{
		client: client.WithCollection("scene"),
	}
}

func (r *Scene) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, sceneIndexes, sceneUniqueIndexes)
}

func (r *Scene) Filtered(f repo.WorkspaceFilter) repo.Scene {
	return &Scene{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Scene) FindByID(ctx context.Context, id id.SceneID) (*scene.Scene, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Scene) FindByIDs(ctx context.Context, ids id.SceneIDList) (scene.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	return r.find(ctx, bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	})
}

func (r *Scene) FindByProject(ctx context.Context, id id.ProjectID) (*scene.Scene, error) {
	return r.findOne(ctx, bson.M{
		"project": id.String(),
	})
}

func (r *Scene) FindByWorkspace(ctx context.Context, workspaces ...accountdomain.WorkspaceID) (scene.List, error) {
	if len(workspaces) == 0 {
		return nil, nil
	}

	workspaces2 := accountdomain.WorkspaceIDList(workspaces)
	if r.f.Readable != nil {
		workspaces2 = workspaces2.Intersect(r.f.Readable)
	}
	res, err := r.find(ctx, bson.M{
		"team": bson.M{"$in": user.WorkspaceIDList(workspaces2).Strings()},
	})
	if err != nil && err != mongo.ErrNilDocument && err != mongo.ErrNoDocuments {
		return nil, err
	}
	return res, nil
}

func (r *Scene) Save(ctx context.Context, scene *scene.Scene) error {
	if !r.f.CanWrite(scene.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewScene(scene)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Scene) Remove(ctx context.Context, id id.SceneID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Scene) find(ctx context.Context, filter interface{}) ([]*scene.Scene, error) {
	c := mongodoc.NewSceneConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Scene) findOne(ctx context.Context, filter any) (*scene.Scene, error) {
	c := mongodoc.NewSceneConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

// func (r *Scene) readFilter(filter any) any {
// 	return applyWorkspaceFilter(filter, r.f.Readable)
// }

func (r *Scene) writeFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
