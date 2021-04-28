package asset

import (
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
)

// Builder _
type Builder struct {
	a *Asset
}

// New _
func New() *Builder {
	return &Builder{a: &Asset{}}
}

// Build _
func (b *Builder) Build() (*Asset, error) {
	if id.ID(b.a.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	if id.ID(b.a.team).IsNil() {
		return nil, ErrEmptyTeamID
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

// MustBuild _
func (b *Builder) MustBuild() *Asset {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

// ID _
func (b *Builder) ID(id id.AssetID) *Builder {
	b.a.id = id
	return b
}

// NewID _
func (b *Builder) NewID() *Builder {
	b.a.id = id.AssetID(id.New())
	return b
}

// Team _
func (b *Builder) Team(team id.TeamID) *Builder {
	b.a.team = team
	return b
}

// Name _
func (b *Builder) Name(name string) *Builder {
	b.a.name = name
	return b
}

// Size _
func (b *Builder) Size(size int64) *Builder {
	b.a.size = size
	return b
}

// URL _
func (b *Builder) URL(url string) *Builder {
	b.a.url = url
	return b
}

// ContentType _
func (b *Builder) ContentType(contentType string) *Builder {
	b.a.contentType = contentType
	return b
}

// CreatedAt -
func (b *Builder) CreatedAt(createdAt time.Time) *Builder {
	b.a.createdAt = createdAt
	return b
}
