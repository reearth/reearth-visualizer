package project

import (
	"errors"
	"net/url"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
)

type Project struct {
	id           id.ProjectID
	workspace    accountdomain.WorkspaceID
	sceneId      id.SceneID
	name         string
	description  string
	imageURL     *url.URL
	updatedAt    time.Time
	visualizer   visualizer.Visualizer
	isArchived   bool
	coreSupport  bool
	starred      bool
	isDeleted    bool
	visibility   string
	metadata     *ProjectMetadata
	projectAlias string
}

// getter ---------------------

func (p *Project) ID() id.ProjectID {
	return p.id
}

func (p *Project) Workspace() accountdomain.WorkspaceID {
	return p.workspace
}

func (p *Project) Scene() id.SceneID {
	return p.sceneId
}

func (p *Project) Name() string {
	return p.name
}

func (p *Project) Description() string {
	return p.description
}

func (p *Project) ImageURL() *url.URL {
	if p == nil || p.imageURL == nil {
		return nil
	}
	// https://github.com/golang/go/issues/38351
	imageURL2 := *p.imageURL
	return &imageURL2
}

func (p *Project) CreatedAt() time.Time {
	return p.id.Timestamp()
}

func (p *Project) UpdatedAt() time.Time {
	return p.updatedAt
}

func (p *Project) Visualizer() visualizer.Visualizer {
	return p.visualizer
}

func (p *Project) IsArchived() bool {
	return p.isArchived
}

func (p *Project) CoreSupport() bool {
	return p.coreSupport
}

func (p *Project) Starred() bool {
	return p.starred
}

func (p *Project) IsDeleted() bool {
	return p.isDeleted
}

func (p *Project) Visibility() string {
	return p.visibility
}

func (p *Project) Metadata() *ProjectMetadata {
	return p.metadata
}

func (p *Project) ProjectAlias() string {
	return p.projectAlias
}

// setter ---------------------

func (p *Project) UpdateWorkspace(workspace accountdomain.WorkspaceID) {
	p.workspace = workspace
}

func (p *Project) UpdateSceneID(sceneId id.SceneID) {
	p.sceneId = sceneId
}

func (p *Project) UpdateName(name string) {
	p.name = name
}

func (p *Project) UpdateDescription(description string) {
	p.description = description
}

func (p *Project) SetImageURL(imageURL *url.URL) {
	if imageURL == nil {
		p.imageURL = nil
	} else {
		// https://github.com/golang/go/issues/38351
		imageURL2 := *imageURL
		p.imageURL = &imageURL2
	}
}

func (p *Project) SetUpdatedAt(updatedAt time.Time) {
	p.updatedAt = updatedAt
}

func (p *Project) UpdateVisualizer(visualizer visualizer.Visualizer) {
	p.visualizer = visualizer
}

func (p *Project) SetArchived(isArchived bool) {
	p.isArchived = isArchived
}

func (p *Project) SetStarred(starred bool) {
	p.starred = starred
}

func (p *Project) SetDeleted(isDeleted bool) {
	p.isDeleted = isDeleted
}

func (p *Project) UpdateVisibility(visibility string) error {
	if visibility != "public" && visibility != "private" {
		return errors.New("visibility must be either 'public' or 'private'")
	}
	p.visibility = visibility
	return nil
}

func (p *Project) SetMetadata(metadata *ProjectMetadata) {
	p.metadata = metadata
}

func (p *Project) UpdateProjectAlias(projectAlias string) {
	p.projectAlias = projectAlias
}
