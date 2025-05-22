package gqlmodel

import (
	"encoding/json"
	"net/url"
	"time"

	"github.com/reearth/reearth/server/pkg/project"
)

func FromPublishmentStatus(v PublishmentStatus) project.PublishmentStatus {
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

func ToPublishmentStatus(v project.PublishmentStatus) PublishmentStatus {
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

func ToProject(p *project.Project) *Project {
	if p == nil {
		return nil
	}

	var publishedAtRes *time.Time
	if publishedAt := p.PublishedAt(); !publishedAt.IsZero() {
		publishedAtRes = &publishedAt
	}

	return &Project{
		ID:          IDFrom(p.ID()),
		CreatedAt:   p.CreatedAt(),
		IsArchived:  p.IsArchived(),
		Name:        p.Name(),
		Description: p.Description(),
		ImageURL:    p.ImageURL(),
		UpdatedAt:   p.UpdatedAt(),
		Visualizer:  Visualizer(p.Visualizer()),
		TeamID:      IDFrom(p.Workspace()),
		Starred:     p.Starred(),
		IsDeleted:   p.IsDeleted(),
		Visibility:  p.Visibility(),
		CoreSupport: p.CoreSupport(),

		// publishment
		Alias:             p.Alias(),
		PublishmentStatus: ToPublishmentStatus(p.PublishmentStatus()),
		PublishedAt:       publishedAtRes,
		PublicTitle:       p.PublicTitle(),
		PublicDescription: p.PublicDescription(),
		PublicImage:       p.PublicImage(),
		PublicNoIndex:     p.PublicNoIndex(),
		IsBasicAuthActive: p.IsBasicAuthActive(),
		BasicAuthUsername: p.BasicAuthUsername(),
		BasicAuthPassword: p.BasicAuthPassword(),
		EnableGa:          p.EnableGA(),
		TrackingID:        p.TrackingID(),
	}
}

func ToProjectFromJSON(data map[string]any) *Project {
	var p Project
	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil
	}
	if err := json.Unmarshal(bytes, &p); err != nil {
		return nil
	}
	return &p
}

func ProjectSortTypeFrom(pst *ProjectSort) *project.SortType {
	if pst == nil {
		return nil
	}

	var key string
	switch pst.Field {
	case ProjectSortFieldCreatedat:
		key = "id"
	case ProjectSortFieldUpdatedat:
		key = "updatedat"
	case ProjectSortFieldName:
		key = "name"
	default:
		key = "updatedAt"
	}

	return &project.SortType{
		Key:  key,
		Desc: pst.Direction == SortDirectionDesc,
	}
}

type ProjectExport struct {
	Visualizer  Visualizer `json:"visualizer"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	ImageURL    *url.URL   `json:"imageUrl,omitempty"`
}

func ToProjectExport(p *project.Project) *ProjectExport {
	if p == nil {
		return nil
	}
	return &ProjectExport{
		Visualizer:  Visualizer(p.Visualizer()),
		Name:        p.Name(),
		Description: p.Description(),
		ImageURL:    p.ImageURL(),
	}
}

func ToProjectExportFromJSON(data map[string]any) *ProjectExport {
	var p ProjectExport
	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil
	}
	if err := json.Unmarshal(bytes, &p); err != nil {
		return nil
	}
	return &p
}
