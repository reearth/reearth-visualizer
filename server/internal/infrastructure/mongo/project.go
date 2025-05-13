package mongo

import (
	"context"
	"fmt"
	"regexp"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	projectIndexes       = []string{"alias", "alias,publishmentstatus", "team"}
	projectUniqueIndexes = []string{"id"}
)

type Project struct {
	client *mongox.ClientCollection
	f      repo.WorkspaceFilter
	s      repo.SceneFilter
}

func NewProject(client *mongox.Client) *Project {
	return &Project{
		client: client.WithCollection("project"),
	}
}

func (r *Project) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, projectIndexes, projectUniqueIndexes)
}

func (r *Project) Filtered(f repo.WorkspaceFilter) repo.Project {
	return &Project{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Project) FindByID(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	prj, err := r.findOne(ctx, bson.M{
		"id": id.String(),
	}, true)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repo.ErrResourceNotFound
		}
		return nil, err
	}

	return prj, nil
}

func (r *Project) FindByScene(ctx context.Context, id id.SceneID) (*project.Project, error) {
	if !r.s.CanRead(id) {
		return nil, nil
	}
	return r.findOne(ctx, bson.M{
		"scene": id.String(),
	}, true)
}

func (r *Project) FindByIDs(ctx context.Context, ids id.ProjectIDList) ([]*project.Project, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterProjects(ids, res), nil
}

func (r *Project) FindByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, uFilter repo.ProjectFilter) ([]*project.Project, *usecasex.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	filter := bson.M{
		"team": id.String(),
		"$or": []bson.M{
			{"deleted": false},
			{"deleted": bson.M{"$exists": false}},
		},
		"coresupport": true,
	}

	if uFilter.Keyword != nil {
		keywordFilter := bson.M{
			"name": bson.M{
				"$regex": primitive.Regex{
					Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*uFilter.Keyword)),
					Options: "i",
				},
			},
		}
		filter = bson.M{"$and": []bson.M{filter, keywordFilter}}
	}

	return r.paginate(ctx, filter, uFilter.Sort, uFilter.Pagination)
}

func (r *Project) FindStarredByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) ([]*project.Project, error) {
	if !r.f.CanRead(id) {
		return nil, repo.ErrOperationDenied
	}

	filter := bson.M{
		"team":    id.String(),
		"starred": true,
		"$or": []bson.M{
			{"deleted": false},
			{"deleted": bson.M{"$exists": false}},
		},
		"coresupport": true,
	}

	return r.find(ctx, filter)
}

func (r *Project) FindDeletedByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) ([]*project.Project, error) {
	if !r.f.CanRead(id) {
		return nil, repo.ErrOperationDenied
	}

	filter := bson.M{
		"team":        id.String(),
		"deleted":     true,
		"coresupport": true,
	}

	return r.find(ctx, filter)
}

func (r *Project) FindActiveById(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	prj, err := r.findOne(ctx, bson.M{
		"id":      id.String(),
		"deleted": false,
	}, true)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repo.ErrResourceNotFound
		}
		return nil, err
	}

	return prj, nil
}

func (r *Project) FindVisibilityByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, authenticated bool) ([]*project.Project, error) {
	var filter bson.M

	if authenticated {
		filter = bson.M{
			"team":    id.String(),
			"deleted": false,
		}
	} else {
		filter = bson.M{
			"team":       id.String(),
			"deleted":    false,
			"visibility": "public",
		}
	}

	return r.find(ctx, filter)
}

func (r *Project) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}

	f := bson.D{
		{
			Key: "$or",
			Value: []bson.D{
				{{Key: "alias", Value: name}, {Key: "publishmentstatus", Value: bson.D{{Key: "$in", Value: []string{"public", "limited"}}}}},
				{{Key: "domains.domain", Value: name}, {Key: "publishmentstatus", Value: "public"}},
			},
		},
	}

	return r.findOne(ctx, f, false)
}

// [TODO] This function is not used when scene alias migration is completed
func (r *Project) CheckAliasUnique(ctx context.Context, name string) error {
	filter := bson.M{
		"$or": []bson.M{
			// {"id": name},
			{"alias": name},
		},
	}
	count, err := r.count(ctx, filter)
	if err != nil {
		return err
	}
	if count > 0 {
		return alias.ErrExistsProjectAlias
	}
	return nil
}

func (r *Project) CountByWorkspace(ctx context.Context, ws accountdomain.WorkspaceID) (int, error) {
	if !r.f.CanRead(ws) {
		return 0, repo.ErrOperationDenied
	}

	count, err := r.client.Count(ctx, bson.M{
		"team": ws.String(),
	})
	return int(count), err
}

func (r *Project) CountPublicByWorkspace(ctx context.Context, ws accountdomain.WorkspaceID) (int, error) {
	if !r.f.CanRead(ws) {
		return 0, repo.ErrOperationDenied
	}

	count, err := r.client.Count(ctx, bson.M{
		"team": ws.String(),
		"publishmentstatus": bson.M{
			"$in": []string{"public", "limited"},
		},
	})
	return int(count), err
}

func (r *Project) Save(ctx context.Context, project *project.Project) error {
	if !r.f.CanWrite(project.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProject(project)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Project) Remove(ctx context.Context, id id.ProjectID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Project) count(ctx context.Context, filter interface{}) (int64, error) {
	return r.client.Count(ctx, filter)
}

func (r *Project) find(ctx context.Context, filter interface{}) ([]*project.Project, error) {
	c := mongodoc.NewProjectConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Project) findOne(ctx context.Context, filter any, filterByWorkspaces bool) (*project.Project, error) {
	var f []accountdomain.WorkspaceID
	if filterByWorkspaces {
		f = r.f.Readable
	}
	c := mongodoc.NewProjectConsumer(f)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *Project) paginate(ctx context.Context, filter any, sort *project.SortType, pagination *usecasex.Pagination) ([]*project.Project, *usecasex.PageInfo, error) {
	var usort *usecasex.Sort
	if sort != nil {
		usort = &usecasex.Sort{
			Key:      sort.Key,
			Reverted: sort.Desc,
		}
	}

	collation := options.Collation{
		Locale:    "en",
		Strength:  3,
		CaseLevel: true,
		Alternate: "shifted",
	}

	findOptions := options.Find().SetCollation(&collation)

	c := mongodoc.NewProjectConsumer(r.f.Readable)
	pageInfo, err := r.client.PaginateProject(ctx, filter, usort, pagination, c, findOptions)
	if err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	return c.Result, pageInfo, nil
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

// func (r *Project) readFilter(filter interface{}) interface{} {
// 	return applyWorkspaceFilter(filter, r.f.Readable)
// }

func (r *Project) writeFilter(filter interface{}) interface{} {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
