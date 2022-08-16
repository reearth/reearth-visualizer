package repo

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestTeamFilter_Merge(t *testing.T) {
	a := user.NewTeamID()
	b := user.NewTeamID()
	assert.Equal(t, TeamFilter{
		Readable: user.TeamIDList{a, b},
		Writable: user.TeamIDList{b, a},
	}, TeamFilter{
		Readable: user.TeamIDList{a},
		Writable: user.TeamIDList{b},
	}.Merge(TeamFilter{
		Readable: user.TeamIDList{b},
		Writable: user.TeamIDList{a},
	}))
	assert.Equal(t, TeamFilter{Readable: user.TeamIDList{}}, TeamFilter{}.Merge(TeamFilter{Readable: user.TeamIDList{}}))
	assert.Equal(t, TeamFilter{Readable: user.TeamIDList{}}, TeamFilter{Readable: user.TeamIDList{}}.Merge(TeamFilter{}))
	assert.Equal(t, TeamFilter{Writable: user.TeamIDList{}}, TeamFilter{}.Merge(TeamFilter{Writable: user.TeamIDList{}}))
	assert.Equal(t, TeamFilter{Writable: user.TeamIDList{}}, TeamFilter{Writable: user.TeamIDList{}}.Merge(TeamFilter{}))
}

func TestSceneFilter_Merge(t *testing.T) {
	a := scene.NewID()
	b := scene.NewID()
	assert.Equal(t, SceneFilter{
		Readable: scene.IDList{a, b},
		Writable: scene.IDList{b, a},
	}, SceneFilter{
		Readable: scene.IDList{a},
		Writable: scene.IDList{b},
	}.Merge(SceneFilter{
		Readable: scene.IDList{b},
		Writable: scene.IDList{a},
	}))
	assert.Equal(t, SceneFilter{Readable: scene.IDList{}}, SceneFilter{}.Merge(SceneFilter{Readable: scene.IDList{}}))
	assert.Equal(t, SceneFilter{Readable: scene.IDList{}}, SceneFilter{Readable: scene.IDList{}}.Merge(SceneFilter{}))
	assert.Equal(t, SceneFilter{Writable: scene.IDList{}}, SceneFilter{}.Merge(SceneFilter{Writable: scene.IDList{}}))
	assert.Equal(t, SceneFilter{Writable: scene.IDList{}}, SceneFilter{Writable: scene.IDList{}}.Merge(SceneFilter{}))
}
