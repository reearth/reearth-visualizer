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
	f      repo.TeamFilter
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

func (r *projectRepo) Filtered(f repo.TeamFilter) repo.Project {
	return &projectRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *projectRepo) FindByIDs(ctx context.Context, ids []id.ProjectID) ([]*project.Project, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.ProjectIDsToStrings(ids),
		},
	}
	dst := make([]*project.Project, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterProjects(ids, res), nil
}

func (r *projectRepo) FindByID(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *projectRepo) FindByTeam(ctx context.Context, id id.TeamID, pagination *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecase.EmptyPageInfo(), nil
	}
	return r.paginate(ctx, bson.M{
		"team": id.String(),
	}, pagination)
}

func (r *projectRepo) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}
	return r.findOne(ctx, bson.M{
		"$or": []bson.M{
			{"alias": name, "publishmentstatus": "limited"},
			{"domains.domain": name, "publishmentstatus": "public"},
			{"alias": name, "publishmentstatus": "public"},
		},
	})
}

func (r *projectRepo) CountByTeam(ctx context.Context, team id.TeamID) (int, error) {
	count, err := r.client.Count(ctx, bson.M{
		"team": team.String(),
	})
	return int(count), err
}

func (r *projectRepo) Save(ctx context.Context, project *project.Project) error {
	if !r.f.CanWrite(project.Team()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProject(project)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *projectRepo) Remove(ctx context.Context, id id.ProjectID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *projectRepo) find(ctx context.Context, dst []*project.Project, filter interface{}) ([]*project.Project, error) {
	c := mongodoc.ProjectConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *projectRepo) findOne(ctx context.Context, filter interface{}) (*project.Project, error) {
	dst := make([]*project.Project, 0, 1)
	c := mongodoc.ProjectConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *projectRepo) paginate(ctx context.Context, filter bson.M, pagination *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error) {
	var c mongodoc.ProjectConsumer
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), nil, pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
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

func (r *projectRepo) readFilter(filter interface{}) interface{} {
	return applyTeamFilter(filter, r.f.Readable)
}

func (r *projectRepo) writeFilter(filter interface{}) interface{} {
	return applyTeamFilter(filter, r.f.Writable)
}
