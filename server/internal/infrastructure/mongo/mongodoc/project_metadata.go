package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"golang.org/x/exp/slices"
)

type ProjectMetadataDocument struct {
	ID              string
	Workspace       string
	Project         string
	ImportStatus    *string
	ImportResultLog *map[string]any
	Readme          *string
	License         *string
	Topics          *[]string
	CreatedAt       *time.Time
	UpdatedAt       *time.Time
}

type ProjectMetadataConsumer = Consumer[*ProjectMetadataDocument, *project.ProjectMetadata]

func NewProjectMetadataConsumer(workspaces []accountdomain.WorkspaceID) *ProjectMetadataConsumer {
	return NewConsumer[*ProjectMetadataDocument, *project.ProjectMetadata](func(s *project.ProjectMetadata) bool {
		return workspaces == nil || slices.Contains(workspaces, s.Workspace())
	})
}

func NewProjectMetadata(r *project.ProjectMetadata) (*ProjectMetadataDocument, string) {
	rid := r.ID().String()

	var importStatus *string
	if r.ImportStatus() != nil {
		v := string(*r.ImportStatus())
		importStatus = &v
	}

	return &ProjectMetadataDocument{
		ID:              rid,
		Workspace:       r.Workspace().String(),
		Project:         r.Project().String(),
		ImportStatus:    importStatus,
		ImportResultLog: r.ImportResultLog(),
		Readme:          r.Readme(),
		License:         r.License(),
		Topics:          r.Topics(),
		CreatedAt:       r.CreatedAt(),
		UpdatedAt:       r.UpdatedAt(),
	}, rid

}

func (d *ProjectMetadataDocument) Model() (*project.ProjectMetadata, error) {
	rid, err := id.ProjectMetadataIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	wid, err := accountdomain.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	pid, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}

	var importStatus *project.ProjectImportStatus
	if d.ImportStatus != nil {
		v := project.ProjectImportStatus(*d.ImportStatus)
		importStatus = &v
	}

	builder := project.NewProjectMetadata().
		ID(rid).
		Workspace(wid).
		Project(pid).
		ImportStatus(importStatus).
		ImportResultLog(d.ImportResultLog).
		Readme(d.Readme).
		License(d.License).
		UpdatedAt(d.UpdatedAt).
		CreatedAt(d.CreatedAt)

	if d.Topics != nil && len(*d.Topics) > 0 {
		builder = builder.Topics(d.Topics)
	}

	return builder.Build()
}
