package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/projectmetadata"
	"golang.org/x/exp/slices"
)

type ProjectMetadataDocument struct {
	ID        string
	Project   string
	Readme    string
	License   string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ProjectMetadataConsumer = Consumer[*ProjectMetadataDocument, *projectmetadata.ProjectMetadata]

func NewProjectMetadataConsumer(projects []id.ProjectID) *ProjectMetadataConsumer {
	return NewConsumer[*ProjectMetadataDocument, *projectmetadata.ProjectMetadata](func(s *projectmetadata.ProjectMetadata) bool {
		return projects == nil || slices.Contains(projects, s.Project())
	})
}

func NewProjectMetadata(r *projectmetadata.ProjectMetadata) (*ProjectMetadataDocument, string) {
	rid := r.ID().String()
	return &ProjectMetadataDocument{
		ID:        rid,
		Project:   r.Project().String(),
		Readme:    r.Readme(),
		License:   r.License(),
		CreatedAt: r.CreatedAt(),
		UpdatedAt: r.UpdatedAt(),
	}, rid
}

func (d *ProjectMetadataDocument) Model() (*projectmetadata.ProjectMetadata, error) {
	rid, err := id.ProjectMetadataIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	// tid, err := accountdomain.WorkspaceIDFrom(d.Team)
	// if err != nil {
	// 	return nil, err
	// }

	// var pid *id.ProjectID
	// if d.Project != nil {
	// 	pidValue, err := id.ProjectIDFrom(*d.Project)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	pid = &pidValue
	// }

	return projectmetadata.New().
		ID(rid).

		// CreatedAt(d.CreatedAt).
		// Workspace(tid).
		// Project(pid).
		// Name(d.Name).
		// Size(d.Size).
		// URL(d.URL).
		// ContentType(d.ContentType).
		// CoreSupport(d.CoreSupport).
		Build()
}
