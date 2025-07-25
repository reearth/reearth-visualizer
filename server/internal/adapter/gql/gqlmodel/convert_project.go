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

func FromProjectImportStatus(v ProjectImportStatus) project.ProjectImportStatus {
	switch v {
	case ProjectImportStatusProcessing:
		return project.ProjectImportStatusProcessing
	case ProjectImportStatusFailed:
		return project.ProjectImportStatusFailed
	case ProjectImportStatusSuccess:
		return project.ProjectImportStatusSuccess
	}
	return project.ProjectImportStatusNone
}

func ToProjectImportStatus(v project.ProjectImportStatus) ProjectImportStatus {
	switch v {
	case project.ProjectImportStatusProcessing:
		return ProjectImportStatusProcessing
	case project.ProjectImportStatusFailed:
		return ProjectImportStatusFailed
	case project.ProjectImportStatusSuccess:
		return ProjectImportStatusSuccess
	}
	return ProjectImportStatusNone
}

func ToProjectMetadata(pm *project.ProjectMetadata) *ProjectMetadata {
	if pm == nil {
		return nil
	}
	importStatus := ToProjectImportStatus(*pm.ImportStatus())

	return &ProjectMetadata{
		ID:           IDFrom(pm.ID()),
		Workspace:    IDFrom(pm.Workspace()),
		Project:      IDFrom(pm.Project()),
		Readme:       pm.Readme(),
		License:      pm.License(),
		Topics:       pm.Topics(),
		ImportStatus: &importStatus,
		CreatedAt:    pm.CreatedAt(),
		UpdatedAt:    pm.UpdatedAt(),
	}
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
		ID:           IDFrom(p.ID()),
		WorkspaceID:  IDFrom(p.Workspace()),
		Name:         p.Name(),
		Description:  p.Description(),
		ImageURL:     p.ImageURL(),
		CreatedAt:    p.CreatedAt(),
		UpdatedAt:    p.UpdatedAt(),
		Visualizer:   Visualizer(p.Visualizer()),
		IsArchived:   p.IsArchived(),
		CoreSupport:  p.CoreSupport(),
		Starred:      p.Starred(),
		IsDeleted:    p.IsDeleted(),
		Visibility:   p.Visibility(),
		Metadata:     ToProjectMetadata(p.Metadata()),
		ProjectAlias: p.ProjectAlias(),
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

	License *string `json:"readme,omitempty"`
	Readme  *string `json:"license,omitempty"`
	Topics  *string `json:"topics,omitempty"`
}

func ToProjectExport(p *project.Project) *ProjectExport {
	if p == nil {
		return nil
	}

	export := &ProjectExport{
		Visualizer:  Visualizer(p.Visualizer()),
		Name:        p.Name(),
		Description: p.Description(),
		ImageURL:    p.ImageURL(),
	}

	if pm := p.Metadata(); pm != nil {
		export.License = pm.License()
		export.Readme = pm.Readme()
		export.Topics = pm.Topics()
	}

	return export
}

func ToProjectExportDataFromJSON(data map[string]any) *ProjectExport {
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
