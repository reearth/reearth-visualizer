package workspace

import "github.com/reearth/reearthx/util"

type Workspace struct {
	id      ID
	name    string
	members *Members
	policy  *PolicyID
}

func (w *Workspace) ID() ID {
	return w.id
}

func (w *Workspace) Name() string {
	return w.name
}

func (w *Workspace) Members() *Members {
	return w.members
}

func (w *Workspace) IsPersonal() bool {
	return w.members.Fixed()
}

func (w *Workspace) Policy() *PolicyID {
	return util.CloneRef(w.policy)
}

func (w *Workspace) Rename(name string) {
	w.name = name
}

func (w *Workspace) SetPolicy(policy *PolicyID) {
	w.policy = util.CloneRef(policy)
}
