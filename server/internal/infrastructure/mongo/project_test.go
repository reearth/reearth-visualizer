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
	pid5 := id.NewProjectID()

	// Create projects with different visibility and names
	now := time.Now()
	_, err := c.Collection("project").InsertMany(ctx, []any{
		bson.M{
			"id":          pid1.String(),
			"workspace":   wid.String(),
			"name":        "Public Project 1",
			"description": "Description for Public Project 1",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid2.String(),
			"workspace":   wid.String(),
			"name":        "Public Project 2",
			"description": "Description for Public Project 2",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid3.String(),
			"workspace":   wid.String(),
			"name":        "Private Project 3",
			"description": "Description for Private Project 3",
			"deleted":     false,
			"visibility":  "private",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid4.String(),
			"workspace":   wid.String(),
			"name":        "Deleted Project 4",
			"description": "Description for Deleted Project 4",
			"deleted":     true,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid5.String(),
			"workspace":   wid.String(),
			"name":        "Public Project 5",
			"description": "Description for Public Project 3",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
	})
	assert.NoError(t, err)

	// Create project metadata with topics
	pmid1 := id.NewProjectMetadataID()
	pmid2 := id.NewProjectMetadataID()
	pmid3 := id.NewProjectMetadataID()
	pmid5 := id.NewProjectMetadataID()

	_, err = c.Collection("projectmetadata").InsertMany(ctx, []any{
		bson.M{
			"id":        pmid1.String(),
			"project":   pid1.String(),
			"workspace": wid.String(),
			"topics":    []string{"gis", "mapping"},
		},
		bson.M{
			"id":        pmid2.String(),
			"project":   pid2.String(),
			"workspace": wid.String(),
			"topics":    []string{"3d", "visualization"},
		},
		bson.M{
			"id":        pmid3.String(),
			"project":   pid3.String(),
			"workspace": wid.String(),
			"topics":    []string{"gis", "analysis"},
		},
		bson.M{
			"id":        pmid5.String(),
			"project":   pid5.String(),
			"workspace": wid.String(),
			"topics":    []string{"gis", "mapping"},
		},
	})
	assert.NoError(t, err)

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("FindAll without filters", func(t *testing.T) {
		visibility := "public"
		limit := int64(100)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got)) // Only public, non-deleted projects (pid1, pid2, pid5)

		// Verify projects are the expected ones
		projectIds := []id.ProjectID{got[0].ID(), got[1].ID(), got[2].ID()}
		assert.Contains(t, projectIds, pid1)
		assert.Contains(t, projectIds, pid2)
		assert.Contains(t, projectIds, pid5)
	})

	t.Run("FindAll with keyword filter", func(t *testing.T) {
		keyword := "Project 1"
		visibility := "public"
		limit := int64(100)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Keyword:    &keyword,
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
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
		filter := repo.ProjectFilter{
			Topics: topics,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		// Both pid1 and pid3 have "gis" in their topics
		assert.Equal(t, 2, len(got))
		projectIds := []id.ProjectID{got[0].ID(), got[1].ID()}
		assert.Contains(t, projectIds, pid1)
		assert.Contains(t, projectIds, pid5)
	})

	t.Run("FindAll with multiple topics filter", func(t *testing.T) {
		topics := []string{"gis", "mapping"}
		visibility := "public"
		filter := repo.ProjectFilter{
			Topics:     topics,
			Visibility: &visibility,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		// Both pid1 and pid5 have both "gis" and "mapping" topics
		assert.Equal(t, 2, len(got))
		projectIds := []id.ProjectID{got[0].ID(), got[1].ID()}
		assert.Contains(t, projectIds, pid1)
		assert.Contains(t, projectIds, pid5)
	})

	t.Run("FindAll with keyword and topics filter", func(t *testing.T) {
		keyword := "Project"
		topics := []string{"gis"}
		visibility := "public"
		filter := repo.ProjectFilter{
			Keyword:    &keyword,
			Topics:     topics,
			Visibility: &visibility,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 2, len(got)) // Both pid1 and pid5 match keyword "Project" and have "gis" topic
		projectIds := []id.ProjectID{got[0].ID(), got[1].ID()}
		assert.Contains(t, projectIds, pid1)
		assert.Contains(t, projectIds, pid5)
	})

	t.Run("FindAll with non-matching topic", func(t *testing.T) {
		topics := []string{"nonexistent"}
		visibility := "public"
		filter := repo.ProjectFilter{
			Topics:     topics,
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
			Topics:     topics,
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
		assert.Equal(t, int64(3), pageInfo.TotalCount)
		assert.True(t, pageInfo.HasNextPage)
		assert.False(t, pageInfo.HasPreviousPage)
	})

	t.Run("FindAll with sort by starcount", func(t *testing.T) {
		// Add starcount to projectmetadata
		_, err := c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid1.String()}, bson.M{"$set": bson.M{"starcount": 5}})
		assert.NoError(t, err)
		_, err = c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid2.String()}, bson.M{"$set": bson.M{"starcount": 10}})
		assert.NoError(t, err)
		_, err = c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid5.String()}, bson.M{"$set": bson.M{"starcount": 3}})
		assert.NoError(t, err)

		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))
		// pid2 should come first (starcount: 10), then pid1 (starcount: 5), then pid5 (starcount: 3)
		assert.Equal(t, pid2, got[0].ID())
		assert.Equal(t, pid1, got[1].ID())
		assert.Equal(t, pid5, got[2].ID())
	})

	t.Run("FindAll with sort by updatedat DESC", func(t *testing.T) {
		// Update updatedat for pid1, pid2, and pid5
		now1 := time.Now().Add(-2 * time.Hour) // oldest
		now2 := time.Now()                     // newest
		now5 := time.Now().Add(-1 * time.Hour) // middle
		_, err := c.Collection("project").UpdateOne(ctx, bson.M{"id": pid1.String()}, bson.M{"$set": bson.M{"updatedat": now1}})
		assert.NoError(t, err)
		_, err = c.Collection("project").UpdateOne(ctx, bson.M{"id": pid2.String()}, bson.M{"$set": bson.M{"updatedat": now2}})
		assert.NoError(t, err)
		_, err = c.Collection("project").UpdateOne(ctx, bson.M{"id": pid5.String()}, bson.M{"$set": bson.M{"updatedat": now5}})
		assert.NoError(t, err)

		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "updatedat", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))
		// pid2 should come first (newest), then pid5 (middle), then pid1 (oldest)
		assert.Equal(t, pid2, got[0].ID())
		assert.Equal(t, pid5, got[1].ID())
		assert.Equal(t, pid1, got[2].ID())
	})

	t.Run("FindAll with sort by starcount ASC", func(t *testing.T) {
		// Set starcount values for testing ASC order
		_, err := c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid1.String()}, bson.M{"$set": bson.M{"starcount": 5}})
		assert.NoError(t, err)
		_, err = c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid2.String()}, bson.M{"$set": bson.M{"starcount": 10}})
		assert.NoError(t, err)
		_, err = c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid5.String()}, bson.M{"$set": bson.M{"starcount": 3}})
		assert.NoError(t, err)

		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: false} // ASC order
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))
		// ASC order: pid5 (3), pid1 (5), pid2 (10)
		assert.Equal(t, pid5, got[0].ID())
		assert.Equal(t, pid1, got[1].ID())
		assert.Equal(t, pid2, got[2].ID())
	})

	t.Run("FindAll with sort by updatedat ASC", func(t *testing.T) {
		// Set different updatedat values for testing ASC order
		now1 := time.Now().Add(-3 * time.Hour) // oldest
		now2 := time.Now().Add(-1 * time.Hour) // newest
		now5 := time.Now().Add(-2 * time.Hour) // middle
		_, err := c.Collection("project").UpdateOne(ctx, bson.M{"id": pid1.String()}, bson.M{"$set": bson.M{"updatedat": now1}})
		assert.NoError(t, err)
		_, err = c.Collection("project").UpdateOne(ctx, bson.M{"id": pid2.String()}, bson.M{"$set": bson.M{"updatedat": now2}})
		assert.NoError(t, err)
		_, err = c.Collection("project").UpdateOne(ctx, bson.M{"id": pid5.String()}, bson.M{"$set": bson.M{"updatedat": now5}})
		assert.NoError(t, err)

		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "updatedat", Desc: false} // ASC order
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))
		// ASC order: pid1 (oldest), pid5 (middle), pid2 (newest)
		assert.Equal(t, pid1, got[0].ID())
		assert.Equal(t, pid5, got[1].ID())
		assert.Equal(t, pid2, got[2].ID())
	})
}

