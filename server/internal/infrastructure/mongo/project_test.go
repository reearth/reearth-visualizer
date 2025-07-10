package mongo

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestProject_FindByIDs(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	pid := id.NewProjectID()
	pid2 := id.NewProjectID()
	wid := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()
	_, _ = c.Collection("project").InsertMany(ctx, []any{
		bson.M{"id": pid.String(), "team": wid.String()},
		bson.M{"id": pid2.String(), "team": wid2.String()},
	})

	r := NewProject(mongox.NewClientWithDatabase(c))
	got, err := r.FindByIDs(ctx, id.ProjectIDList{pid})
	assert.NoError(t, err)
	assert.Equal(t, 1, len(got))
	assert.Equal(t, pid, got[0].ID())

	r2 := r.Filtered(repo.WorkspaceFilter{
		Readable: accountdomain.WorkspaceIDList{wid2},
	})
	got, err = r2.FindByIDs(ctx, id.ProjectIDList{pid, pid2})
	assert.NoError(t, err)
	assert.Equal(t, 2, len(got))
	assert.Nil(t, got[0])
	assert.Equal(t, pid2, got[1].ID())
}

func TestProject_CountByWorkspace(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	wid := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()
	_, _ = c.Collection("project").InsertMany(ctx, []any{
		bson.M{"id": "a", "team": wid.String(), "publishmentstatus": "public"},
		bson.M{"id": "b", "team": wid.String(), "publishmentstatus": "limited"},
		bson.M{"id": "c", "team": wid.String()},
		bson.M{"id": "d", "team": "x", "publishmentstatus": "public"},
	})

	r := NewProject(mongox.NewClientWithDatabase(c))
	got, err := r.CountByWorkspace(ctx, wid)
	assert.Equal(t, 3, got)
	assert.NoError(t, err)

	r2 := r.Filtered(repo.WorkspaceFilter{
		Readable: accountdomain.WorkspaceIDList{wid2},
	})
	got, err = r2.CountByWorkspace(ctx, wid)
	assert.Equal(t, repo.ErrOperationDenied, err)
	assert.Zero(t, got)
}

func TestProject_CountPublicByWorkspace(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	wid := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()
	_, _ = c.Collection("project").InsertMany(ctx, []any{
		bson.M{"id": "a", "team": wid.String(), "publishmentstatus": "public"},
		bson.M{"id": "b", "team": wid.String(), "publishmentstatus": "limited"},
		bson.M{"id": "c", "team": wid.String()},
		bson.M{"id": "d", "team": "x", "publishmentstatus": "public"},
	})

	r := NewProject(mongox.NewClientWithDatabase(c))
	got, err := r.CountPublicByWorkspace(ctx, wid)
	assert.Equal(t, 2, got)
	assert.NoError(t, err)

	r2 := r.Filtered(repo.WorkspaceFilter{
		Readable: accountdomain.WorkspaceIDList{wid2},
	})
	got, err = r2.CountPublicByWorkspace(ctx, wid)
	assert.Equal(t, repo.ErrOperationDenied, err)
	assert.Zero(t, got)
}

func TestProject_FindByPublicName(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	defer util.MockNow(now)()
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	wid := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()
	prj1 := project.New().NewID().Workspace(wid).UpdatedAt(now).Alias("alias").PublishmentStatus(project.PublishmentStatusPublic).MustBuild()
	prj2 := project.New().NewID().Workspace(wid).UpdatedAt(now).Alias("aaaaa").PublishmentStatus(project.PublishmentStatusLimited).MustBuild()
	prj3 := project.New().NewID().Workspace(wid).UpdatedAt(now).Alias("bbbbb").MustBuild()
	_, _ = c.Collection("project").InsertMany(ctx, []any{
		util.DR(mongodoc.NewProject(prj1)),
		util.DR(mongodoc.NewProject(prj2)),
		util.DR(mongodoc.NewProject(prj3)),
	})

	r := NewProject(mongox.NewClientWithDatabase(c))

	got, err := r.FindByPublicName(ctx, "alias")
	assert.NoError(t, err)
	assert.Equal(t, prj1, got)

	got, err = r.FindByPublicName(ctx, "aaaaa")
	assert.NoError(t, err)
	assert.Equal(t, prj2, got)

	got, err = r.FindByPublicName(ctx, "alias2")
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	got, err = r.FindByPublicName(ctx, "bbbbb")
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	// filter should not work because the projects are public
	r2 := r.Filtered(repo.WorkspaceFilter{
		Readable: accountdomain.WorkspaceIDList{wid2},
	})

	got, err = r2.FindByPublicName(ctx, "alias")
	assert.NoError(t, err)
	assert.Equal(t, prj1, got)
}

