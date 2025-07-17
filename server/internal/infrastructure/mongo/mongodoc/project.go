package mongodoc

import (
	"net/url"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"golang.org/x/exp/slices"
)

type ProjectDocument struct {
	ID           string
	Workspace    string
	Name         string
	Description  string
	ImageURL     string
	UpdatedAt    time.Time
	Visualizer   string
	Archived     bool
	CoreSupport  bool
	Starred      bool
	Deleted      bool
	Visibility   string
	ProjectAlias string
	// publishment
	Alias             string
	PublishmentStatus string
	PublishedAt       time.Time
	PublicTitle       string
	PublicDescription string
	PublicImage       string
	PublicNoIndex     bool
	IsBasicAuthActive bool
	BasicAuthUsername string
	BasicAuthPassword string
	EnableGA          bool
	TrackingID        string
}

type ProjectConsumer = Consumer[*ProjectDocument, *project.Project]

func NewProjectConsumer(workspaces []accountdomain.WorkspaceID) *ProjectConsumer {
	return NewConsumer[*ProjectDocument, *project.Project](func(a *project.Project) bool {
		return workspaces == nil || slices.Contains(workspaces, a.Workspace())
	})
}

func NewProject(p *project.Project) (*ProjectDocument, string) {
	pid := p.ID().String()

	imageURL := ""
	if u := p.ImageURL(); u != nil {
		imageURL = u.String()
	}

	return &ProjectDocument{
		ID:           pid,
		Workspace:    p.Workspace().String(),
		Name:         p.Name(),
		Description:  p.Description(),
		ImageURL:     imageURL,
		UpdatedAt:    p.UpdatedAt(),
		Visualizer:   string(p.Visualizer()),
		Archived:     p.IsArchived(),
		CoreSupport:  p.CoreSupport(),
		Starred:      p.Starred(),
		Deleted:      p.IsDeleted(),
		Visibility:   p.Visibility(),
		ProjectAlias: p.ProjectAlias(),
		// publishment
		Alias:             p.Alias(),
		PublishmentStatus: string(p.PublishmentStatus()),
		PublishedAt:       p.PublishedAt(),
		PublicTitle:       p.PublicTitle(),
		PublicDescription: p.PublicDescription(),
		PublicImage:       p.PublicImage(),
		PublicNoIndex:     p.PublicNoIndex(),
		IsBasicAuthActive: p.IsBasicAuthActive(),
		BasicAuthUsername: p.BasicAuthUsername(),
		BasicAuthPassword: p.BasicAuthPassword(),
		EnableGA:          p.EnableGA(),
		TrackingID:        p.TrackingID(),
	}, pid
}

func (d *ProjectDocument) Model() (*project.Project, error) {
	pid, err := id.ProjectIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := accountdomain.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	// scene, err := id.SceneIDFrom(d.Scene)
	// if err != nil {
	// 	return nil, err
	// }

	var imageURL *url.URL
	if d.ImageURL != "" {
		if imageURL, err = url.Parse(d.ImageURL); err != nil {
			imageURL = nil
		}
	}

	return project.New().
		ID(pid).
		Workspace(tid).
		Name(d.Name).
		Description(d.Description).
		ImageURL(imageURL).
		UpdatedAt(d.UpdatedAt).
		Visualizer(visualizer.Visualizer(d.Visualizer)).
		IsArchived(d.Archived).
		CoreSupport(d.CoreSupport).
		Starred(d.Starred).
		Deleted(d.Deleted).
		Visibility(project.Visibility(d.Visibility)).
		ProjectAlias(d.ProjectAlias).
		// publishment
		Alias(d.Alias).
		PublishmentStatus(project.PublishmentStatus(d.PublishmentStatus)).
		PublishedAt(d.PublishedAt).
		PublicTitle(d.PublicTitle).
		PublicDescription(d.PublicDescription).
		PublicImage(d.PublicImage).
		PublicNoIndex(d.PublicNoIndex).
		IsBasicAuthActive(d.IsBasicAuthActive).
		BasicAuthUsername(d.BasicAuthUsername).
		BasicAuthPassword(d.BasicAuthPassword).
		EnableGA(d.EnableGA).
		TrackingID(d.TrackingID).
		Build()
}
