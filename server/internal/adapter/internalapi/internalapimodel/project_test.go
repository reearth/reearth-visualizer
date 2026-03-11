package internalapimodel

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestToProjectSortType(t *testing.T) {
	t.Run("nil", func(t *testing.T) {
		got := ToProjectSortType(nil)
		assert.Nil(t, got)
	})

	t.Run("unspecified field with ASC", func(t *testing.T) {
		sort := &pb.ProjectSort{
			Field:     pb.ProjectSortField_PROJECT_SORT_FIELD_UNSPECIFIED,
			Direction: pb.SortDirection_ASC,
		}
		got := ToProjectSortType(sort)
		assert.Equal(t, &project.SortType{
			Key:  ProjectSortField_PROJECT_SORT_FIELD_UNSPECIFIED,
			Desc: false,
		}, got)
	})

	t.Run("updatedat field with DESC", func(t *testing.T) {
		sort := &pb.ProjectSort{
			Field:     pb.ProjectSortField_UPDATEDAT,
			Direction: pb.SortDirection_DESC,
		}
		got := ToProjectSortType(sort)
		assert.Equal(t, &project.SortType{
			Key:  ProjectSortField_UPDATEDAT,
			Desc: true,
		}, got)
	})

	t.Run("name field with unspecified direction defaults to DESC", func(t *testing.T) {
		sort := &pb.ProjectSort{
			Field:     pb.ProjectSortField_NAME,
			Direction: pb.SortDirection_SORT_DIRECTION_UNSPECIFIED,
		}
		got := ToProjectSortType(sort)
		assert.Equal(t, &project.SortType{
			Key:  ProjectSortField_NAME,
			Desc: true,
		}, got)
	})

	t.Run("starcount field with ASC", func(t *testing.T) {
		sort := &pb.ProjectSort{
			Field:     pb.ProjectSortField_STARCOUNT,
			Direction: pb.SortDirection_ASC,
		}
		got := ToProjectSortType(sort)
		assert.Equal(t, &project.SortType{
			Key:  ProjectSortField_STARCOUNT,
			Desc: false,
		}, got)
	})
}

func TestToProjectPagination(t *testing.T) {
	t.Run("nil pagination", func(t *testing.T) {
		got := ToProjectPagination(nil)
		assert.Nil(t, got)
	})

	t.Run("with first", func(t *testing.T) {
		pagination := &pb.Pagination{
			First: lo.ToPtr(int32(10)),
		}
		got := ToProjectPagination(pagination)
		assert.NotNil(t, got)
	})

	t.Run("with last", func(t *testing.T) {
		pagination := &pb.Pagination{
			Last: lo.ToPtr(int32(20)),
		}
		got := ToProjectPagination(pagination)
		assert.NotNil(t, got)
	})

	t.Run("with before cursor", func(t *testing.T) {
		pagination := &pb.Pagination{
			Before: lo.ToPtr("cursor123"),
			Last:   lo.ToPtr(int32(10)),
		}
		got := ToProjectPagination(pagination)
		assert.NotNil(t, got)
	})

	t.Run("with after cursor", func(t *testing.T) {
		pagination := &pb.Pagination{
			After: lo.ToPtr("cursor456"),
			First: lo.ToPtr(int32(10)),
		}
		got := ToProjectPagination(pagination)
		assert.NotNil(t, got)
	})
}

func TestToProjectPageInfo(t *testing.T) {
	t.Run("nil info", func(t *testing.T) {
		got := ToProjectPageInfo(nil)
		assert.Equal(t, int64(0), got.TotalCount)
		assert.False(t, got.HasNextPage)
		assert.False(t, got.HasPreviousPage)
	})

	t.Run("with all fields", func(t *testing.T) {
		startCursor := usecasex.Cursor("start")
		endCursor := usecasex.Cursor("end")
		info := &usecasex.PageInfo{
			TotalCount:      100,
			HasNextPage:     true,
			HasPreviousPage: true,
			StartCursor:     &startCursor,
			EndCursor:       &endCursor,
		}
		got := ToProjectPageInfo(info)
		assert.Equal(t, int64(100), got.TotalCount)
		assert.True(t, got.HasNextPage)
		assert.True(t, got.HasPreviousPage)
		require.NotNil(t, got.StartCursor)
		require.NotNil(t, got.EndCursor)
		assert.Equal(t, "start", *got.StartCursor)
		assert.Equal(t, "end", *got.EndCursor)
	})

	t.Run("without cursors", func(t *testing.T) {
		info := &usecasex.PageInfo{
			TotalCount:      50,
			HasNextPage:     false,
			HasPreviousPage: true,
		}
		got := ToProjectPageInfo(info)
		assert.Equal(t, int64(50), got.TotalCount)
		assert.False(t, got.HasNextPage)
		assert.True(t, got.HasPreviousPage)
	})
}

