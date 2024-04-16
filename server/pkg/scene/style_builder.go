package scene

type StyleBuilder struct {
	s *Style
}

func NewStyle() *StyleBuilder {
	return &StyleBuilder{s: &Style{}}
}

func (b *StyleBuilder) Build() (*Style, error) {
	if b.s.IDField.IsNil() {
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
	b.s.IDField = id
	return b
}

func (b *StyleBuilder) NewID() *StyleBuilder {
	b.s.IDField = NewStyleID()
	return b
}

func (b *StyleBuilder) Scene(scene ID) *StyleBuilder {
	b.s.SceneField = scene
	return b
}

func (b *StyleBuilder) Value(sv *StyleValue) *StyleBuilder {
	b.s.ValueField = sv
	return b
}

func (b *StyleBuilder) Name(n string) *StyleBuilder {
	b.s.NameField = n
	return b
}
