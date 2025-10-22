package mongo

import (
	"context"
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
		bson.M{"id": pid.String(), "workspace": wid.String()},
		bson.M{"id": pid2.String(), "workspace": wid2.String()},
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
		bson.M{"id": "a", "workspace": wid.String(), "publishmentstatus": "public"},
		bson.M{"id": "b", "workspace": wid.String(), "publishmentstatus": "limited"},
		bson.M{"id": "c", "workspace": wid.String()},
		bson.M{"id": "d", "workspace": "x", "publishmentstatus": "public"},
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
		bson.M{"id": "a", "workspace": wid.String(), "publishmentstatus": "public"},
		bson.M{"id": "b", "workspace": wid.String(), "publishmentstatus": "limited"},
		bson.M{"id": "c", "workspace": wid.String()},
		bson.M{"id": "d", "workspace": "x", "publishmentstatus": "public"},
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
		bson.M{"id": pid1.String(), "workspace": wid.String(), "name": "Project 1", "starred": true, "coresupport": true},
		bson.M{"id": pid2.String(), "workspace": wid.String(), "name": "Project 2", "starred": true, "coresupport": true},
		bson.M{"id": pid3.String(), "workspace": wid.String(), "name": "Project 3", "starred": false, "coresupport": true},
		bson.M{"id": pid4.String(), "workspace": wid2.String(), "name": "Project 4", "starred": true, "coresupport": true},
		bson.M{"id": pid5.String(), "workspace": wid2.String(), "name": "Project 5", "starred": true, "coresupport": false},
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
		bson.M{"id": pid1.String(), "workspace": wid.String(), "name": "Project 1", "deleted": false, "coresupport": true},
		bson.M{"id": pid2.String(), "workspace": wid.String(), "name": "Project 2", "deleted": true, "coresupport": true},
		bson.M{"id": pid3.String(), "workspace": wid2.String(), "name": "Project 3", "deleted": false, "coresupport": true},
		bson.M{"id": pid4.String(), "workspace": wid2.String(), "name": "Project 4", "deleted": true, "coresupport": true},
	})

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("FindDeletedByWorkspace", func(t *testing.T) {
		got, err := r.FindDeletedByWorkspace(ctx, wid)
		assert.NoError(t, err)
		assert.Equal(t, 1, len(got))
	})

}

func TestProject_FindAll(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	
	wid := accountdomain.NewWorkspaceID()
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	pid3 := id.NewProjectID()
	pid4 := id.NewProjectID()
	
	// Create projects with different visibility and names
	_, err := c.Collection("project").InsertMany(ctx, []any{
		bson.M{
			"id": pid1.String(), 
			"workspace": wid.String(), 
			"name": "Public Project 1", 
			"deleted": false, 
			"visibility": "public",
		},
		bson.M{
			"id": pid2.String(), 
			"workspace": wid.String(), 
			"name": "Public Project 2", 
			"deleted": false, 
			"visibility": "public",
		},
		bson.M{
			"id": pid3.String(), 
			"workspace": wid.String(), 
			"name": "Private Project 3", 
			"deleted": false, 
			"visibility": "private",
		},
		bson.M{
			"id": pid4.String(), 
			"workspace": wid.String(), 
			"name": "Deleted Project 4", 
			"deleted": true, 
			"visibility": "public",
		},
	})
	assert.NoError(t, err)
	
	// Create project metadata with topics
	pmid1 := id.NewProjectMetadataID()
	pmid2 := id.NewProjectMetadataID()
	pmid3 := id.NewProjectMetadataID()
	
	_, err = c.Collection("projectmetadata").InsertMany(ctx, []any{
		bson.M{
			"id": pmid1.String(),
			"project": pid1.String(),
			"workspace": wid.String(),
			"topics": []string{"gis", "mapping"},
		},
		bson.M{
			"id": pmid2.String(),
			"project": pid2.String(),
			"workspace": wid.String(),
			"topics": []string{"3d", "visualization"},
		},
		bson.M{
			"id": pmid3.String(),
			"project": pid3.String(),
			"workspace": wid.String(),
			"topics": []string{"gis", "analysis"},
		},
	})
	assert.NoError(t, err)
	
	r := NewProject(mongox.NewClientWithDatabase(c))
	
	t.Run("FindAll without filters", func(t *testing.T) {
		visibility := "public"
		filter := repo.ProjectFilter{
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 2, len(got)) // Only public, non-deleted projects
		
		// Verify projects are the expected ones
		projectIds := []id.ProjectID{got[0].ID(), got[1].ID()}
		assert.Contains(t, projectIds, pid1)
		assert.Contains(t, projectIds, pid2)
	})
	
	t.Run("FindAll with keyword filter", func(t *testing.T) {
		keyword := "Project 1"
		visibility := "public"
		filter := repo.ProjectFilter{
			Keyword:    &keyword,
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 1, len(got))
		assert.Equal(t, pid1, got[0].ID())
		assert.Equal(t, "Public Project 1", got[0].Name())
	})
	
	t.Run("FindAll with single topic filter", func(t *testing.T) {
		topics := []string{"gis"}
		visibility := "public"
		filter := repo.ProjectFilter{
			Topics:     &topics,
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 1, len(got)) // Only pid1 has "gis" topic and is public
		assert.Equal(t, pid1, got[0].ID())
	})
	
	t.Run("FindAll with multiple topics filter", func(t *testing.T) {
		topics := []string{"gis", "3d"}
		visibility := "public"
		filter := repo.ProjectFilter{
			Topics:     &topics,
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 2, len(got)) // Both pid1 (gis) and pid2 (3d) match
		
		projectIds := []id.ProjectID{got[0].ID(), got[1].ID()}
		assert.Contains(t, projectIds, pid1)
		assert.Contains(t, projectIds, pid2)
	})
	
	t.Run("FindAll with keyword and topics filter", func(t *testing.T) {
		keyword := "Project"
		topics := []string{"gis"}
		visibility := "public"
		filter := repo.ProjectFilter{
			Keyword:    &keyword,
			Topics:     &topics,
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 1, len(got)) // Only pid1 matches both keyword and topic
		assert.Equal(t, pid1, got[0].ID())
	})
	
	t.Run("FindAll with non-matching topic", func(t *testing.T) {
		topics := []string{"nonexistent"}
		visibility := "public"
		filter := repo.ProjectFilter{
			Topics:     &topics,
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 0, len(got))
		assert.Equal(t, int64(0), pageInfo.TotalCount)
	})
	
	t.Run("FindAll with private visibility", func(t *testing.T) {
		topics := []string{"gis"}
		visibility := "private"
		filter := repo.ProjectFilter{
			Topics:     &topics,
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 1, len(got)) // Only pid3 is private with gis topic
		assert.Equal(t, pid3, got[0].ID())
	})
	
	t.Run("FindAll with pagination", func(t *testing.T) {
		limit := int64(1)
		offset := int64(0)
		visibility := "public"
		filter := repo.ProjectFilter{
			Limit:      &limit,
			Offset:     &offset,
			Visibility: &visibility,
		}
		
		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 1, len(got))
		assert.Equal(t, int64(2), pageInfo.TotalCount)
		assert.True(t, pageInfo.HasNextPage)
		assert.False(t, pageInfo.HasPreviousPage)
	})
}