func TestProject_FindStarredByWorkspace(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	pid3 := id.NewProjectID()
	pid4 := id.NewProjectID()
	pid5 := id.NewProjectID()

	_, _ = c.Collection("project").InsertMany(ctx, []any{
		bson.M{"id": pid1.String(), "team": wid.String(), "name": "Project 1", "starred": true, "coresupport": true},
		bson.M{"id": pid2.String(), "team": wid.String(), "name": "Project 2", "starred": true, "coresupport": true},
		bson.M{"id": pid3.String(), "team": wid.String(), "name": "Project 3", "starred": false, "coresupport": true},
		bson.M{"id": pid4.String(), "team": wid2.String(), "name": "Project 4", "starred": true, "coresupport": true},
		bson.M{"id": pid5.String(), "team": wid2.String(), "name": "Project 5", "starred": true, "coresupport": false},
	})

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("FindStarredByWorkspace", func(t *testing.T) {
		got, err := r.FindStarredByWorkspace(ctx, wid)
		assert.NoError(t, err)
		assert.Equal(t, 2, len(got))
		assert.ElementsMatch(t, []id.ProjectID{pid1, pid2}, []id.ProjectID{got[0].ID(), got[1].ID()})
	})

	t.Run("FindStarredByWorkspace with workspace filter", func(t *testing.T) {
		r2 := r.Filtered(repo.WorkspaceFilter{
			Readable: accountdomain.WorkspaceIDList{wid2},
		})
		got, err := r2.FindStarredByWorkspace(ctx, wid)
		assert.Equal(t, repo.ErrOperationDenied, err)
		assert.Nil(t, got)
	})

	t.Run("FindStarredByWorkspace with different workspace", func(t *testing.T) {
		got, err := r.FindStarredByWorkspace(ctx, wid2)
		assert.NoError(t, err)
		assert.Equal(t, 1, len(got))
		assert.Equal(t, pid4, got[0].ID())
	})

	t.Run("FindStarredByWorkspace with workspace having no starred projects", func(t *testing.T) {
		emptyWid := accountdomain.NewWorkspaceID()
		got, err := r.FindStarredByWorkspace(ctx, emptyWid)
		assert.NoError(t, err)
		assert.Empty(t, got)
	})
}

func TestProject_FindDeletedByWorkspace(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	pid3 := id.NewProjectID()
	pid4 := id.NewProjectID()

	_, _ = c.Collection("project").InsertMany(ctx, []any{
		bson.M{"id": pid1.String(), "team": wid.String(), "name": "Project 1", "deleted": false, "coresupport": true},
		bson.M{"id": pid2.String(), "team": wid.String(), "name": "Project 2", "deleted": true, "coresupport": true},
		bson.M{"id": pid3.String(), "team": wid2.String(), "name": "Project 3", "deleted": false, "coresupport": true},
		bson.M{"id": pid4.String(), "team": wid2.String(), "name": "Project 4", "deleted": true, "coresupport": true},
	})

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("FindDeletedByWorkspace", func(t *testing.T) {
		got, err := r.FindDeletedByWorkspace(ctx, wid)
		assert.NoError(t, err)
		assert.Equal(t, 1, len(got))
	})

}


func TestProject_FindByWorkspaces_OffsetPagination(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	
	wid := accountdomain.NewWorkspaceID()
	
	// Create 25 test projects
	docs := make([]any, 25)
	for i := 0; i < 25; i++ {
		pid := id.NewProjectID()
		docs[i] = bson.M{
			"id":         pid.String(),
			"team":       wid.String(),
			"name":       fmt.Sprintf("Project %d", i),
			"visibility": "public",
			"deleted":    false,
		}
	}
	
	_, err := c.Collection("project").InsertMany(ctx, docs)
	assert.NoError(t, err)
	
	r := NewProject(mongox.NewClientWithDatabase(c))
	
	t.Run("First page with offset pagination", func(t *testing.T) {
		offset := int64(0)
		limit := int64(10)
		
		pFilter := repo.ProjectFilter{
			Offset: &offset,
			Limit:  &limit,
		}
		
		projects, pageInfo, err := r.FindByWorkspaces(ctx, true, pFilter, accountdomain.WorkspaceIDList{wid}, accountdomain.WorkspaceIDList{wid})
		
		assert.NoError(t, err)
		assert.Equal(t, 10, len(projects))
		assert.Equal(t, int64(25), pageInfo.TotalCount)
		assert.True(t, pageInfo.HasNextPage)
		assert.False(t, pageInfo.HasPreviousPage)
	})
	
	t.Run("Middle page with offset pagination", func(t *testing.T) {
		offset := int64(10)
		limit := int64(10)
		
		pFilter := repo.ProjectFilter{
			Offset: &offset,
			Limit:  &limit,
		}
		
		projects, pageInfo, err := r.FindByWorkspaces(ctx, true, pFilter, accountdomain.WorkspaceIDList{wid}, accountdomain.WorkspaceIDList{wid})
		
		assert.NoError(t, err)
		assert.Equal(t, 10, len(projects))
		assert.Equal(t, int64(25), pageInfo.TotalCount)
		assert.True(t, pageInfo.HasNextPage)
		assert.True(t, pageInfo.HasPreviousPage)
	})
	
	t.Run("Last page with offset pagination", func(t *testing.T) {
		offset := int64(20)
		limit := int64(10)
		
		pFilter := repo.ProjectFilter{
			Offset: &offset,
			Limit:  &limit,
		}
		
		projects, pageInfo, err := r.FindByWorkspaces(ctx, true, pFilter, accountdomain.WorkspaceIDList{wid}, accountdomain.WorkspaceIDList{wid})
		
		assert.NoError(t, err)
		assert.Equal(t, 5, len(projects)) // Only 5 remaining projects
		assert.Equal(t, int64(25), pageInfo.TotalCount)
		assert.False(t, pageInfo.HasNextPage)
		assert.True(t, pageInfo.HasPreviousPage)
	})
	
	t.Run("Offset beyond total count", func(t *testing.T) {
		offset := int64(30)
		limit := int64(10)
		
		pFilter := repo.ProjectFilter{
			Offset: &offset,
			Limit:  &limit,
		}
		
		projects, pageInfo, err := r.FindByWorkspaces(ctx, true, pFilter, accountdomain.WorkspaceIDList{wid}, accountdomain.WorkspaceIDList{wid})
		
		assert.NoError(t, err)
		assert.Equal(t, 0, len(projects))
		assert.Equal(t, int64(25), pageInfo.TotalCount)
		assert.False(t, pageInfo.HasNextPage)
		assert.True(t, pageInfo.HasPreviousPage)
	})
}
