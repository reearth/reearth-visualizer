package mongodoc

import (
	"net/url"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/project"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

type ProjectDocument struct {
	ID                string
	Archived          bool
	UpdatedAt         time.Time
	PublishedAt       time.Time
	Name              string
	Description       string
	Alias             string
	ImageURL          string
	PublicTitle       string
	PublicDescription string
	PublicImage       string
	PublicNoIndex     bool
	Domains           []*ProjectDomainDocument
	Team              string
	Visualizer        string
	PublishmentStatus string
}

type ProjectDomainDocument struct {
	Domain string
	Ready  bool
}

type ProjectConsumer struct {
	Rows []*project.Project
}

func (c *ProjectConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc ProjectDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	project, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, project)
	return nil
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
		UpdatedAt:         project.UpdatedAt(),
		PublishedAt:       project.PublishedAt(),
		Name:              project.Name(),
		Description:       project.Description(),
		Alias:             project.Alias(),
		ImageURL:          imageURL,
		PublicTitle:       project.PublicTitle(),
		PublicDescription: project.PublicDescription(),
		PublicImage:       project.PublicImage(),
		PublicNoIndex:     project.PublicNoIndex(),
		Team:              project.Team().String(),
		Visualizer:        string(project.Visualizer()),
		PublishmentStatus: string(project.PublishmentStatus()),
	}, pid
}

func (d *ProjectDocument) Model() (*project.Project, error) {
	pid, err := id.ProjectIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := id.TeamIDFrom(d.Team)
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
		UpdatedAt(d.UpdatedAt).
		PublishedAt(d.PublishedAt).
		Name(d.Name).
		Description(d.Description).
		Alias(d.Alias).
		ImageURL(imageURL).
		PublicTitle(d.PublicTitle).
		PublicDescription(d.PublicDescription).
		PublicImage(d.PublicImage).
		PublicNoIndex(d.PublicNoIndex).
		Team(tid).
		Visualizer(visualizer.Visualizer(d.Visualizer)).
		PublishmentStatus(project.PublishmentStatus(d.PublishmentStatus)).
		Build()
}
