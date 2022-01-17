package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/project"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type projectRepo struct {
	client *mongodoc.ClientCollection
}

func NewProject(client *mongodoc.Client) repo.Project {
	r := &projectRepo{client: client.WithCollection("project")}
	r.init()
	return r
}

func (r *projectRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"alias", "team"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "project", i)
	}
}

func (r *projectRepo) FindByIDs(ctx context.Context, ids []id.ProjectID, f []id.TeamID) ([]*project.Project, error) {
	filter := r.teamFilter(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.ProjectIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*project.Project, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterProjects(ids, res), nil
}

func (r *projectRepo) FindByID(ctx context.Context, id id.ProjectID, f []id.TeamID) (*project.Project, error) {
	filter := r.teamFilter(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findOne(ctx, filter)
}

func (r *projectRepo) FindByTeam(ctx context.Context, id id.TeamID, pagination *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error) {
	filter := bson.D{
		{Key: "team", Value: id.String()},
	}
	return r.paginate(ctx, filter, pagination)
}

func (r *projectRepo) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	var filter bson.D

	if name == "" {
		return nil, nil
	}

	filter = bson.D{
		{Key: "$or", Value: []bson.D{
			{{Key: "alias", Value: name}, {Key: "publishmentstatus", Value: "limited"}},
			{{Key: "domains.domain", Value: name}, {Key: "publishmentstatus", Value: "public"}},
			{{Key: "alias", Value: name}, {Key: "publishmentstatus", Value: "public"}},
		}},
	}
	return r.findOne(ctx, filter)
}

func (r *projectRepo) CountByTeam(ctx context.Context, team id.TeamID) (int, error) {
	count, err := r.client.Count(ctx, bson.D{
		{Key: "team", Value: team.String()},
	})
	return int(count), err
}

func (r *projectRepo) Save(ctx context.Context, project *project.Project) error {
	doc, id := mongodoc.NewProject(project)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *projectRepo) Remove(ctx context.Context, id id.ProjectID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *projectRepo) find(ctx context.Context, dst []*project.Project, filter bson.D) ([]*project.Project, error) {
	c := mongodoc.ProjectConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *projectRepo) findOne(ctx context.Context, filter bson.D) (*project.Project, error) {
	dst := make([]*project.Project, 0, 1)
	c := mongodoc.ProjectConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *projectRepo) paginate(ctx context.Context, filter bson.D, pagination *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error) {
	var c mongodoc.ProjectConsumer
	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
	if err2 != nil {
		return nil, nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, pageInfo, nil
}

func filterProjects(ids []id.ProjectID, rows []*project.Project) []*project.Project {
	res := make([]*project.Project, 0, len(ids))
	for _, id := range ids {
		var r2 *project.Project
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func (*projectRepo) teamFilter(filter bson.D, teams []id.TeamID) bson.D {
	if teams == nil {
		return filter
	}
	filter = append(filter, bson.E{
		Key:   "team",
		Value: bson.D{{Key: "$in", Value: id.TeamIDsToStrings(teams)}},
	})
	return filter
}
