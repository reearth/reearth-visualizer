package project

import (
	"net/url"
	"time"

	"github.com/reearth/reearth/server/pkg/visualizer"
)

type Builder struct {
	p *Project
}

func New() *Builder {
	return &Builder{p: &Project{publishmentStatus: PublishmentStatusPrivate}}
}

func (b *Builder) Build() (*Project, error) {
	if b.p.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.p.alias != "" && !CheckAliasPattern(b.p.alias) {
		return nil, ErrInvalidAlias
	}
	if b.p.updatedAt.IsZero() {
		b.p.updatedAt = b.p.CreatedAt()
	}
	return b.p, nil
}

func (b *Builder) MustBuild() *Project {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.p.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.p.id = NewID()
	return b
}

func (b *Builder) IsArchived(isArchived bool) *Builder {
	b.p.isArchived = isArchived
	return b
}

func (b *Builder) IsBasicAuthActive(isBasicAuthActive bool) *Builder {
	b.p.isBasicAuthActive = isBasicAuthActive
	return b
}

func (b *Builder) BasicAuthUsername(basicAuthUsername string) *Builder {
	b.p.basicAuthUsername = basicAuthUsername
	return b
}

func (b *Builder) BasicAuthPassword(basicAuthPassword string) *Builder {
	b.p.basicAuthPassword = basicAuthPassword
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.p.updatedAt = updatedAt
	return b
}

func (b *Builder) PublishedAt(publishedAt time.Time) *Builder {
	b.p.publishedAt = publishedAt
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.p.name = name
	return b
}

func (b *Builder) Description(description string) *Builder {
	b.p.description = description
	return b
}

func (b *Builder) Alias(alias string) *Builder {
	b.p.alias = alias
	return b
}

func (b *Builder) ImageURL(imageURL *url.URL) *Builder {
	if imageURL == nil {
		b.p.imageURL = nil
	} else {
		// https://github.com/golang/go/issues/38351
		imageURL2 := *imageURL
		b.p.imageURL = &imageURL2
	}
	return b
}

func (b *Builder) PublicTitle(publicTitle string) *Builder {
	b.p.publicTitle = publicTitle
	return b
}

func (b *Builder) PublicDescription(publicDescription string) *Builder {
	b.p.publicDescription = publicDescription
	return b
}

func (b *Builder) PublicImage(publicImage string) *Builder {
	b.p.publicImage = publicImage
	return b
}

func (b *Builder) PublicNoIndex(publicNoIndex bool) *Builder {
	b.p.publicNoIndex = publicNoIndex
	return b
}

func (b *Builder) CoreSupport(coreSupport bool) *Builder {
	b.p.coreSupport = coreSupport
	return b
}

func (b *Builder) Workspace(workspace WorkspaceID) *Builder {
	b.p.workspace = workspace
	return b
}

func (b *Builder) Visualizer(visualizer visualizer.Visualizer) *Builder {
	b.p.visualizer = visualizer
	return b
}

func (b *Builder) PublishmentStatus(publishmentStatus PublishmentStatus) *Builder {
	b.p.publishmentStatus = publishmentStatus
	return b
}

func (b *Builder) EnableGA(enableGa bool) *Builder {
	b.p.enableGa = enableGa
	return b
}

func (b *Builder) TrackingID(trackingId string) *Builder {
	b.p.trackingId = trackingId
	return b
}

func (b *Builder) Scene(sceneId SceneID) *Builder {
	b.p.sceneId = sceneId
	return b
}
