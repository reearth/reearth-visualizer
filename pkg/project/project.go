package project

import (
	"errors"
	"net/url"
	"regexp"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

var (
	ErrInvalidAlias error = errors.New("invalid alias")
	aliasRegexp           = regexp.MustCompile("^[a-zA-Z0-9_-]{5,32}$")
)

// Project _
type Project struct {
	id                id.ProjectID
	isArchived        bool
	updatedAt         time.Time
	publishedAt       time.Time
	name              string
	description       string
	alias             string
	imageURL          *url.URL
	publicTitle       string
	publicDescription string
	publicImage       string
	publicNoIndex     bool
	team              id.TeamID
	visualizer        visualizer.Visualizer
	publishmentStatus PublishmentStatus
}

func (p *Project) ID() id.ProjectID {
	return p.id
}

func (p *Project) IsArchived() bool {
	return p.isArchived
}

func (p *Project) UpdatedAt() time.Time {
	return p.updatedAt
}

func (p *Project) PublishedAt() time.Time {
	return p.publishedAt
}

func (p *Project) Name() string {
	return p.name
}

func (p *Project) Description() string {
	return p.description
}

func (p *Project) Alias() string {
	return p.alias
}

func (p *Project) ImageURL() *url.URL {
	if p == nil || p.imageURL == nil {
		return nil
	}
	imageURL2 := *p.imageURL
	return &imageURL2
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

func (p *Project) PublishmentStatus() PublishmentStatus {
	return p.publishmentStatus
}

func (p *Project) Team() id.TeamID {
	return p.team
}

func (p *Project) CreatedAt() time.Time {
	return id.ID(p.id).Timestamp()
}

func (p *Project) Visualizer() visualizer.Visualizer {
	return p.visualizer
}

func (p *Project) SetArchived(isArchived bool) {
	p.isArchived = isArchived
}

func (p *Project) SetUpdatedAt(updatedAt time.Time) {
	p.updatedAt = updatedAt
}

func (p *Project) SetPublishedAt(publishedAt time.Time) {
	p.publishedAt = publishedAt
}

func (p *Project) SetImageURL(imageURL *url.URL) {
	if imageURL == nil {
		p.imageURL = nil
	} else {
		imageURL2 := *imageURL
		p.imageURL = &imageURL2
	}
}

func (p *Project) UpdateName(name string) {
	p.name = name
}

func (p *Project) UpdateDescription(description string) {
	p.description = description
}

func (p *Project) UpdateAlias(alias string) error {
	if CheckAliasPattern(alias) {
		p.alias = alias
	} else {
		return ErrInvalidAlias
	}
	return nil
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

func (p *Project) UpdateTeam(team id.TeamID) {
	p.team = team
}

func (p *Project) UpdateVisualizer(visualizer visualizer.Visualizer) {
	p.visualizer = visualizer
}

func (p *Project) UpdatePublishmentStatus(publishmentStatus PublishmentStatus) {
	p.publishmentStatus = publishmentStatus
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

func CheckAliasPattern(alias string) bool {
	return alias != "" && aliasRegexp.Match([]byte(alias))
}