func TestProject_FindAll_SecondarySort(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()

	// Create projects with same updatedat to test secondary sort by _id
	now := time.Now()
	pid1 := id.NewProjectID() // Will be lexicographically first when sorted by string
	pid2 := id.NewProjectID()
	pid3 := id.NewProjectID()

	// Ensure pid1 < pid2 < pid3 lexicographically by creating them in order
	// This way we can predict the secondary sort order
	pidList := []id.ProjectID{pid1, pid2, pid3}

	// Insert projects with identical updatedat values
	_, err := c.Collection("project").InsertMany(ctx, []any{
		bson.M{
			"id":          pid1.String(),
			"workspace":   wid.String(),
			"name":        "Project A",
			"description": "Test project A",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now, // Same updatedat
		},
		bson.M{
			"id":          pid2.String(),
			"workspace":   wid.String(),
			"name":        "Project B",
			"description": "Test project B",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now, // Same updatedat
		},
		bson.M{
			"id":          pid3.String(),
			"workspace":   wid.String(),
			"name":        "Project C",
			"description": "Test project C",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now, // Same updatedat
		},
	})
	assert.NoError(t, err)

	// Create project metadata with identical starcount values
	pmid1 := id.NewProjectMetadataID()
	pmid2 := id.NewProjectMetadataID()
	pmid3 := id.NewProjectMetadataID()

	_, err = c.Collection("projectmetadata").InsertMany(ctx, []any{
		bson.M{
			"id":        pmid1.String(),
			"project":   pid1.String(),
			"workspace": wid.String(),
			"starcount": 5, // Same starcount
		},
		bson.M{
			"id":        pmid2.String(),
			"project":   pid2.String(),
			"workspace": wid.String(),
			"starcount": 5, // Same starcount
		},
		bson.M{
			"id":        pmid3.String(),
			"project":   pid3.String(),
			"workspace": wid.String(),
			"starcount": 5, // Same starcount
		},
	})
	assert.NoError(t, err)

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("Default sort with secondary _id sort", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
		}

		// Run the query multiple times to ensure consistent ordering
		var firstResults []id.ProjectID
		for i := 0; i < 3; i++ {
			got, pageInfo, err := r.FindAll(ctx, filter)
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 3, len(got))

			currentResults := []id.ProjectID{got[0].ID(), got[1].ID(), got[2].ID()}

			if i == 0 {
				firstResults = currentResults
			} else {
				// Results should be identical across multiple runs (deterministic)
				assert.Equal(t, firstResults, currentResults, "Results should be deterministic across multiple queries")
			}
		}

		// Results should be sorted by starcount DESC, then _id DESC
		// Since all have same starcount, order should be determined by _id DESC
		assert.Equal(t, pidList[2], firstResults[0], "First result should have largest _id")
		assert.Equal(t, pidList[1], firstResults[1], "Second result should have middle _id")
		assert.Equal(t, pidList[0], firstResults[2], "Third result should have smallest _id")
	})

	t.Run("Sort by updatedat DESC with secondary _id sort", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "updatedat", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		// Run the query multiple times to ensure consistent ordering
		var firstResults []id.ProjectID
		for i := 0; i < 3; i++ {
			got, pageInfo, err := r.FindAll(ctx, filter)
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 3, len(got))

			currentResults := []id.ProjectID{got[0].ID(), got[1].ID(), got[2].ID()}

			if i == 0 {
				firstResults = currentResults
			} else {
				// Results should be identical across multiple runs (deterministic)
				assert.Equal(t, firstResults, currentResults, "Results should be deterministic across multiple queries")
			}
		}

		// Results should be sorted by updatedat DESC, then _id DESC
		// Since all have same updatedat, order should be determined by _id DESC
		assert.Equal(t, pidList[2], firstResults[0], "First result should have largest _id")
		assert.Equal(t, pidList[1], firstResults[1], "Second result should have middle _id")
		assert.Equal(t, pidList[0], firstResults[2], "Third result should have smallest _id")
	})

	t.Run("Sort by updatedat ASC with secondary _id sort", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "updatedat", Desc: false}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))

		// Results should be sorted by updatedat ASC, then _id ASC
		// Since all have same updatedat, order should be determined by _id ASC
		results := []id.ProjectID{got[0].ID(), got[1].ID(), got[2].ID()}
		assert.Equal(t, pidList[0], results[0], "First result should have smallest _id")
		assert.Equal(t, pidList[1], results[1], "Second result should have middle _id")
		assert.Equal(t, pidList[2], results[2], "Third result should have largest _id")
	})

	t.Run("Sort by starcount DESC with secondary _id sort", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))

		// Results should be sorted by starcount DESC, then _id DESC
		// Since all have same starcount, order should be determined by _id DESC
		results := []id.ProjectID{got[0].ID(), got[1].ID(), got[2].ID()}
		assert.Equal(t, pidList[2], results[0], "First result should have largest _id")
		assert.Equal(t, pidList[1], results[1], "Second result should have middle _id")
		assert.Equal(t, pidList[0], results[2], "Third result should have smallest _id")
	})

	t.Run("Sort by starcount ASC with secondary _id sort", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: false}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))

		// Results should be sorted by starcount ASC, then _id ASC
		// Since all have same starcount, order should be determined by _id ASC
		results := []id.ProjectID{got[0].ID(), got[1].ID(), got[2].ID()}
		assert.Equal(t, pidList[0], results[0], "First result should have smallest _id")
		assert.Equal(t, pidList[1], results[1], "Second result should have middle _id")
		assert.Equal(t, pidList[2], results[2], "Third result should have largest _id")
	})
}

