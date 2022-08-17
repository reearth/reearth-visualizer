package scene

type List []*Scene

func (l List) IDs() []ID {
	if l == nil {
		return nil
	}

	res := make([]ID, 0, len(l))
	for _, s := range l {
		res = append(res, s.ID())
	}
	return res
}

func (l List) FilterByID(ids ...ID) List {
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

func (l List) FilterByWorkspace(workspaces ...WorkspaceID) List {
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
