package graphql

import (
	"time"

	"github.com/reearth/reearth-backend/pkg/project"
)

func fromPublishmentStatus(v PublishmentStatus) project.PublishmentStatus {
	switch v {
	case PublishmentStatusPublic:
		return project.PublishmentStatusPublic
	case PublishmentStatusLimited:
		return project.PublishmentStatusLimited
	case PublishmentStatusPrivate:
		return project.PublishmentStatusPrivate
	}
	return project.PublishmentStatus("")
}

func toPublishmentStatus(v project.PublishmentStatus) PublishmentStatus {
	switch v {
	case project.PublishmentStatusPublic:
		return PublishmentStatusPublic
	case project.PublishmentStatusLimited:
		return PublishmentStatusLimited
	case project.PublishmentStatusPrivate:
		return PublishmentStatusPrivate
	}
	return PublishmentStatus("")
}

func toProject(p *project.Project) *Project {
	if p == nil {
		return nil
	}

	var publishedAtRes *time.Time
	if publishedAt := p.PublishedAt(); !publishedAt.IsZero() {
		publishedAtRes = &publishedAt
	}

	return &Project{
		ID:                p.ID().ID(),
		CreatedAt:         p.CreatedAt(),
		IsArchived:        p.IsArchived(),
		IsBasicAuthActive: p.IsBasicAuthActive(),
		BasicAuthUsername: p.BasicAuthUsername(),
		BasicAuthPassword: p.BasicAuthPassword(),
		Alias:             p.Alias(),
		Name:              p.Name(),
		Description:       p.Description(),
		ImageURL:          p.ImageURL(),
		PublishedAt:       publishedAtRes,
		UpdatedAt:         p.UpdatedAt(),
		Visualizer:        Visualizer(p.Visualizer()),
		TeamID:            p.Team().ID(),
		PublishmentStatus: toPublishmentStatus(p.PublishmentStatus()),
		PublicTitle:       p.PublicTitle(),
		PublicDescription: p.PublicDescription(),
		PublicImage:       p.PublicImage(),
		PublicNoIndex:     p.PublicNoIndex(),
	}
}
