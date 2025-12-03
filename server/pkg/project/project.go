package project

import (
	"errors"
	"net/url"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type Project struct {
	id           id.ProjectID
	workspace    accountsID.WorkspaceID
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

	// publishment
	alias             string
	publishmentStatus PublishmentStatus
	publishedAt       time.Time
	publicTitle       string
	publicDescription string
	publicImage       string
	publicNoIndex     bool
	isBasicAuthActive bool
	basicAuthUsername string
	basicAuthPassword string
	enableGa          bool
	trackingId        string
}

// getter ---------------------

func (p *Project) ID() id.ProjectID {
	return p.id
}

func (p *Project) Workspace() accountsID.WorkspaceID {
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

func (p *Project) UpdateWorkspace(workspace accountsID.WorkspaceID) {
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

func (p *Project) PublicName() string {
	if p == nil || p.publishmentStatus == PublishmentStatusPrivate {
		return ""
	}
	return p.alias
}

func (p *Project) MatchWithPublicName(name string) bool {
	if p == nil || name == "" || p.publishmentStatus == PublishmentStatusPrivate {
		return false
	}
	if p.publishmentStatus != PublishmentStatusPrivate && p.alias == name {
		return true
	}
	return false
}

func (p *Project) UpdateProjectAlias(projectAlias string) {
	p.projectAlias = projectAlias
}

// publishment ---------------------

func (p *Project) Alias() string {
	return p.alias
}

func (p *Project) PublishmentStatus() PublishmentStatus {
	return p.publishmentStatus
}

func (p *Project) PublishedAt() time.Time {
	return p.publishedAt
}

func (p *Project) PublicTitle() string {
	return p.publicTitle
}

func (p *Project) PublicDescription() string {
	return p.publicDescription
}

func (p *Project) PublicImage() string {
	return p.publicImage
}

func (p *Project) PublicNoIndex() bool {
	return p.publicNoIndex
}

func (p *Project) IsBasicAuthActive() bool {
	return p.isBasicAuthActive
}

func (p *Project) BasicAuthUsername() string {
	return p.basicAuthUsername
}

func (p *Project) BasicAuthPassword() string {
	return p.basicAuthPassword
}

func (p *Project) EnableGA() bool {
	return p.enableGa
}

func (p *Project) TrackingID() string {
	return p.trackingId
}

func (p *Project) UpdateAlias(alias string) {
	p.alias = alias
}

func (p *Project) UpdatePublishmentStatus(publishmentStatus PublishmentStatus) {
	p.publishmentStatus = publishmentStatus
}

func (p *Project) SetPublishedAt(publishedAt time.Time) {
	p.publishedAt = publishedAt
}

func (p *Project) UpdatePublicTitle(publicTitle string) {
	p.publicTitle = publicTitle
}

func (p *Project) UpdatePublicDescription(publicDescription string) {
	p.publicDescription = publicDescription
}

func (p *Project) UpdatePublicImage(publicImage string) {
	p.publicImage = publicImage
}

func (p *Project) UpdatePublicNoIndex(publicNoIndex bool) {
	p.publicNoIndex = publicNoIndex
}

func (p *Project) SetIsBasicAuthActive(isBasicAuthActive bool) {
	p.isBasicAuthActive = isBasicAuthActive
}

func (p *Project) SetBasicAuthUsername(basicAuthUsername string) {
	p.basicAuthUsername = basicAuthUsername
}

func (p *Project) SetBasicAuthPassword(basicAuthPassword string) {
	p.basicAuthPassword = basicAuthPassword
}

func (p *Project) UpdateEnableGA(enableGa bool) {
	p.enableGa = enableGa
}

func (p *Project) UpdateTrackingID(trackingId string) {
	p.trackingId = trackingId
}
