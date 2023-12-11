package scene

type StyleBuilder struct {
	s *Style
}

func NewStyle() *StyleBuilder {
	return &StyleBuilder{s: &Style{}}
}

func (b *StyleBuilder) Build() (*Style, error) {
	if b.s.id.IsNil() {
		return nil, ErrInvalidID
	}
	return b.s, nil
}

func (b *StyleBuilder) MustBuild() *Style {
	s, err := b.Build()
	if err != nil {
		panic(err)
	}
	return s
}

func (b *StyleBuilder) ID(id StyleID) *StyleBuilder {
	b.s.id = id
	return b
}

func (b *StyleBuilder) NewID() *StyleBuilder {
	b.s.id = NewStyleID()
	return b
}

func (b *StyleBuilder) Scene(scene ID) *StyleBuilder {
	b.s.scene = scene
	return b
}

func (b *StyleBuilder) Value(sv *StyleValue) *StyleBuilder {
	b.s.value = sv
	return b
}

func (b *StyleBuilder) Name(n string) *StyleBuilder {
	b.s.name = n
	return b
}