func TestProject_FindByWorkspaces_100Projects_SecondarySort(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	now := time.Now()

	// Create 100 projects with identical primary sort values to test secondary sort by id
	var projectDocs []any
	var projectIDs []id.ProjectID

	for i := 0; i < 100; i++ {
		pid := id.NewProjectID()
		projectIDs = append(projectIDs, pid)

		projectDocs = append(projectDocs, bson.M{
			"id":          pid.String(),
			"workspace":   wid.String(),
			"name":        fmt.Sprintf("Project %03d", i),
			"description": fmt.Sprintf("Test project %d", i),
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now, // Same updatedat for all projects
		})
	}

	// Insert all projects
	_, err := c.Collection("project").InsertMany(ctx, projectDocs)
	assert.NoError(t, err)

	// Create project metadata with identical starcount values
	var metadataDocs []any
	for i, pid := range projectIDs {
		pmid := id.NewProjectMetadataID()
		metadataDocs = append(metadataDocs, bson.M{
			"id":        pmid.String(),
			"project":   pid.String(),
			"workspace": wid.String(),
			"starcount": 10,                                    // Same starcount for all projects
			"topics":    []string{fmt.Sprintf("topic%d", i%5)}, // Vary topics for filtering tests
		})
	}

	_, err = c.Collection("projectmetadata").InsertMany(ctx, metadataDocs)
	assert.NoError(t, err)

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("FindByWorkspaces with identical updatedat - should be deterministic", func(t *testing.T) {
		limit := int64(100)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Sort:   &project.SortType{Key: "updatedat", Desc: true},
			Limit:  &limit,
			Offset: &offset,
		}

		// Run the query multiple times to ensure consistent ordering
		var firstResults []string
		for run := 0; run < 3; run++ {
			got, pageInfo, err := r.FindByWorkspaces(ctx, true, filter, []string{wid.String()}, []string{}, []string{wid.String()})
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 100, len(got))

			currentResults := make([]string, len(got))
			for i, project := range got {
				currentResults[i] = project.ID().String()
			}

			if run == 0 {
				firstResults = currentResults
			} else {
				// Results should be identical across multiple runs (deterministic)
				assert.Equal(t, firstResults, currentResults,
					"Results should be deterministic across multiple queries (run %d)", run)
			}
		}

		// Verify results are sorted by id as secondary sort (DESC order)
		for i := 1; i < len(firstResults); i++ {
			// Since updatedat is the same for all, they should be sorted by id DESC
			assert.True(t, firstResults[i-1] > firstResults[i],
				"Projects should be sorted by id DESC when updatedat is identical")
		}
	})

	t.Run("FindByWorkspaces with identical starcount - should be deterministic", func(t *testing.T) {
		limit := int64(100)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Sort:   &project.SortType{Key: "starcount", Desc: true},
			Limit:  &limit,
			Offset: &offset,
		}

		// Run the query multiple times
		var firstResults []string
		for run := 0; run < 3; run++ {
			got, pageInfo, err := r.FindByWorkspaces(ctx, true, filter, []string{wid.String()}, []string{}, []string{wid.String()})
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 100, len(got))

			currentResults := make([]string, len(got))
			for i, project := range got {
				currentResults[i] = project.ID().String()
			}

			if run == 0 {
				firstResults = currentResults
			} else {
				assert.Equal(t, firstResults, currentResults,
					"Results should be deterministic for starcount sort (run %d)", run)
			}
		}

		// Verify results are sorted by id as secondary sort (DESC order)
		for i := 1; i < len(firstResults); i++ {
			assert.True(t, firstResults[i-1] > firstResults[i],
				"Projects should be sorted by id DESC when starcount is identical")
		}
	})

	t.Run("FindByWorkspaces ASC sort with secondary id sort", func(t *testing.T) {
		limit := int64(100)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Sort:   &project.SortType{Key: "updatedat", Desc: false},
			Limit:  &limit,
			Offset: &offset,
		}

		got, pageInfo, err := r.FindByWorkspaces(ctx, true, filter, []string{wid.String()}, []string{}, []string{wid.String()})
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 100, len(got))

		results := make([]string, len(got))
		for i, project := range got {
			results[i] = project.ID().String()
		}

		// Verify results are sorted by id as secondary sort (ASC order)
		for i := 1; i < len(results); i++ {
			assert.True(t, results[i-1] < results[i],
				"Projects should be sorted by id ASC when updatedat is identical and sort is ASC")
		}
	})

	t.Run("FindByWorkspaces with pagination - basic functionality", func(t *testing.T) {
		limit := int64(50)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Sort:   &project.SortType{Key: "updatedat", Desc: true},
			Limit:  &limit,
			Offset: &offset,
		}

		got, pageInfo, err := r.FindByWorkspaces(ctx, true, filter, []string{wid.String()}, []string{}, []string{wid.String()})
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.True(t, len(got) > 0, "Should return some results")

		for i := 1; i < len(got); i++ {
			assert.True(t, got[i-1].ID().String() > got[i].ID().String(),
				"Results should be sorted by ID DESC as secondary sort")
		}
	})

	t.Run("FindByWorkspaces with sorting verification", func(t *testing.T) {
		limit := int64(100)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Sort:   &project.SortType{Key: "updatedat", Desc: true},
			Limit:  &limit,
			Offset: &offset,
		}

		got, pageInfo, err := r.FindByWorkspaces(ctx, true, filter, []string{wid.String()}, []string{}, []string{wid.String()})
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.True(t, len(got) > 0, "Should return some projects")

		var lastTime time.Time
		var lastID string
		for i, p := range got {
			currentTime := p.UpdatedAt()
			currentID := p.ID().String()

			if i > 0 {
				if currentTime.Equal(lastTime) {
					assert.True(t, lastID > currentID,
						"When updatedat is equal, should be sorted by ID DESC")
				} else {
					assert.True(t, !currentTime.After(lastTime),
						"Should be sorted by updatedat DESC")
				}
			}

			lastTime = currentTime
			lastID = currentID
		}
	})
}

