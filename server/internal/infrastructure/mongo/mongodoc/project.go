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
	ID          string
	Archived    bool
	UpdatedAt   time.Time
	Name        string
	Description string
	Readme      string
	License     string
	ImageURL    string
	Team        string // DON'T CHANGE NAME'
	Visualizer  string
	CoreSupport bool
	Starred     bool
	Deleted     bool
	Visibility  string

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

func NewProject(project *project.Project) (*ProjectDocument, string) {
	pid := project.ID().String()

	imageURL := ""
	if u := project.ImageURL(); u != nil {
		imageURL = u.String()
	}

	return &ProjectDocument{
		ID:          pid,
		Archived:    project.IsArchived(),
		UpdatedAt:   project.UpdatedAt(),
		Name:        project.Name(),
		Description: project.Description(),
		Readme:      project.Readme(),
		License:     project.License(),
		ImageURL:    imageURL,
		Team:        project.Workspace().String(),
		Visualizer:  string(project.Visualizer()),
		Starred:     project.Starred(),
		Deleted:     project.IsDeleted(),
		Visibility:  project.Visibility(),
		CoreSupport: project.CoreSupport(),

		// publishment
		Alias:             project.Alias(),
		PublishmentStatus: string(project.PublishmentStatus()),
		PublishedAt:       project.PublishedAt(),
		PublicTitle:       project.PublicTitle(),
		PublicDescription: project.PublicDescription(),
		PublicImage:       project.PublicImage(),
		PublicNoIndex:     project.PublicNoIndex(),
		IsBasicAuthActive: project.IsBasicAuthActive(),
		BasicAuthUsername: project.BasicAuthUsername(),
		BasicAuthPassword: project.BasicAuthPassword(),
		EnableGA:          project.EnableGA(),
		TrackingID:        project.TrackingID(),
	}, pid
}

func (d *ProjectDocument) Model() (*project.Project, error) {
	pid, err := id.ProjectIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := accountdomain.WorkspaceIDFrom(d.Team)
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
		IsArchived(d.Archived).
		UpdatedAt(d.UpdatedAt).
		Name(d.Name).
		Description(d.Description).
		Readme(d.Readme).
		License(d.License).
		ImageURL(imageURL).
		Workspace(tid).
		Visualizer(visualizer.Visualizer(d.Visualizer)).
		Starred(d.Starred).
		Deleted(d.Deleted).
		Visibility(d.Visibility).
		CoreSupport(d.CoreSupport).
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
