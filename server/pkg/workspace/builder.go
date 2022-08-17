package workspace

type Builder struct {
	t        *Workspace
	members  map[UserID]Role
	personal bool
}

func New() *Builder {
	return &Builder{t: &Workspace{}}
}

func (b *Builder) Build() (*Workspace, error) {
	if b.t.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.members == nil {
		b.t.members = NewMembers()
	} else {
		b.t.members = NewMembersWith(b.members)
	}
	b.t.members.fixed = b.personal
	return b.t, nil
}

func (b *Builder) MustBuild() *Workspace {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.t.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.t.id = NewID()
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.t.name = name
	return b
}

func (b *Builder) Members(members map[UserID]Role) *Builder {
	b.members = members
	return b
}

func (b *Builder) Personal(p bool) *Builder {
	b.personal = p
	return b
}