func TestToVisualizer(t *testing.T) {
	t.Run("cesium", func(t *testing.T) {
		assert.Equal(t, pb.Visualizer_VISUALIZER_CESIUM, ToVisualizer(visualizer.VisualizerCesium))
	})

	t.Run("cesium beta", func(t *testing.T) {
		assert.Equal(t, pb.Visualizer_VISUALIZER_CESIUM_BETA, ToVisualizer(visualizer.VisualizerCesiumBeta))
	})

	t.Run("unspecified", func(t *testing.T) {
		assert.Equal(t, pb.Visualizer_VISUALIZER_UNSPECIFIED, ToVisualizer(visualizer.Visualizer("unknown")))
	})
}

func TestToPublishmentStatus(t *testing.T) {
	t.Run("public", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC, ToPublishmentStatus(project.PublishmentStatusPublic))
	})

	t.Run("limited", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_LIMITED, ToPublishmentStatus(project.PublishmentStatusLimited))
	})

	t.Run("private", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_PRIVATE, ToPublishmentStatus(project.PublishmentStatusPrivate))
	})

	t.Run("unknown", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED, ToPublishmentStatus(project.PublishmentStatus("unknown")))
	})
}

func TestToStoryPublishmentStatus(t *testing.T) {
	t.Run("public", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC, ToStoryPublishmentStatus(storytelling.PublishmentStatusPublic))
	})

	t.Run("limited", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_LIMITED, ToStoryPublishmentStatus(storytelling.PublishmentStatusLimited))
	})

	t.Run("private", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_PRIVATE, ToStoryPublishmentStatus(storytelling.PublishmentStatusPrivate))
	})

	t.Run("unknown", func(t *testing.T) {
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED, ToStoryPublishmentStatus(storytelling.PublishmentStatus("unknown")))
	})
}

func TestToProjectImportStatus(t *testing.T) {
	t.Run("none", func(t *testing.T) {
		assert.Equal(t, pb.ProjectImportStatus_NONE, ToProjectImportStatus(project.ProjectImportStatusNone))
	})

	t.Run("processing", func(t *testing.T) {
		assert.Equal(t, pb.ProjectImportStatus_PROCESSING, ToProjectImportStatus(project.ProjectImportStatusProcessing))
	})

	t.Run("failed", func(t *testing.T) {
		assert.Equal(t, pb.ProjectImportStatus_FAIL, ToProjectImportStatus(project.ProjectImportStatusFailed))
	})

	t.Run("success", func(t *testing.T) {
		assert.Equal(t, pb.ProjectImportStatus_SUCCESS, ToProjectImportStatus(project.ProjectImportStatusSuccess))
	})

	t.Run("unknown defaults to none", func(t *testing.T) {
		assert.Equal(t, pb.ProjectImportStatus_NONE, ToProjectImportStatus(project.ProjectImportStatus("unknown")))
	})
}

func TestToInternalProject(t *testing.T) {
	ctx := context.Background()

	t.Run("nil project returns nil", func(t *testing.T) {
		result := ToInternalProject(ctx, nil, nil)
		assert.Nil(t, result)
	})
}

func TestToProjectMetadata(t *testing.T) {
	t.Run("nil metadata returns nil", func(t *testing.T) {
		result := ToProjectMetadata(nil)
		assert.Nil(t, result)
	})

	t.Run("metadata with values", func(t *testing.T) {
		starCount := int64(10)
		topics := []string{"topic1", "topic2"}
		starredBy := []string{"user1", "user2"}

		meta := project.NewProjectMetadata().
			NewID().
			Project(id.NewProjectID()).
			StarCount(&starCount).
			StarredBy(&starredBy).
			Topics(&topics).
			MustBuild()

		result := ToProjectMetadata(meta)
		assert.NotNil(t, result)
		assert.Equal(t, meta.ID().String(), result.Id)
		assert.Equal(t, meta.Project().String(), result.ProjectId)
	})

	t.Run("metadata with nil optional fields", func(t *testing.T) {
		meta := project.NewProjectMetadata().
			NewID().
			Project(id.NewProjectID()).
			MustBuild()

		result := ToProjectMetadata(meta)
		assert.NotNil(t, result)
		assert.Equal(t, []string{}, result.Topics)
		assert.Equal(t, []string{}, result.StarredBy)
		assert.Equal(t, int64(0), *result.StarCount)
	})
}
