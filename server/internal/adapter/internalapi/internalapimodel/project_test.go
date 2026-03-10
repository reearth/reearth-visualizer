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
	tests := []struct {
		name       string
		pagination *pb.Pagination
		wantNil    bool
	}{
		{
			name:       "nil pagination",
			pagination: nil,
			wantNil:    true,
		},
		{
			name: "with first",
			pagination: &pb.Pagination{
				First: lo.ToPtr(int32(10)),
			},
			wantNil: false,
		},
		{
			name: "with last",
			pagination: &pb.Pagination{
				Last: lo.ToPtr(int32(20)),
			},
			wantNil: false,
		},
		{
			name: "with before cursor",
			pagination: &pb.Pagination{
				Before: lo.ToPtr("cursor123"),
				Last:   lo.ToPtr(int32(10)),
			},
			wantNil: false,
		},
		{
			name: "with after cursor",
			pagination: &pb.Pagination{
				After: lo.ToPtr("cursor456"),
				First: lo.ToPtr(int32(10)),
			},
			wantNil: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := ToProjectPagination(tt.pagination)
			if tt.wantNil {
				assert.Nil(t, got)
			} else {
				assert.NotNil(t, got)
			}
		})
	}
}

func TestToProjectPageInfo(t *testing.T) {
	startCursor := usecasex.Cursor("start")
	endCursor := usecasex.Cursor("end")

	tests := []struct {
		name string
		info *usecasex.PageInfo
		want *pb.PageInfo
	}{
		{
			name: "nil info",
			info: nil,
			want: &pb.PageInfo{
				TotalCount:      0,
				HasNextPage:     false,
				HasPreviousPage: false,
			},
		},
		{
			name: "with all fields",
			info: &usecasex.PageInfo{
				TotalCount:      100,
				HasNextPage:     true,
				HasPreviousPage: true,
				StartCursor:     &startCursor,
				EndCursor:       &endCursor,
			},
			want: &pb.PageInfo{
				TotalCount:      100,
				HasNextPage:     true,
				HasPreviousPage: true,
				StartCursor:     lo.ToPtr("start"),
				EndCursor:       lo.ToPtr("end"),
			},
		},
		{
			name: "without cursors",
			info: &usecasex.PageInfo{
				TotalCount:      50,
				HasNextPage:     false,
				HasPreviousPage: true,
			},
			want: &pb.PageInfo{
				TotalCount:      50,
				HasNextPage:     false,
				HasPreviousPage: true,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := ToProjectPageInfo(tt.info)
			assert.Equal(t, tt.want.TotalCount, got.TotalCount)
			assert.Equal(t, tt.want.HasNextPage, got.HasNextPage)
			assert.Equal(t, tt.want.HasPreviousPage, got.HasPreviousPage)
			if tt.want.StartCursor != nil {
				assert.Equal(t, *tt.want.StartCursor, *got.StartCursor)
			}
			if tt.want.EndCursor != nil {
				assert.Equal(t, *tt.want.EndCursor, *got.EndCursor)
			}
		})
	}
}

func TestToVisualizer(t *testing.T) {
	tests := []struct {
		name string
		v    visualizer.Visualizer
		want pb.Visualizer
	}{
		{
			name: "cesium",
			v:    visualizer.VisualizerCesium,
			want: pb.Visualizer_VISUALIZER_CESIUM,
		},
		{
			name: "cesium beta",
			v:    visualizer.VisualizerCesiumBeta,
			want: pb.Visualizer_VISUALIZER_CESIUM_BETA,
		},
		{
			name: "unspecified",
			v:    visualizer.Visualizer("unknown"),
			want: pb.Visualizer_VISUALIZER_UNSPECIFIED,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToVisualizer(tt.v))
		})
	}
}

func TestToPublishmentStatus(t *testing.T) {
	tests := []struct {
		name string
		s    project.PublishmentStatus
		want pb.PublishmentStatus
	}{
		{
			name: "public",
			s:    project.PublishmentStatusPublic,
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC,
		},
		{
			name: "limited",
			s:    project.PublishmentStatusLimited,
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_LIMITED,
		},
		{
			name: "private",
			s:    project.PublishmentStatusPrivate,
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_PRIVATE,
		},
		{
			name: "unknown",
			s:    project.PublishmentStatus("unknown"),
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToPublishmentStatus(tt.s))
		})
	}
}

func TestToStoryPublishmentStatus(t *testing.T) {
	tests := []struct {
		name string
		s    storytelling.PublishmentStatus
		want pb.PublishmentStatus
	}{
		{
			name: "public",
			s:    storytelling.PublishmentStatusPublic,
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC,
		},
		{
			name: "limited",
			s:    storytelling.PublishmentStatusLimited,
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_LIMITED,
		},
		{
			name: "private",
			s:    storytelling.PublishmentStatusPrivate,
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_PRIVATE,
		},
		{
			name: "unknown",
			s:    storytelling.PublishmentStatus("unknown"),
			want: pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToStoryPublishmentStatus(tt.s))
		})
	}
}

func TestToProjectImportStatus(t *testing.T) {
	tests := []struct {
		name string
		v    project.ProjectImportStatus
		want pb.ProjectImportStatus
	}{
		{
			name: "none",
			v:    project.ProjectImportStatusNone,
			want: pb.ProjectImportStatus_NONE,
		},
		{
			name: "processing",
			v:    project.ProjectImportStatusProcessing,
			want: pb.ProjectImportStatus_PROCESSING,
		},
		{
			name: "failed",
			v:    project.ProjectImportStatusFailed,
			want: pb.ProjectImportStatus_FAIL,
		},
		{
			name: "success",
			v:    project.ProjectImportStatusSuccess,
			want: pb.ProjectImportStatus_SUCCESS,
		},
		{
			name: "unknown defaults to none",
			v:    project.ProjectImportStatus("unknown"),
			want: pb.ProjectImportStatus_NONE,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToProjectImportStatus(tt.v))
		})
	}
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
