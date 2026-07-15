package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
)

type ProjectImportDocument struct {
	Project   string
	Status    *string
	ResultLog *map[string]any
	UpdatedAt *time.Time
}

func NewProjectImport(pid id.ProjectID, status *project.ProjectImportStatus, resultLog *map[string]any, updatedAt *time.Time) *ProjectImportDocument {
	var s *string
	if status != nil {
		v := string(*status)
		s = &v
	}
	return &ProjectImportDocument{
		Project:   pid.String(),
		Status:    s,
		ResultLog: resultLog,
		UpdatedAt: updatedAt,
	}
}

func (d *ProjectImportDocument) Model() (*project.ProjectImportStatus, *map[string]any) {
	if d == nil {
		return nil, nil
	}
	var status *project.ProjectImportStatus
	if d.Status != nil {
		v := project.ProjectImportStatus(*d.Status)
		status = &v
	}
	return status, d.ResultLog
}
