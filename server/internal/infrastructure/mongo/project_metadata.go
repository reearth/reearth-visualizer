package mongo

import (
	"context"
	"errors"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	projectmetadataIndexes       = []string{"project"}
	projectmetadataUniqueIndexes = []string{"id"}
)

type ProjectMetadata struct {
	client       *mongox.ClientCollection
	importClient *mongox.ClientCollection
	f            repo.WorkspaceFilter
}

func NewProjectMetadata(client *mongox.Client) *ProjectMetadata {
	return &ProjectMetadata{
		client:       client.WithCollection("projectmetadata"),
		importClient: client.WithCollection("projectimport"),
	}
}

func (r *ProjectMetadata) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, projectmetadataIndexes, projectmetadataUniqueIndexes)
}

func (r *ProjectMetadata) Filtered(f repo.WorkspaceFilter) repo.ProjectMetadata {
	return &ProjectMetadata{
		client:       r.client,
		importClient: r.importClient,
		f:            r.f.Merge(f),
	}
}

func (r *ProjectMetadata) FindByProjectID(ctx context.Context, id id.ProjectID) (*project.ProjectMetadata, error) {
	m, err := r.findOne(ctx, bson.M{
		"project": id.String(),
	})
	if err != nil {
		return nil, err
	}
	return r.mergeImport(ctx, m)
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
	return r.mergeImportList(ctx, c.Result)
}

func (r *ProjectMetadata) Save(ctx context.Context, projectmetadata *project.ProjectMetadata) error {
	if !r.f.CanWrite(projectmetadata.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProjectMetadata(projectmetadata)
	if err := r.client.SaveOne(ctx, id, doc); err != nil {
		return err
	}
	return r.saveImport(ctx, projectmetadata)
}

func (r *ProjectMetadata) Remove(ctx context.Context, id id.ProjectID) error {
	if err := r.client.RemoveOne(ctx, r.writeFilter(bson.M{"project": id.String()})); err != nil {
		return err
	}
	_, err := r.importClient.Client().DeleteOne(ctx, bson.M{"project": id.String()})
	return err
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
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, mongo.ErrNoDocuments
	}
	return c.Result[0], nil
}

func (r *ProjectMetadata) writeFilter(filter interface{}) interface{} {
	return applyWorkspaceFilter(filter, r.f.Writable)
}

func (r *ProjectMetadata) saveImport(ctx context.Context, pm *project.ProjectMetadata) error {
	if pm.ImportStatus() == nil && pm.ImportResultLog() == nil {
		return nil
	}
	now := time.Now().UTC()
	doc := mongodoc.NewProjectImport(pm.Project(), pm.ImportStatus(), pm.ImportResultLog(), &now)
	filter := bson.M{"project": pm.Project().String()}
	upsert := true
	_, err := r.importClient.Client().UpdateOne(ctx, filter, bson.M{"$set": doc}, &options.UpdateOptions{
		Upsert: &upsert,
	})
	return err
}

func (r *ProjectMetadata) mergeImport(ctx context.Context, m *project.ProjectMetadata) (*project.ProjectMetadata, error) {
	if m == nil {
		return nil, nil
	}
	var doc mongodoc.ProjectImportDocument
	err := r.importClient.Client().FindOne(ctx, bson.M{"project": m.Project().String()}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return m, nil
		}
		return nil, err
	}
	status, resultLog := doc.Model()
	m.SetImportStatus(status)
	m.SetImportResultLog(resultLog)
	return m, nil
}

func (r *ProjectMetadata) mergeImportList(ctx context.Context, list []*project.ProjectMetadata) ([]*project.ProjectMetadata, error) {
	if len(list) == 0 {
		return list, nil
	}
	ids := make([]string, 0, len(list))
	for _, m := range list {
		ids = append(ids, m.Project().String())
	}
	cur, err := r.importClient.Client().Find(ctx, bson.M{"project": bson.M{"$in": ids}})
	if err != nil {
		return nil, err
	}
	defer func() { _ = cur.Close(ctx) }()

	byProject := map[string]*mongodoc.ProjectImportDocument{}
	for cur.Next(ctx) {
		var doc mongodoc.ProjectImportDocument
		if err := cur.Decode(&doc); err != nil {
			return nil, err
		}
		byProject[doc.Project] = &doc
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}

	for _, m := range list {
		if doc, ok := byProject[m.Project().String()]; ok {
			status, resultLog := doc.Model()
			m.SetImportStatus(status)
			m.SetImportResultLog(resultLog)
		}
	}
	return list, nil
}