func TestProject_FindAll_100Projects_SecondarySort(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	now := time.Now()

	// Create 100 projects with identical values to test secondary sort
	var projectDocs []any
	var projectIDs []id.ProjectID

	for i := 0; i < 100; i++ {
		pid := id.NewProjectID()
		projectIDs = append(projectIDs, pid)

		projectDocs = append(projectDocs, bson.M{
			"id":          pid.String(),
			"workspace":   wid.String(),
			"name":        fmt.Sprintf("Public Project %03d", i),
			"description": fmt.Sprintf("Public test project %d", i),
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now, // Same updatedat for all
		})
	}

	// Insert all projects
	_, err := c.Collection("project").InsertMany(ctx, projectDocs)
	assert.NoError(t, err)

	// Create project metadata with identical starcount
	var metadataDocs []any
	for _, pid := range projectIDs {
		pmid := id.NewProjectMetadataID()
		metadataDocs = append(metadataDocs, bson.M{
			"id":        pmid.String(),
			"project":   pid.String(),
			"workspace": wid.String(),
			"starcount": 15, // Same starcount for all
		})
	}

	_, err = c.Collection("projectmetadata").InsertMany(ctx, metadataDocs)
	assert.NoError(t, err)

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("FindAll with 100 projects - default sort deterministic", func(t *testing.T) {
		visibility := "public"
		limit := int64(100)
		offset := int64(0)
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
		}

		// Run multiple times to ensure deterministic results
		var firstResults []string
		for run := 0; run < 3; run++ {
			got, pageInfo, err := r.FindAll(ctx, filter)
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 100, len(got))

			currentResults := make([]string, len(got))
			for i, project := range got {
				currentResults[i] = project.ID().String()
			}

			if run == 0 {
				firstResults = currentResults
			} else {
				assert.Equal(t, firstResults, currentResults,
					"FindAll results should be deterministic (run %d)", run)
			}
		}
	})

	t.Run("FindAll starcount sort with 100 projects", func(t *testing.T) {
		visibility := "public"
		limit := int64(100)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 100, len(got))

		// Verify secondary sort by _id DESC (since all starcount are same)
		results := make([]string, len(got))
		for i, project := range got {
			results[i] = project.ID().String()
		}

		for i := 1; i < len(results); i++ {
			assert.True(t, results[i-1] > results[i],
				"Should be sorted by _id DESC when starcount is identical")
		}
	})

	t.Run("FindAll updatedat ASC sort with 100 projects", func(t *testing.T) {
		visibility := "public"
		limit := int64(100)
		offset := int64(0)
		sort := &project.SortType{Key: "updatedat", Desc: false}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 100, len(got))

		// Verify secondary sort by _id ASC (since sort is ASC and all updatedat are same)
		results := make([]string, len(got))
		for i, project := range got {
			results[i] = project.ID().String()
		}

		for i := 1; i < len(results); i++ {
			assert.True(t, results[i-1] < results[i],
				"Should be sorted by _id ASC when updatedat is identical and sort is ASC")
		}
	})

	t.Run("FindAll with pagination across 100 projects", func(t *testing.T) {
		visibility := "public"
		limit := int64(20)
		sort := &project.SortType{Key: "updatedat", Desc: true}

		var allResults []string

		// Fetch 5 pages of 20 projects each
		for page := 0; page < 5; page++ {
			offset := int64(page * 20)
			filter := repo.ProjectFilter{
				Visibility: &visibility,
				Limit:      &limit,
				Offset:     &offset,
				Sort:       sort,
			}

			got, pageInfo, err := r.FindAll(ctx, filter)
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 20, len(got))

			for _, project := range got {
				allResults = append(allResults, project.ID().String())
			}

			// Check pagination info
			if page < 4 {
				assert.True(t, pageInfo.HasNextPage)
			} else {
				assert.False(t, pageInfo.HasNextPage)
			}

			if page > 0 {
				assert.True(t, pageInfo.HasPreviousPage)
			} else {
				assert.False(t, pageInfo.HasPreviousPage)
			}
		}

		// Verify we got all 100 projects
		assert.Equal(t, 100, len(allResults))

		// Verify consistent sorting across pages
		for i := 1; i < len(allResults); i++ {
			assert.True(t, allResults[i-1] > allResults[i],
				"Pagination should maintain consistent sort order")
		}

		// Verify no duplicates
		seen := make(map[string]bool)
		for _, id := range allResults {
			assert.False(t, seen[id], "Should not have duplicate project IDs")
			seen[id] = true
		}
	})
}

