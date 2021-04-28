package usecase

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
)

// Operator _
type Operator struct {
	User          id.UserID
	ReadableTeams []id.TeamID
	WritableTeams []id.TeamID
	OwningTeams   []id.TeamID
}

// OperatorFrom _
func OperatorFrom(u id.UserID, teams []*user.Team) *Operator {
	rt := []id.TeamID{}
	wt := []id.TeamID{}
	ot := []id.TeamID{}
	for _, t := range teams {
		r := t.Members().GetRole(u)
		if r == user.Role("") {
			continue
		}
		tid := t.ID()
		rt = append(rt, tid)
		if r == user.RoleWriter {
			wt = append(wt, tid)
		} else if r == user.RoleOwner {
			wt = append(wt, tid)
			ot = append(ot, tid)
		}
	}

	return &Operator{
		User:          u,
		ReadableTeams: rt,
		WritableTeams: wt,
		OwningTeams:   ot,
	}
}

// Teams _
func (o *Operator) Teams(r user.Role) []id.TeamID {
	if o == nil {
		return nil
	}
	if r == user.RoleReader {
		return o.ReadableTeams
	}
	if r == user.RoleWriter {
		return o.WritableTeams
	}
	if r == user.RoleOwner {
		return o.OwningTeams
	}
	return nil
}

// IsReadableTeamIncluded _
func (o *Operator) IsReadableTeamIncluded(team id.TeamID) bool {
	if o == nil {
		return false
	}
	for _, t := range o.ReadableTeams {
		if t == team {
			return true
		}
	}
	return false
}

// IsWritableTeamIncluded _
func (o *Operator) IsWritableTeamIncluded(team id.TeamID) bool {
	if o == nil {
		return false
	}
	for _, t := range o.WritableTeams {
		if t == team {
			return true
		}
	}
	return false
}

// IsOwningTeamIncluded _
func (o *Operator) IsOwningTeamIncluded(team id.TeamID) bool {
	if o == nil {
		return false
	}
	for _, t := range o.OwningTeams {
		if t == team {
			return true
		}
	}
	return false
}

// IsReadableTeamsIncluded _
func (o *Operator) IsReadableTeamsIncluded(teams []id.TeamID) bool {
	if o == nil {
		return false
	}
	for _, t := range teams {
		for _, t2 := range o.ReadableTeams {
			if t == t2 {
				return true
			}
		}
	}
	return false
}

// IsWritableTeamsIncluded _
func (o *Operator) IsWritableTeamsIncluded(teams []id.TeamID) bool {
	if o == nil {
		return false
	}
	for _, t := range teams {
		for _, t2 := range o.WritableTeams {
			if t == t2 {
				return true
			}
		}
	}
	return false
}

// IsOwningTeamsIncluded _
func (o *Operator) IsOwningTeamsIncluded(teams []id.TeamID) bool {
	if o == nil {
		return false
	}
	for _, t := range teams {
		for _, t2 := range o.OwningTeams {
			if t == t2 {
				return true
			}
		}
	}
	return false
}
