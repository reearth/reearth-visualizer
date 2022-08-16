package workspace

type Workspace struct {
	id      ID
	name    string
	members *Members
}

func (t *Workspace) ID() ID {
	return t.id
}

func (t *Workspace) Name() string {
	return t.name
}

func (t *Workspace) Members() *Members {
	return t.members
}

func (t *Workspace) IsPersonal() bool {
	return t.members.Fixed()
}

func (t *Workspace) Rename(name string) {
	t.name = name
}
