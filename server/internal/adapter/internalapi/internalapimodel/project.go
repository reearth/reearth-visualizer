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
		Id:                p.ID().String(),
		IsArchived:        p.IsArchived(),
		IsBasicAuthActive: p.IsBasicAuthActive(),
		BasicAuthUsername: p.BasicAuthUsername(),
		BasicAuthPassword: p.BasicAuthPassword(),
		UpdatedAt:         timestamppb.New(p.UpdatedAt()),
		PublishedAt:       publishedAt,
		Name:              p.Name(),
		Description:       p.Description(),
		Alias:             p.Alias(),
		ImageUrl:          imageURL,
		PublicTitle:       p.PublicTitle(),
		PublicDescription: p.PublicDescription(),
		PublicImage:       p.PublicImage(),
		PublicNoIndex:     p.PublicNoIndex(),
		WorkspaceId:       p.Workspace().String(),
		Visualizer:        ToVisualizer(p.Visualizer()),
		PublishmentStatus: ToPublishmentStatus(p.PublishmentStatus()),
		CoreSupport:       p.CoreSupport(),
		EnableGa:          p.EnableGA(),
		TrackingId:        p.TrackingID(),
		Starred:           p.Starred(),
		IsDeleted:         p.IsDeleted(),
		Visibility:        p.Visibility(),
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

func ToPublishmentStatus(publishmentStatus project.PublishmentStatus) pb.PublishmentStatus {
	if publishmentStatus == project.PublishmentStatusPublic {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC
	}
	if publishmentStatus == project.PublishmentStatusLimited {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_LIMITED
	}
	if publishmentStatus == project.PublishmentStatusPrivate {
		return pb.PublishmentStatus_PUBLISHMENT_STATUS_PRIVATE
	}
	return pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED
}
