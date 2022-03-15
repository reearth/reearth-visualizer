package mongo

import (
	"context"
	"strings"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/user"
	"go.mongodb.org/mongo-driver/bson"
)

type teamRepo struct {
	client *mongodoc.ClientCollection
}

func NewTeam(client *mongodoc.Client) repo.Team {
	r := &teamRepo{client: client.WithCollection("team")}
	r.init()
	return r
}

func (r *teamRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "team", i)
	}
}

func (r *teamRepo) FindByUser(ctx context.Context, id id.UserID) (user.TeamList, error) {
	filter := bson.D{
		{Key: "members." + strings.Replace(id.String(), ".", "", -1), Value: bson.D{
			{Key: "$exists", Value: true},
		}},
	}
	return r.find(ctx, nil, filter)
}

func (r *teamRepo) FindByIDs(ctx context.Context, ids []id.TeamID) (user.TeamList, error) {
	filter := bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.TeamIDsToStrings(ids)},
		}},
	}
	dst := make([]*user.Team, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterTeams(ids, res), nil
}

func (r *teamRepo) FindByID(ctx context.Context, id id.TeamID) (*user.Team, error) {
	filter := bson.D{
		{Key: "id", Value: id.String()},
	}
	return r.findOne(ctx, filter)
}

func (r *teamRepo) Save(ctx context.Context, team *user.Team) error {
	doc, id := mongodoc.NewTeam(team)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *teamRepo) SaveAll(ctx context.Context, teams []*user.Team) error {
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

func (r *teamRepo) Remove(ctx context.Context, id id.TeamID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": id.String()})
}

func (r *teamRepo) RemoveAll(ctx context.Context, ids []id.TeamID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, bson.M{
		"id": bson.M{"$in": id.TeamIDsToStrings(ids)},
	})
}

func (r *teamRepo) find(ctx context.Context, dst []*user.Team, filter bson.D) (user.TeamList, error) {
	c := mongodoc.TeamConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *teamRepo) findOne(ctx context.Context, filter bson.D) (*user.Team, error) {
	dst := make([]*user.Team, 0, 1)
	c := mongodoc.TeamConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterTeams(ids []id.TeamID, rows user.TeamList) user.TeamList {
	return rows.FilterByID(ids...)
}
