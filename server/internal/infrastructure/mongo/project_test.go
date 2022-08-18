package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestProject_CountByWorkspace(t *testing.T) {
	c := connect(t)(t)
	ctx := context.Background()
	wid := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()
	_, _ = c.Collection("project").InsertMany(ctx, []any{
		bson.M{"id": "a", "team": wid.String(), "publishmentstatus": "public"},
		bson.M{"id": "b", "team": wid.String(), "publishmentstatus": "limited"},
		bson.M{"id": "c", "team": wid.String()},
		bson.M{"id": "d", "team": "x", "publishmentstatus": "public"},
	})

	r := NewProject(mongodoc.NewClientWithDatabase(c))
	got, err := r.CountByWorkspace(ctx, wid)
	assert.Equal(t, 3, got)
	assert.NoError(t, err)

	r = r.Filtered(repo.WorkspaceFilter{
		Readable: id.WorkspaceIDList{wid2},
	})
	got, err = r.CountByWorkspace(ctx, wid)
	assert.Equal(t, repo.ErrOperationDenied, err)
	assert.Zero(t, got)
}

func TestProject_CountPublicByWorkspace(t *testing.T) {
	c := connect(t)(t)
	ctx := context.Background()
	wid := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()
	_, _ = c.Collection("project").InsertMany(ctx, []any{
		bson.M{"id": "a", "team": wid.String(), "publishmentstatus": "public"},
		bson.M{"id": "b", "team": wid.String(), "publishmentstatus": "limited"},
		bson.M{"id": "c", "team": wid.String()},
		bson.M{"id": "d", "team": "x", "publishmentstatus": "public"},
	})

	r := NewProject(mongodoc.NewClientWithDatabase(c))
	got, err := r.CountPublicByWorkspace(ctx, wid)
	assert.Equal(t, 2, got)
	assert.NoError(t, err)

	r = r.Filtered(repo.WorkspaceFilter{
		Readable: id.WorkspaceIDList{wid2},
	})
	got, err = r.CountPublicByWorkspace(ctx, wid)
	assert.Equal(t, repo.ErrOperationDenied, err)
	assert.Zero(t, got)
}
