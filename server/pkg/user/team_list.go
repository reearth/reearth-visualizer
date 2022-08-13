package user

type TeamList []*Team

func (l TeamList) FilterByID(ids ...TeamID) TeamList {
	if l == nil {
		return nil
	}

	res := make(TeamList, 0, len(l))
	for _, id := range ids {
		var t2 *Team
		for _, t := range l {
			if t.ID() == id {
				t2 = t
				break
			}
		}
		if t2 != nil {
			res = append(res, t2)
		}
	}
	return res
}
func (l TeamList) FilterByUserRole(u ID, r Role) TeamList {
	if l == nil || u.IsNil() || r == "" {
		return nil
	}

	res := make(TeamList, 0, len(l))
	for _, t := range l {
		tr := t.Members().GetRole(u)
		if tr == r {
			res = append(res, t)
		}
	}
	return res
}

func (l TeamList) FilterByUserRoleIncluding(u ID, r Role) TeamList {
	if l == nil || u.IsNil() || r == "" {
		return nil
	}

	res := make(TeamList, 0, len(l))
	for _, t := range l {
		tr := t.Members().GetRole(u)
		if tr.Includes(r) {
			res = append(res, t)
		}
	}
	return res
}

func (l TeamList) IDs() []TeamID {
	if l == nil {
		return nil
	}

	res := make([]TeamID, 0, len(l))
	for _, t := range l {
		res = append(res, t.ID())
	}
	return res
}