func TestProject_FindAll_MixedStarCounts_SecondarySort(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	now := time.Now()

	// Create projects with mixed star counts including duplicates
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	pid3 := id.NewProjectID()
	pid4 := id.NewProjectID()
	pid5 := id.NewProjectID()

	_ = []id.ProjectID{pid1, pid2, pid3, pid4, pid5}

	// Insert projects with identical updatedat
	_, err := c.Collection("project").InsertMany(ctx, []any{
		bson.M{
			"id":          pid1.String(),
			"workspace":   wid.String(),
			"name":        "Project 1",
			"description": "Test project 1",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid2.String(),
			"workspace":   wid.String(),
			"name":        "Project 2",
			"description": "Test project 2",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid3.String(),
			"workspace":   wid.String(),
			"name":        "Project 3",
			"description": "Test project 3",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid4.String(),
			"workspace":   wid.String(),
			"name":        "Project 4",
			"description": "Test project 4",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
		bson.M{
			"id":          pid5.String(),
			"workspace":   wid.String(),
			"name":        "Project 5",
			"description": "Test project 5",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   now,
		},
	})
	assert.NoError(t, err)

	// Create project metadata with mixed star counts: 2, 2, 4, 2, 4
	_, err = c.Collection("projectmetadata").InsertMany(ctx, []any{
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid1.String(),
			"workspace": wid.String(),
			"starcount": 2, // Two projects with starcount 2
		},
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid2.String(),
			"workspace": wid.String(),
			"starcount": 2, // Two projects with starcount 2
		},
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid3.String(),
			"workspace": wid.String(),
			"starcount": 4, // Two projects with starcount 4
		},
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid4.String(),
			"workspace": wid.String(),
			"starcount": 2, // Two projects with starcount 2
		},
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid5.String(),
			"workspace": wid.String(),
			"starcount": 4, // Two projects with starcount 4
		},
	})
	assert.NoError(t, err)

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("Sort by starcount DESC with duplicate star counts", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 5, len(got))

		results := make([]struct {
			ID        string
			StarCount int
		}, len(got))

		// Extract results for verification
		for i, project := range got {
			results[i].ID = project.ID().String()

			// Get starcount from metadata
			var metadata bson.M
			err := c.Collection("projectmetadata").FindOne(ctx, bson.M{"project": project.ID().String()}).Decode(&metadata)
			assert.NoError(t, err)
			results[i].StarCount = int(metadata["starcount"].(int32))
		}

		// Verify primary sort: starcount DESC (4, 4, 2, 2, 2)
		expectedStarCounts := []int{4, 4, 2, 2, 2}
		for i, result := range results {
			assert.Equal(t, expectedStarCounts[i], result.StarCount,
				"Position %d should have starcount %d", i, expectedStarCounts[i])
		}

		// Verify secondary sort within same starcount groups
		// Projects with starcount 4 should be sorted by ID DESC
		group4IDs := []string{results[0].ID, results[1].ID}
		assert.True(t, group4IDs[0] > group4IDs[1],
			"Within starcount 4 group, IDs should be sorted DESC")

		// Projects with starcount 2 should be sorted by ID DESC
		group2IDs := []string{results[2].ID, results[3].ID, results[4].ID}
		for i := 1; i < len(group2IDs); i++ {
			assert.True(t, group2IDs[i-1] > group2IDs[i],
				"Within starcount 2 group, IDs should be sorted DESC")
		}
	})

	t.Run("Sort by starcount ASC with duplicate star counts", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: false}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 5, len(got))

		results := make([]struct {
			ID        string
			StarCount int
		}, len(got))

		// Extract results for verification
		for i, project := range got {
			results[i].ID = project.ID().String()

			// Get starcount from metadata
			var metadata bson.M
			err := c.Collection("projectmetadata").FindOne(ctx, bson.M{"project": project.ID().String()}).Decode(&metadata)
			assert.NoError(t, err)
			results[i].StarCount = int(metadata["starcount"].(int32))
		}

		// Verify primary sort: starcount ASC (2, 2, 2, 4, 4)
		expectedStarCounts := []int{2, 2, 2, 4, 4}
		for i, result := range results {
			assert.Equal(t, expectedStarCounts[i], result.StarCount,
				"Position %d should have starcount %d", i, expectedStarCounts[i])
		}

		// Verify secondary sort within same starcount groups
		// Projects with starcount 2 should be sorted by ID ASC (since primary sort is ASC)
		group2IDs := []string{results[0].ID, results[1].ID, results[2].ID}
		for i := 1; i < len(group2IDs); i++ {
			assert.True(t, group2IDs[i-1] < group2IDs[i],
				"Within starcount 2 group, IDs should be sorted ASC")
		}

		// Projects with starcount 4 should be sorted by ID ASC
		group4IDs := []string{results[3].ID, results[4].ID}
		assert.True(t, group4IDs[0] < group4IDs[1],
			"Within starcount 4 group, IDs should be sorted ASC")
	})

	t.Run("Multiple query runs should be deterministic", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		// Run the same query multiple times
		var firstResults []string
		for run := 0; run < 3; run++ {
			got, pageInfo, err := r.FindAll(ctx, filter)
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 5, len(got))

			currentResults := make([]string, len(got))
			for i, project := range got {
				currentResults[i] = project.ID().String()
			}

			if run == 0 {
				firstResults = currentResults
			} else {
				assert.Equal(t, firstResults, currentResults,
					"Results with duplicate star counts should be deterministic (run %d)", run)
			}
		}
	})
}

