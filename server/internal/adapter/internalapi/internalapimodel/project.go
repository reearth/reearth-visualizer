package internalapimodel

import (
	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"

	"google.golang.org/protobuf/types/known/timestamppb"
)

func ToProject(p *project.Project) *pb.Project {
	if p == nil {
		return nil
	}

	var imageURL *string
	if p.ImageURL() != nil {
		urlStr := p.ImageURL().String()
		imageURL = &urlStr
	}

	var publishedAt *timestamppb.Timestamp
	if !p.PublishedAt().IsZero() {
		publishedAt = timestamppb.New(p.PublishedAt())
	}

	return &pb.Project{
		Id:          p.ID().String(),
		WorkspaceId: p.Workspace().String(),

		Name:        p.Name(),
		Description: p.Description(),
		ImageUrl:    imageURL,
		UpdatedAt:   timestamppb.New(p.UpdatedAt()),
		Visualizer:  ToVisualizer(p.Visualizer()),
		IsArchived:  p.IsArchived(),
		CoreSupport: p.CoreSupport(),
		Starred:     p.Starred(),
		IsDeleted:   p.IsDeleted(),
		Visibility:  p.Visibility(),

		Metadata: ToProjectMetadata(p.Metadata()),

		// publishment
		Alias:             p.Alias(),
		PublishmentStatus: ToPublishmentStatus(p.PublishmentStatus()),
		PublishedAt:       publishedAt,
		PublicTitle:       p.PublicTitle(),
		PublicDescription: p.PublicDescription(),
		PublicImage:       p.PublicImage(),
		PublicNoIndex:     p.PublicNoIndex(),
		IsBasicAuthActive: p.IsBasicAuthActive(),
		BasicAuthUsername: p.BasicAuthUsername(),
		BasicAuthPassword: p.BasicAuthPassword(),
		EnableGa:          p.EnableGA(),
		TrackingId:        p.TrackingID(),
	}

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
		Topics:       p.Topics(),
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
