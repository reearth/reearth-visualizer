package asset

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type Builder struct {
	a *Asset
}

func New() *Builder {
	return &Builder{a: &Asset{}}
}

func (b *Builder) Build() (*Asset, error) {
	if b.a.id.IsNil() {
		return nil, errors.New("invalid ID asset.ID ")
	}
	if b.a.workspace.IsNil() {
		return nil, ErrEmptyWorkspaceID
	}
	if b.a.url == "" {
		return nil, ErrEmptyURL
	}
	if b.a.size <= 0 {
		return nil, ErrEmptySize
	}
	if b.a.createdAt.IsZero() {
		b.a.createdAt = b.a.CreatedAt()
	}
	return b.a, nil
}

func (b *Builder) MustBuild() *Asset {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id id.AssetID) *Builder {
	b.a.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.a.id = id.NewAssetID()
	return b
}

func (b *Builder) Workspace(workspace accountdomain.WorkspaceID) *Builder {
	b.a.workspace = workspace
	return b
}

func (b *Builder) Project(project *id.ProjectID) *Builder {
	b.a.project = project
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.a.name = name
	return b
}

func (b *Builder) Size(size int64) *Builder {
	b.a.size = size
	return b
}

func (b *Builder) URL(url string) *Builder {
	b.a.url = url
	return b
}

func (b *Builder) CoreSupport(coreSupport bool) *Builder {
	b.a.coreSupport = coreSupport
	return b
}

func (b *Builder) ContentType(contentType string) *Builder {
	b.a.contentType = contentType
	return b
}

func (b *Builder) CreatedAt(createdAt time.Time) *Builder {
	b.a.createdAt = createdAt
	return b
}
