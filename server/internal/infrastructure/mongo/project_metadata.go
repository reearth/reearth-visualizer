package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	projectmetadataIndexes       = []string{"project"}
	projectmetadataUniqueIndexes = []string{"id"}
)

type ProjectMetadata struct {
	client *mongox.ClientCollection
	f      repo.WorkspaceFilter
}

func NewProjectMetadata(client *mongox.Client) *ProjectMetadata {
	return &ProjectMetadata{
		client: client.WithCollection("projectmetadata"),
	}
}

func (r *ProjectMetadata) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, projectmetadataIndexes, projectmetadataUniqueIndexes)
}

func (r *ProjectMetadata) Filtered(f repo.WorkspaceFilter) repo.ProjectMetadata {
	return &ProjectMetadata{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *ProjectMetadata) FindByProjectID(ctx context.Context, id id.ProjectID) (*project.ProjectMetadata, error) {
	return r.findOne(ctx, bson.M{
		"project": id.String(),
	})
}

func (r *ProjectMetadata) FindByProjectIDList(ctx context.Context, ids id.ProjectIDList) ([]*project.ProjectMetadata, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	filter := bson.M{
		"project": bson.M{
			"$in": ids.Strings(),
		},
	}
	c := mongodoc.NewProjectMetadataConsumer(nil)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *ProjectMetadata) Save(ctx context.Context, projectmetadata *project.ProjectMetadata) error {
	if !r.f.CanWrite(projectmetadata.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProjectMetadata(projectmetadata)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *ProjectMetadata) Remove(ctx context.Context, id id.ProjectID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"project": id.String()}))
}

func (r *ProjectMetadata) find(ctx context.Context, filter interface{}) ([]*project.ProjectMetadata, error) {
	c := mongodoc.NewProjectMetadataConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *ProjectMetadata) findOne(ctx context.Context, filter any) (*project.ProjectMetadata, error) {
	c := mongodoc.NewProjectMetadataConsumer(nil)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		// For project metadata, return nil without error when not found
		// This allows graceful handling of missing metadata
		return nil, nil
	}
	if len(c.Result) == 0 {
		return nil, nil
	}
	return c.Result[0], nil
}

func (r *ProjectMetadata) writeFilter(filter interface{}) interface{} {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
