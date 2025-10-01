package internalapimodel

import (
	"context"
	"strings"

	"github.com/reearth/reearth/server/internal/adapter"
	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"

	"google.golang.org/protobuf/types/known/timestamppb"
)

const (
	ProjectSortField_PROJECT_SORT_FIELD_UNSPECIFIED = "id"
	ProjectSortField_UPDATEDAT                      = "updatedat"
	ProjectSortField_NAME                           = "name"
)

func ToProjectSortType(sort *pb.ProjectSort) *project.SortType {
	if sort == nil {
		return nil
	}

	var key string
	switch sort.Field {
	case pb.ProjectSortField_PROJECT_SORT_FIELD_UNSPECIFIED:
		key = ProjectSortField_PROJECT_SORT_FIELD_UNSPECIFIED
	case pb.ProjectSortField_UPDATEDAT:
		key = ProjectSortField_UPDATEDAT
	case pb.ProjectSortField_NAME:
		key = ProjectSortField_NAME
	default:
		key = ProjectSortField_UPDATEDAT
	}

	var desc bool
	switch sort.Direction {
	case pb.SortDirection_SORT_DIRECTION_UNSPECIFIED:
		desc = true
	case pb.SortDirection_ASC:
		desc = false
	case pb.SortDirection_DESC:
		desc = true
	default:
		desc = true
	}

	return &project.SortType{
		Key:  key,
		Desc: desc,
	}
}

func ToProjectPagination(pagination *pb.Pagination) *usecasex.Pagination {
	if pagination == nil {
		return nil
	}

	return usecasex.CursorPagination{
		Before: usecasex.CursorFromRef(pagination.Before),
		After:  usecasex.CursorFromRef(pagination.After),
		First:  int32ToInt64(pagination.First),
		Last:   int32ToInt64(pagination.Last),
	}.Wrap()
}

func int32ToInt64(i *int32) *int64 {
	if i == nil {
		return nil
	}
	return lo.ToPtr(int64(*i))
}

func ToProjectPageInfo(info *usecasex.PageInfo) *pb.PageInfo {
	if info == nil {
		return &pb.PageInfo{
			TotalCount:      0,
			HasNextPage:     false,
			HasPreviousPage: false,
		}
	}
	
	result := &pb.PageInfo{
		TotalCount:      info.TotalCount,
		HasNextPage:     info.HasNextPage,
		HasPreviousPage: info.HasPreviousPage,
	}
	
	if info.StartCursor != nil {
		result.StartCursor = info.StartCursor.StringRef()
	}
	
	if info.EndCursor != nil {
		result.EndCursor = info.EndCursor.StringRef()
	}
	
	return result
}

func ToInternalProject(ctx context.Context, p *project.Project, storytellings *storytelling.StoryList) *pb.Project {
	if p == nil {
		return nil
	}

	stories := []*pb.Story{}
	if storytellings != nil {
		for _, st := range *storytellings {
			storyPublishedUrl := adapter.CurrentHost(ctx) + "/published.html?alias=" + p.Alias()
			if p.Scene().String() == st.Scene().String() {
				s := &pb.Story{
					Id:                     st.Id().String(),
					StoryAlias:             st.Alias(),
					StoryPublishmentStatus: ToStoryPublishmentStatus(st.PublishmentStatus()),
					StoryPublishedUrl:      &storyPublishedUrl,
				}
				stories = append(stories, s)
			}
		}
	}

	var imageURL *string
	if p.ImageURL() != nil {
		urlStr := p.ImageURL().String()
		imageURL = &urlStr
	}

	editorUrl := adapter.CurrentHost(ctx) + "/scene/" + p.Scene().String() + "/map"
	publishedUrl := adapter.CurrentHost(ctx) + "/published.html?alias=" + p.Alias()

	project := &pb.Project{
		Id:          p.ID().String(),
		WorkspaceId: p.Workspace().String(),
		SceneId:     p.Scene().String(),

		Stories: stories,

		Name:         p.Name(),
		Description:  p.Description(),
		ImageUrl:     imageURL,
		UpdatedAt:    timestamppb.New(p.UpdatedAt()),
		Visualizer:   ToVisualizer(p.Visualizer()),
		IsArchived:   p.IsArchived(),
		CoreSupport:  p.CoreSupport(),
		Starred:      p.Starred(),
		IsDeleted:    p.IsDeleted(),
		Visibility:   p.Visibility(),
		ProjectAlias: p.ProjectAlias(),

		EditorUrl: editorUrl,

		Metadata: ToProjectMetadata(p.Metadata()),

		// Scene publishment
		Alias:             p.Alias(),
		PublishmentStatus: ToPublishmentStatus(p.PublishmentStatus()),
		PublishedUrl:      &publishedUrl,
	}

	return project
}

func ToProjectMetadata(p *project.ProjectMetadata) *pb.ProjectMetadata {
	if p == nil {
		return nil
	}
	var importStatus pb.ProjectImportStatus
	if p.ImportStatus() != nil {
		importStatus = ToProjectImportStatus(*p.ImportStatus())
	}
	var createdAt *timestamppb.Timestamp
	if p.CreatedAt() != nil {
		createdAt = timestamppb.New(*p.CreatedAt())
	}
	var updatedAt *timestamppb.Timestamp
	if p.UpdatedAt() != nil {
		updatedAt = timestamppb.New(*p.UpdatedAt())
	}
	return &pb.ProjectMetadata{
		Id:           p.ID().String(),
		ProjectId:    p.Project().String(),
		WorkspaceId:  p.Workspace().String(),
		Readme:       p.Readme(),
		License:      p.License(),
		Topics:       func() []string {
			if p.Topics() != nil && *p.Topics() != "" {
				return strings.Split(*p.Topics(), ",")
			}
			return nil
		}(),
		ImportStatus: importStatus,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}
}

func ToProjectImportStatus(v project.ProjectImportStatus) pb.ProjectImportStatus {
	switch v {
	case project.ProjectImportStatusNone:
		return pb.ProjectImportStatus_NONE
	case project.ProjectImportStatusProcessing:
		return pb.ProjectImportStatus_PROCESSING
	case project.ProjectImportStatusFailed:
		return pb.ProjectImportStatus_FAIL
	case project.ProjectImportStatusSuccess:
		return pb.ProjectImportStatus_SUCCESS
	default:
		return pb.ProjectImportStatus_NONE
	}
}

func ToVisualizer(v visualizer.Visualizer) pb.Visualizer {
	if v == visualizer.VisualizerCesium {
		return pb.Visualizer_VISUALIZER_CESIUM
	}
	if v == visualizer.VisualizerCesiumBeta {
		return pb.Visualizer_VISUALIZER_CESIUM_BETA
	}
	return pb.Visualizer_VISUALIZER_UNSPECIFIED
}

func ToPublishmentStatus(s project.PublishmentStatus) pb.PublishmentStatus {
	if s == project.PublishmentStatusPublic {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC
	}
	if s == project.PublishmentStatusLimited {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_LIMITED
	}
	if s == project.PublishmentStatusPrivate {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_PRIVATE
	}
	return pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED
}

func ToStoryPublishmentStatus(s storytelling.PublishmentStatus) pb.PublishmentStatus {
	if s == storytelling.PublishmentStatusPublic {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC
	}
	if s == storytelling.PublishmentStatusLimited {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_LIMITED
	}
	if s == storytelling.PublishmentStatusPrivate {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_PRIVATE
	}
	return pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED
}
