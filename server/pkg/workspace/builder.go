package workspace

import (
	"github.com/samber/lo"
)

type Builder struct {
	a *Workspace
}

func New() *Builder {
	return &Builder{a: &Workspace{}}
}

func (b *Builder) Build() (*Workspace, error) {
	return b.a, nil
}

func (b *Builder) MustBuild() *Workspace {
	return lo.Must(b.Build())
}

func (b *Builder) NewID() *Builder {
	b.a.id = NewID()
	return b
}

func (b *Builder) ID(id ID) *Builder {
	b.a.id = id
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.a.name = name
	return b
}

func (b *Builder) Alias(alias string) *Builder {
	b.a.alias = alias
	return b
}

func (b *Builder) Metadata(metadata Metadata) *Builder {
	b.a.metadata = metadata
	return b
}

func (b *Builder) Personal(personal bool) *Builder {
	b.a.personal = personal
	return b
}
