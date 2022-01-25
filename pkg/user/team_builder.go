package user

type TeamBuilder struct {
	t        *Team
	members  map[ID]Role
	personal bool
}

func NewTeam() *TeamBuilder {
	return &TeamBuilder{t: &Team{}}
}

func (b *TeamBuilder) Build() (*Team, error) {
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

func (b *TeamBuilder) MustBuild() *Team {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *TeamBuilder) ID(id TeamID) *TeamBuilder {
	b.t.id = id
	return b
}

func (b *TeamBuilder) NewID() *TeamBuilder {
	b.t.id = NewTeamID()
	return b
}

func (b *TeamBuilder) Name(name string) *TeamBuilder {
	b.t.name = name
	return b
}

func (b *TeamBuilder) Members(members map[ID]Role) *TeamBuilder {
	b.members = members
	return b
}

func (b *TeamBuilder) Personal(p bool) *TeamBuilder {
	b.personal = p
	return b
}
