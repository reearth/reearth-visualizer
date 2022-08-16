package mongo

import (
	"context"
	"strings"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
)

type workspaceRepo struct {
	client *mongodoc.ClientCollection
}

func NewWorkspace(client *mongodoc.Client) repo.Workspace {
	r := &workspaceRepo{client: client.WithCollection("team")} // DON'T CHANGE NAME
	r.init()
	return r
}

func (r *workspaceRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "team", i)
	}
}

func (r *workspaceRepo) FindByUser(ctx context.Context, id id.UserID) (workspace.List, error) {
	return r.find(ctx, nil, bson.M{
		"members." + strings.Replace(id.String(), ".", "", -1): bson.M{
			"$exists": true,
		},
	})
}

func (r *workspaceRepo) FindByIDs(ctx context.Context, ids id.WorkspaceIDList) (workspace.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	dst := make([]*workspace.Workspace, 0, len(ids))
	res, err := r.find(ctx, dst, bson.M{
		"id": bson.M{"$in": ids.Strings()},
	})
	if err != nil {
		return nil, err
	}
	return filterTeams(ids, res), nil
}

func (r *workspaceRepo) FindByID(ctx context.Context, id id.WorkspaceID) (*workspace.Workspace, error) {
	return r.findOne(ctx, bson.M{"id": id.String()})
}

func (r *workspaceRepo) Save(ctx context.Context, team *workspace.Workspace) error {
	doc, id := mongodoc.NewTeam(team)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *workspaceRepo) SaveAll(ctx context.Context, teams []*workspace.Workspace) error {
	if len(teams) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewTeams(teams)
	docs2 := make([]interface{}, 0, len(teams))
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

func (r *workspaceRepo) find(ctx context.Context, dst []*workspace.Workspace, filter interface{}) (workspace.List, error) {
	c := mongodoc.TeamConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *workspaceRepo) findOne(ctx context.Context, filter interface{}) (*workspace.Workspace, error) {
	dst := make([]*workspace.Workspace, 0, 1)
	c := mongodoc.TeamConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterTeams(ids []id.WorkspaceID, rows workspace.List) workspace.List {
	return rows.FilterByID(ids...)
}
