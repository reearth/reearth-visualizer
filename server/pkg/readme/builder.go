package readme

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
)

type Builder struct {
	r *Readme
}

func New() *Builder {
	return &Builder{r: &Readme{}}
}

func (b *Builder) Build() (*Readme, error) {
	if b.r.id.IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.r.updatedAt.IsZero() {
		b.r.updatedAt = b.r.UpdatedAt()
	}
	if b.r.createdAt.IsZero() {
		b.r.createdAt = b.r.CreatedAt()
	}
	return b.r, nil
}

func (b *Builder) MustBuild() *Readme {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id id.ReadmeID) *Builder {
	b.r.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.r.id = id.NewReadmeID()
	return b
}

func (b *Builder) Project(project id.ProjectID) *Builder {
	b.r.project = project
	return b
}

func (b *Builder) Readme(readme string) *Builder {
	b.r.readme = readme
	return b
}

func (b *Builder) License(license string) *Builder {
	b.r.license = license
	return b
}

func (b *Builder) CreatedAt(createdAt time.Time) *Builder {
	b.r.createdAt = createdAt
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.r.updatedAt = updatedAt
	return b
}
