package property

import (
	"errors"

	"github.com/reearth/reearth-backend/pkg/id"
)

var (
	// ErrInvalidItem _
	ErrInvalidItem = errors.New("invalid item")
)

// Builder _
type Builder struct {
	p *Property
}

// New _
func New() *Builder {
	return &Builder{p: &Property{}}
}

// Build _
func (b *Builder) Build() (*Property, error) {
	if id.ID(b.p.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	if id.ID(b.p.scene).IsNil() {
		return nil, ErrInvalidSceneID
	}
	if b.p.schema.IsNil() {
		return nil, ErrInvalidPropertySchemaID
	}
	for _, i := range b.p.items {
		if !i.Schema().Equal(b.p.schema) {
			return nil, ErrInvalidItem
		}
	}
	return b.p, nil
}

// MustBuild _
func (b *Builder) MustBuild() *Property {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

// ID _
func (b *Builder) ID(id id.PropertyID) *Builder {
	b.p.id = id
	return b
}

// NewID _
func (b *Builder) NewID() *Builder {
	b.p.id = id.PropertyID(id.New())
	return b
}

// Scene _
func (b *Builder) Scene(s id.SceneID) *Builder {
	b.p.scene = s
	return b
}

// Schema _
func (b *Builder) Schema(schema id.PropertySchemaID) *Builder {
	b.p.schema = schema
	return b
}

// Items _
func (b *Builder) Items(items []Item) *Builder {
	if len(items) == 0 {
		b.p.items = nil
		return b
	}

	newItems := []Item{}
	ids := map[id.PropertyItemID]struct{}{}
	for _, f := range items {
		if f == nil {
			continue
		}
		if _, ok := ids[f.ID()]; ok {
			continue
		}
		ids[f.ID()] = struct{}{}
		newItems = append(newItems, f)
	}
	b.p.items = newItems
	return b
}
