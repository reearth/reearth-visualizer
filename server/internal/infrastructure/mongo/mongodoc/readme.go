package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/readme"
	"golang.org/x/exp/slices"
)

type ReadmeDocument struct {
	ID        string
	Project   string
	Readme    string
	License   string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ReadmeConsumer = Consumer[*ReadmeDocument, *readme.Readme]

func NewReadmeConsumer(projects []id.ProjectID) *ReadmeConsumer {
	return NewConsumer[*ReadmeDocument, *readme.Readme](func(s *readme.Readme) bool {
		return projects == nil || slices.Contains(projects, s.Project())
	})
}

func NewReadme(r *readme.Readme) (*ReadmeDocument, string) {
	rid := r.ID().String()
	return &ReadmeDocument{
		ID:        rid,
		Project:   r.Project().String(),
		Readme:    r.Readme(),
		License:   r.License(),
		CreatedAt: r.CreatedAt(),
		UpdatedAt: r.UpdatedAt(),
	}, rid
}

func (d *ReadmeDocument) Model() (*readme.Readme, error) {
	rid, err := id.ReadmeIDFrom(d.ID)
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

	return readme.New().
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
