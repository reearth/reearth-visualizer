package mongo

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	"github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	workspaceIndexes       = []string{"alias"}
	workspaceUniqueIndexes = []string{"id"}
)

type Workspace struct {
	client *mongox.ClientCollection
	f      accountsRepo.WorkspaceFilter
}

func NewWorkspace(client *mongox.Client) accountsRepo.Workspace {
	return &Workspace{
		client: client.WithCollection("workspace"),
	}
}

func (r *Workspace) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, workspaceIndexes, workspaceUniqueIndexes)
}

func (r *Workspace) Filtered(f accountsRepo.WorkspaceFilter) accountsRepo.Workspace {
	return &Workspace{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Workspace) FindByID(ctx context.Context, wid id.WorkspaceID) (*workspace.Workspace, error) {
	if !r.f.CanRead(wid) {
		return nil, repo.ErrOperationDenied
	}
	return r.findOne(ctx, bson.M{"id": wid.String()})
}

func (r *Workspace) FindByName(ctx context.Context, name string) (*workspace.Workspace, error) {
	return r.findOne(ctx, bson.M{"name": name})
}

func (r *Workspace) FindByAlias(ctx context.Context, alias string) (*workspace.Workspace, error) {
	return r.findOne(ctx, bson.M{"alias": alias})
}

func (r *Workspace) FindByIDs(ctx context.Context, ids id.WorkspaceIDList) ([]*workspace.Workspace, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	// Filter out IDs we can't read
	readableIDs := make([]string, 0, len(ids))
	for _, wid := range ids {
		if r.f.CanRead(wid) {
			readableIDs = append(readableIDs, wid.String())
		}
	}

	if len(readableIDs) == 0 {
		return nil, nil
	}

	return r.find(ctx, bson.M{"id": bson.M{"$in": readableIDs}})
}

func (r *Workspace) FindByUser(ctx context.Context, uid id.UserID) ([]*workspace.Workspace, error) {
	filter := bson.M{
		"members." + uid.String(): bson.M{"$exists": true},
	}
	return r.find(ctx, filter)
}

func (r *Workspace) FindByUserWithPagination(ctx context.Context, uid id.UserID, pagination *usecasex.Pagination) ([]*workspace.Workspace, *usecasex.PageInfo, error) {
	filter := bson.M{
		"members." + uid.String(): bson.M{"$exists": true},
	}

	c := mongodoc.NewWorkspaceConsumer(r.f.Readable)
	pageInfo, err := r.client.Paginate(ctx, filter, nil, pagination, c)
	if err != nil {
		return nil, nil, err
	}

	return c.Result, pageInfo, nil
}

func (r *Workspace) FindByIntegration(ctx context.Context, iid id.IntegrationID) ([]*workspace.Workspace, error) {
	filter := bson.M{
		"integrations." + iid.String(): bson.M{"$exists": true},
	}
	return r.find(ctx, filter)
}

func (r *Workspace) FindByIntegrations(ctx context.Context, iids id.IntegrationIDList) ([]*workspace.Workspace, error) {
	if len(iids) == 0 {
		return nil, nil
	}

	// Build OR conditions for each integration
	orConditions := make([]bson.M, 0, len(iids))
	for _, iid := range iids {
		orConditions = append(orConditions, bson.M{
			"integrations." + iid.String(): bson.M{"$exists": true},
		})
	}

	return r.find(ctx, bson.M{"$or": orConditions})
}

func (r *Workspace) CheckWorkspaceAliasUnique(ctx context.Context, wid id.WorkspaceID, alias string) error {
	filter := bson.M{
		"alias": alias,
		"id":    bson.M{"$ne": wid.String()},
	}

	c := mongodoc.NewWorkspaceConsumer(nil)
	err := r.client.FindOne(ctx, filter, c)
	if err == nil && len(c.Result) > 0 {
		return rerror.ErrAlreadyExists
	}
	if err != mongo.ErrNoDocuments {
		return err
	}
	return nil
}

func (r *Workspace) Create(ctx context.Context, ws *workspace.Workspace) error {
	if !r.f.CanWrite(ws.ID()) {
		return repo.ErrOperationDenied
	}

	doc, id := mongodoc.NewWorkspace(ws)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Workspace) Save(ctx context.Context, ws *workspace.Workspace) error {
	if !r.f.CanWrite(ws.ID()) {
		return repo.ErrOperationDenied
	}

	doc, id := mongodoc.NewWorkspace(ws)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Workspace) SaveAll(ctx context.Context, wsList []*workspace.Workspace) error {
	for _, ws := range wsList {
		if !r.f.CanWrite(ws.ID()) {
			return repo.ErrOperationDenied
		}
	}

	docs := make([]string, 0, len(wsList))
	vals := make([]interface{}, 0, len(wsList))
	for _, ws := range wsList {
		doc, id := mongodoc.NewWorkspace(ws)
		docs = append(docs, id)
		vals = append(vals, doc)
	}

	return r.client.SaveAll(ctx, docs, vals)
}

func (r *Workspace) Remove(ctx context.Context, wid id.WorkspaceID) error {
	if !r.f.CanWrite(wid) {
		return repo.ErrOperationDenied
	}

	return r.client.RemoveOne(ctx, bson.M{"id": wid.String()})
}

func (r *Workspace) RemoveAll(ctx context.Context, ids id.WorkspaceIDList) error {
	for _, wid := range ids {
		if !r.f.CanWrite(wid) {
			return repo.ErrOperationDenied
		}
	}

	for _, wid := range ids {
		if err := r.Remove(ctx, wid); err != nil {
			return err
		}
	}
	return nil
}

// Helper methods

func (r *Workspace) find(ctx context.Context, filter bson.M) ([]*workspace.Workspace, error) {
	c := mongodoc.NewWorkspaceConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Workspace) findOne(ctx context.Context, filter bson.M) (*workspace.Workspace, error) {
	c := mongodoc.NewWorkspaceConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, rerror.ErrNotFound
		}
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.Result[0], nil
}
