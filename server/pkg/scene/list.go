package scene

import (
	"github.com/reearth/reearth/server/pkg/id"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type List []*Scene

func (l List) IDs() []id.SceneID {
	if l == nil {
		return nil
	}

	res := make([]id.SceneID, 0, len(l))
	for _, s := range l {
		res = append(res, s.ID())
	}
	return res
}

func (l List) FilterByID(ids ...id.SceneID) List {
	if l == nil {
		return nil
	}

	res := make(List, 0, len(l))
	for _, s := range l {
		sid2 := s.ID()
		for _, sid := range ids {
			if sid == sid2 {
				res = append(res, s)
				break
			}
		}
	}
	return res
}

func (l List) FilterByWorkspace(workspaces ...accountsID.WorkspaceID) List {
	if l == nil {
		return nil
	}

	res := make(List, 0, len(l))
	for _, s := range l {
		st := s.Workspace()
		for _, t := range workspaces {
			if t == st {
				res = append(res, s)
				break
			}
		}
	}
	return res
}
