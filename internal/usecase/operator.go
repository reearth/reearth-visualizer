package usecase

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/user"
)

type Operator struct {
	User           user.ID
	ReadableTeams  user.TeamIDList
	WritableTeams  user.TeamIDList
	OwningTeams    user.TeamIDList
	ReadableScenes scene.IDList
	WritableScenes scene.IDList
	OwningScenes   scene.IDList
}

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

func (o *Operator) AllReadableTeams() user.TeamIDList {
	return append(o.ReadableTeams, o.AllWritableTeams()...)
}

func (o *Operator) AllWritableTeams() user.TeamIDList {
	return append(o.WritableTeams, o.AllOwningTeams()...)
}

func (o *Operator) AllOwningTeams() user.TeamIDList {
	return o.OwningTeams
}

func (o *Operator) IsReadableTeam(team ...id.TeamID) bool {
	return o.AllReadableTeams().Filter(team...).Len() > 0
}

func (o *Operator) IsWritableTeam(team ...id.TeamID) bool {
	return o.AllWritableTeams().Filter(team...).Len() > 0
}

func (o *Operator) IsOwningTeam(team ...id.TeamID) bool {
	return o.AllOwningTeams().Filter(team...).Len() > 0
}

func (o *Operator) AllReadableScenes() scene.IDList {
	return append(o.ReadableScenes, o.AllWritableScenes()...)
}

func (o *Operator) AllWritableScenes() scene.IDList {
	return append(o.WritableScenes, o.AllOwningScenes()...)
}

func (o *Operator) AllOwningScenes() scene.IDList {
	return o.OwningScenes
}

func (o *Operator) IsReadableScene(scene ...id.SceneID) bool {
	return o.AllReadableScenes().Includes(scene...)
}

func (o *Operator) IsWritableScene(scene ...id.SceneID) bool {
	return o.AllWritableScenes().Includes(scene...)
}

func (o *Operator) IsOwningScene(scene ...id.SceneID) bool {
	return o.AllOwningScenes().Includes(scene...)
}

func (o *Operator) AddNewTeam(team id.TeamID) {
	o.OwningTeams = append(o.OwningTeams, team)
}

func (o *Operator) AddNewScene(team id.TeamID, scene id.SceneID) {
	if o.IsOwningTeam(team) {
		o.OwningScenes = append(o.OwningScenes, scene)
	} else if o.IsWritableTeam(team) {
		o.WritableScenes = append(o.WritableScenes, scene)
	}
}
