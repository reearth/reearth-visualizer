package mongodoc

import (
	"net/url"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/mongox"
)

type ProjectDocument struct {
	ID                string
	Archived          bool   `bson:",omitempty"`
	IsBasicAuthActive bool   `bson:",omitempty"`
	BasicAuthUsername string `bson:",omitempty"`
	BasicAuthPassword string `bson:",omitempty"`
	Name              string
	Description       string
	Alias             string `bson:",omitempty"`
	ImageURL          string `bson:",omitempty"`
	PublicTitle       string `bson:",omitempty"`
	PublicDescription string `bson:",omitempty"`
	PublicImage       string `bson:",omitempty"`
	PublicIocn        string `bson:",omitempty"`
	PublicIcon        string `bson:",omitempty"`
	PublicIconData    []byte `bson:",omitempty"`
	PublicNoIndex     bool   `bson:",omitempty"`
	Workspace         string `bson:"team,omitempty"` // DON'T CHANGE NAME'
	Visualizer        string `bson:",omitempty"`
	PublishmentStatus string `bson:",omitempty"`
	UpdatedAt         time.Time
	PublishedAt       time.Time
}

type ProjectConsumer = mongox.SliceFuncConsumer[*ProjectDocument, *project.Project]

func NewProjectConsumer() *ProjectConsumer {
	return NewComsumer[*ProjectDocument, *project.Project]()
}

func NewProject(project *project.Project) (*ProjectDocument, string) {
	pid := project.ID().String()

	imageURL := ""
	if u := project.ImageURL(); u != nil {
		imageURL = u.String()
	}

	return &ProjectDocument{
		ID:                pid,
		Archived:          project.IsArchived(),
		IsBasicAuthActive: project.IsBasicAuthActive(),
		BasicAuthUsername: project.BasicAuthUsername(),
		BasicAuthPassword: project.BasicAuthPassword(),
		UpdatedAt:         project.UpdatedAt(),
		PublishedAt:       project.PublishedAt(),
		Name:              project.Name(),
		Description:       project.Description(),
		Alias:             project.Alias(),
		ImageURL:          imageURL,
		PublicTitle:       project.PublicTitle(),
		PublicDescription: project.PublicDescription(),
		PublicImage:       project.PublicImage(),
		PublicIcon:        project.PublicIcon(),
		PublicIconData:    project.PublicIconData(),
		PublicNoIndex:     project.PublicNoIndex(),
		Workspace:         project.Workspace().String(),
		Visualizer:        string(project.Visualizer()),
		PublishmentStatus: string(project.PublishmentStatus()),
	}, pid
}

func (d *ProjectDocument) Model() (*project.Project, error) {
	pid, err := id.ProjectIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := id.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	var imageURL *url.URL
	if d.ImageURL != "" {
		if imageURL, err = url.Parse(d.ImageURL); err != nil {
			imageURL = nil
		}
	}

	return project.New().
		ID(pid).
		IsArchived(d.Archived).
		IsBasicAuthActive(d.IsBasicAuthActive).
		BasicAuthUsername(d.BasicAuthUsername).
		BasicAuthPassword(d.BasicAuthPassword).
		UpdatedAt(d.UpdatedAt).
		PublishedAt(d.PublishedAt).
		Name(d.Name).
		Description(d.Description).
		Alias(d.Alias).
		ImageURL(imageURL).
		PublicTitle(d.PublicTitle).
		PublicDescription(d.PublicDescription).
		PublicImage(d.PublicImage).
		PublicIcon(d.PublicIcon).
		PublicIconData(d.PublicIconData).
		PublicNoIndex(d.PublicNoIndex).
		Workspace(tid).
		Visualizer(visualizer.Visualizer(d.Visualizer)).
		PublishmentStatus(project.PublishmentStatus(d.PublishmentStatus)).
		Build()
}
