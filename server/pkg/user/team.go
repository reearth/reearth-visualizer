package user

type Team struct {
	id      TeamID
	name    string
	members *Members
}

func (t *Team) ID() TeamID {
	return t.id
}

func (t *Team) Name() string {
	return t.name
}

func (t *Team) Members() *Members {
	return t.members
}

func (t *Team) IsPersonal() bool {
	return t.members.Fixed()
}

func (t *Team) Rename(name string) {
	t.name = name
}