func TestProject_FindAll_SameStarCount_DifferentUpdatedat(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()

	wid := accountdomain.NewWorkspaceID()
	baseTime := time.Now()

	// Create projects with same star count but different updatedat values
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	pid3 := id.NewProjectID()

	// Different updatedat times
	time1 := baseTime.Add(-2 * time.Hour) // oldest
	time2 := baseTime.Add(-1 * time.Hour) // middle
	time3 := baseTime                     // newest

	// Insert projects with different updatedat values
	_, err := c.Collection("project").InsertMany(ctx, []any{
		bson.M{
			"id":          pid1.String(),
			"workspace":   wid.String(),
			"name":        "Project 1",
			"description": "Test project 1",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   time1, // oldest
		},
		bson.M{
			"id":          pid2.String(),
			"workspace":   wid.String(),
			"name":        "Project 2",
			"description": "Test project 2",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   time2, // middle
		},
		bson.M{
			"id":          pid3.String(),
			"workspace":   wid.String(),
			"name":        "Project 3",
			"description": "Test project 3",
			"deleted":     false,
			"visibility":  "public",
			"visualizer":  "cesium",
			"coresupport": true,
			"archived":    false,
			"starred":     false,
			"updatedat":   time3, // newest
		},
	})
	assert.NoError(t, err)

	// Create project metadata with identical star counts
	_, err = c.Collection("projectmetadata").InsertMany(ctx, []any{
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid1.String(),
			"workspace": wid.String(),
			"starcount": 3, // Same starcount for all
		},
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid2.String(),
			"workspace": wid.String(),
			"starcount": 3, // Same starcount for all
		},
		bson.M{
			"id":        id.NewProjectMetadataID().String(),
			"project":   pid3.String(),
			"workspace": wid.String(),
			"starcount": 3, // Same starcount for all
		},
	})
	assert.NoError(t, err)

	r := NewProject(mongox.NewClientWithDatabase(c))

	t.Run("Sort by starcount DESC - should fallback to updatedat then ID", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))

		// All should have same starcount
		for _, project := range got {
			var metadata bson.M
			err := c.Collection("projectmetadata").FindOne(ctx, bson.M{"project": project.ID().String()}).Decode(&metadata)
			assert.NoError(t, err)
			assert.Equal(t, int32(3), metadata["starcount"], "All projects should have starcount 3")
		}

		// Should be sorted by updatedat DESC when starcount is same
		// Order should be: pid3 (newest), pid2 (middle), pid1 (oldest)
		assert.True(t, got[0].UpdatedAt().After(got[1].UpdatedAt()),
			"First project should be newer than second")
		assert.True(t, got[1].UpdatedAt().After(got[2].UpdatedAt()),
			"Second project should be newer than third")

		// Verify specific order
		assert.Equal(t, pid3, got[0].ID(), "Newest project should be first")
		assert.Equal(t, pid2, got[1].ID(), "Middle project should be second")
		assert.Equal(t, pid1, got[2].ID(), "Oldest project should be third")
	})

	t.Run("Sort by updatedat DESC - explicit sort should work normally", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "updatedat", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))

		// Should be sorted by updatedat DESC
		// Order should be: pid3 (newest), pid2 (middle), pid1 (oldest)
		assert.True(t, got[0].UpdatedAt().After(got[1].UpdatedAt()),
			"First project should be newer than second")
		assert.True(t, got[1].UpdatedAt().After(got[2].UpdatedAt()),
			"Second project should be newer than third")

		assert.Equal(t, pid3, got[0].ID(), "Newest project should be first")
		assert.Equal(t, pid2, got[1].ID(), "Middle project should be second")
		assert.Equal(t, pid1, got[2].ID(), "Oldest project should be third")
	})

	t.Run("Sort by updatedat ASC - should reverse the order", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "updatedat", Desc: false}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 3, len(got))

		// Should be sorted by updatedat ASC
		// Order should be: pid1 (oldest), pid2 (middle), pid3 (newest)
		assert.True(t, got[0].UpdatedAt().Before(got[1].UpdatedAt()),
			"First project should be older than second")
		assert.True(t, got[1].UpdatedAt().Before(got[2].UpdatedAt()),
			"Second project should be older than third")

		assert.Equal(t, pid1, got[0].ID(), "Oldest project should be first")
		assert.Equal(t, pid2, got[1].ID(), "Middle project should be second")
		assert.Equal(t, pid3, got[2].ID(), "Newest project should be third")
	})

	t.Run("Same starcount different updatedat should be deterministic", func(t *testing.T) {
		visibility := "public"
		limit := int64(10)
		offset := int64(0)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Offset:     &offset,
			Sort:       sort,
		}

		// Run the same query multiple times to ensure consistency
		var firstResults []string
		for run := 0; run < 3; run++ {
			got, pageInfo, err := r.FindAll(ctx, filter)
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 3, len(got))

			currentResults := make([]string, len(got))
			for i, project := range got {
				currentResults[i] = project.ID().String()
			}

			if run == 0 {
				firstResults = currentResults
			} else {
				assert.Equal(t, firstResults, currentResults,
					"Results should be deterministic with same starcount but different updatedat (run %d)", run)
			}
		}

		// Verify the deterministic order is based on updatedat (newest first)
		assert.Equal(t, pid3.String(), firstResults[0], "Newest project should consistently be first")
		assert.Equal(t, pid2.String(), firstResults[1], "Middle project should consistently be second")
		assert.Equal(t, pid1.String(), firstResults[2], "Oldest project should consistently be third")
	})
}
