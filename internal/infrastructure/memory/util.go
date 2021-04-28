package memory

import "github.com/reearth/reearth-backend/pkg/id"

func isTeamIncludes(id id.TeamID, ids []id.TeamID) bool {
	if ids == nil {
		return true
	}
	for _, i := range ids {
		if id == i {
			return true
		}
	}
	return false
}

func isSceneIncludes(id id.SceneID, ids []id.SceneID) bool {
	if ids == nil {
		return true
	}
	for _, i := range ids {
		if id == i {
			return true
		}
	}
	return false
}
