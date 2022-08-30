package mongo

import (
	"context"
	"strings"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

type workspaceRepo struct {
	client *mongox.ClientCollection
}

func NewWorkspace(client *mongox.Client) repo.Workspace {
	r := &workspaceRepo{client: client.WithCollection("team")} // DON'T CHANGE NAME
	r.init()
	return r
}

func (r *workspaceRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil, []string{"id"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "workspace", i)
	}
}

func (r *workspaceRepo) FindByUser(ctx context.Context, id id.UserID) (workspace.List, error) {
	return r.find(ctx, bson.M{
		"members." + strings.Replace(id.String(), ".", "", -1): bson.M{
			"$exists": true,
		},
	})
}

func (r *workspaceRepo) FindByIDs(ctx context.Context, ids id.WorkspaceIDList) (workspace.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	res, err := r.find(ctx, bson.M{
		"id": bson.M{"$in": ids.Strings()},
	})
	if err != nil {
		return nil, err
	}
	return filterWorkspaces(ids, res), nil
}

func (r *workspaceRepo) FindByID(ctx context.Context, id id.WorkspaceID) (*workspace.Workspace, error) {
	return r.findOne(ctx, bson.M{"id": id.String()})
}

func (r *workspaceRepo) Save(ctx context.Context, ws *workspace.Workspace) error {
	doc, id := mongodoc.NewWorkspace(ws)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *workspaceRepo) SaveAll(ctx context.Context, workspaces []*workspace.Workspace) error {
	if len(workspaces) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewWorkspaces(workspaces)
	docs2 := make([]interface{}, 0, len(workspaces))
	for _, d := range docs {
		docs2 = append(docs2, d)
	}
	return r.client.SaveAll(ctx, ids, docs2)
}

func (r *workspaceRepo) Remove(ctx context.Context, id id.WorkspaceID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": id.String()})
}

func (r *workspaceRepo) RemoveAll(ctx context.Context, ids id.WorkspaceIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, bson.M{
		"id": bson.M{"$in": ids.Strings()},
	})
}

func (r *workspaceRepo) find(ctx context.Context, filter interface{}) (workspace.List, error) {
	c := mongodoc.NewWorkspaceConsumer()
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *workspaceRepo) findOne(ctx context.Context, filter interface{}) (*workspace.Workspace, error) {
	c := mongodoc.NewWorkspaceConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func filterWorkspaces(ids []id.WorkspaceID, rows workspace.List) workspace.List {
	return rows.FilterByID(ids...)
}
