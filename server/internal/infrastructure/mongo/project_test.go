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
	})
	assert.NoError(t, err)

	// Create project metadata with topics
	pmid1 := id.NewProjectMetadataID()
	pmid2 := id.NewProjectMetadataID()
	pmid3 := id.NewProjectMetadataID()

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
		assert.Equal(t, 2, len(got)) // Only public, non-deleted projects

		// Verify projects are the expected ones
		projectIds := []id.ProjectID{got[0].ID(), got[1].ID()}
		assert.Contains(t, projectIds, pid1)
		assert.Contains(t, projectIds, pid2)
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
		visibility := "public"
		filter := repo.ProjectFilter{
			Topics:     topics,
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
			Topics:     topics,
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
			Topics:     topics,
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
		assert.Equal(t, int64(2), pageInfo.TotalCount)
		assert.True(t, pageInfo.HasNextPage)
		assert.False(t, pageInfo.HasPreviousPage)
	})

	t.Run("FindAll with sort by starcount", func(t *testing.T) {
		// Add starcount to projectmetadata
		_, err := c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid1.String()}, bson.M{"$set": bson.M{"starcount": 5}})
		assert.NoError(t, err)
		_, err = c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid2.String()}, bson.M{"$set": bson.M{"starcount": 10}})
		assert.NoError(t, err)

		visibility := "public"
		limit := int64(10)
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 2, len(got))
		// pid2 should come before pid1 because it has higher starcount
		assert.Equal(t, pid2, got[0].ID())
		assert.Equal(t, pid1, got[1].ID())
	})

	t.Run("FindAll with sort by updatedat DESC", func(t *testing.T) {
		// Update updatedat for pid1 and pid2
		now1 := time.Now().Add(-1 * time.Hour)
		now2 := time.Now()
		_, err := c.Collection("project").UpdateOne(ctx, bson.M{"id": pid1.String()}, bson.M{"$set": bson.M{"updatedat": now1}})
		assert.NoError(t, err)
		_, err = c.Collection("project").UpdateOne(ctx, bson.M{"id": pid2.String()}, bson.M{"$set": bson.M{"updatedat": now2}})
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
		assert.Equal(t, 2, len(got))
		// pid2 should come before pid1 because it has newer updatedat
		assert.Equal(t, pid2, got[0].ID())
		assert.Equal(t, pid1, got[1].ID())
	})

	t.Run("FindAll with sort by starcount ASC", func(t *testing.T) {
		// Set starcount values for testing ASC order
		_, err := c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid1.String()}, bson.M{"$set": bson.M{"starcount": 5}})
		assert.NoError(t, err)
		_, err = c.Collection("projectmetadata").UpdateOne(ctx, bson.M{"project": pid2.String()}, bson.M{"$set": bson.M{"starcount": 10}})
		assert.NoError(t, err)

		visibility := "public"
		limit := int64(10)
		sort := &project.SortType{Key: "starcount", Desc: false} // ASC order
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
			Sort:       sort,
		}

		got, pageInfo, err := r.FindAll(ctx, filter)
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 2, len(got))
		// pid1 should come before pid2 because it has lower starcount (5 < 10)
		assert.Equal(t, pid1, got[0].ID())
		assert.Equal(t, pid2, got[1].ID())
	})

	t.Run("FindAll with sort by updatedat ASC", func(t *testing.T) {
		// Set different updatedat values for testing ASC order
		now1 := time.Now().Add(-2 * time.Hour) // older
		now2 := time.Now().Add(-1 * time.Hour) // newer
		_, err := c.Collection("project").UpdateOne(ctx, bson.M{"id": pid1.String()}, bson.M{"$set": bson.M{"updatedat": now1}})
		assert.NoError(t, err)
		_, err = c.Collection("project").UpdateOne(ctx, bson.M{"id": pid2.String()}, bson.M{"$set": bson.M{"updatedat": now2}})
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
		assert.Equal(t, 2, len(got))
		// pid1 should come before pid2 because it has older updatedat (ASC order)
		assert.Equal(t, pid1, got[0].ID())
		assert.Equal(t, pid2, got[1].ID())
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
		filter := repo.ProjectFilter{
			Sort: &project.SortType{Key: "updatedat", Desc: true},
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
		filter := repo.ProjectFilter{
			Sort: &project.SortType{Key: "starcount", Desc: true},
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
		filter := repo.ProjectFilter{
			Sort: &project.SortType{Key: "updatedat", Desc: false},
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

	t.Run("FindByWorkspaces with pagination - consistent across pages", func(t *testing.T) {
		limit := int64(25)
		filter := repo.ProjectFilter{
			Sort: &project.SortType{Key: "updatedat", Desc: true},
		}

		var allResults []string

		// Fetch all pages
		for page := 0; page < 4; page++ {
			offset := int64(page * 25)
			filter.Offset = &offset
			filter.Limit = &limit

			got, pageInfo, err := r.FindByWorkspaces(ctx, true, filter, []string{wid.String()}, []string{}, []string{wid.String()})
			assert.NoError(t, err)
			assert.NotNil(t, pageInfo)
			assert.Equal(t, 25, len(got))

			for _, project := range got {
				allResults = append(allResults, project.ID().String())
			}
		}

		// Verify we got all 100 projects
		assert.Equal(t, 100, len(allResults))

		// Verify consistent sorting across pages
		for i := 1; i < len(allResults); i++ {
			assert.True(t, allResults[i-1] > allResults[i],
				"Pagination should maintain consistent sort order across pages")
		}

		// Verify no duplicates
		seen := make(map[string]bool)
		for _, id := range allResults {
			assert.False(t, seen[id], "Should not have duplicate project IDs across pages")
			seen[id] = true
		}
	})

	t.Run("FindByWorkspaces with mixed primary sort values", func(t *testing.T) {
		// Update some projects to have different updatedat values
		midIdx := len(projectIDs) / 2

		// Set first half to older time
		olderTime := now.Add(-1 * time.Hour)
		for i := 0; i < midIdx; i++ {
			_, err := c.Collection("project").UpdateOne(ctx,
				bson.M{"id": projectIDs[i].String()},
				bson.M{"$set": bson.M{"updatedat": olderTime}})
			assert.NoError(t, err)
		}

		// Set second half to newer time
		newerTime := now.Add(1 * time.Hour)
		for i := midIdx; i < len(projectIDs); i++ {
			_, err := c.Collection("project").UpdateOne(ctx,
				bson.M{"id": projectIDs[i].String()},
				bson.M{"$set": bson.M{"updatedat": newerTime}})
			assert.NoError(t, err)
		}

		filter := repo.ProjectFilter{
			Sort: &project.SortType{Key: "updatedat", Desc: true},
		}

		got, pageInfo, err := r.FindByWorkspaces(ctx, true, filter, []string{wid.String()}, []string{}, []string{wid.String()})
		assert.NoError(t, err)
		assert.NotNil(t, pageInfo)
		assert.Equal(t, 100, len(got))

		// First 50 should be from newer time group
		for i := 0; i < midIdx; i++ {
			projectUpdatedat := got[i].UpdatedAt()
			assert.True(t, projectUpdatedat.Equal(newerTime),
				"First half should be from newer time group")
		}

		// Second 50 should be from older time group
		for i := midIdx; i < len(got); i++ {
			projectUpdatedat := got[i].UpdatedAt()
			assert.True(t, projectUpdatedat.Equal(olderTime),
				"Second half should be from older time group")
		}

		// Within each group, verify secondary sort by id DESC
		newerGroupIds := make([]string, midIdx)
		for i := 0; i < midIdx; i++ {
			newerGroupIds[i] = got[i].ID().String()
		}
		for i := 1; i < len(newerGroupIds); i++ {
			assert.True(t, newerGroupIds[i-1] > newerGroupIds[i],
				"Within newer group, should be sorted by id DESC")
		}

		olderGroupIds := make([]string, midIdx)
		for i := 0; i < midIdx; i++ {
			olderGroupIds[i] = got[midIdx+i].ID().String()
		}
		for i := 1; i < len(olderGroupIds); i++ {
			assert.True(t, olderGroupIds[i-1] > olderGroupIds[i],
				"Within older group, should be sorted by id DESC")
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
		sort := &project.SortType{Key: "starcount", Desc: true}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
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
		sort := &project.SortType{Key: "updatedat", Desc: false}
		filter := repo.ProjectFilter{
			Visibility: &visibility,
			Limit:      &limit,
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
