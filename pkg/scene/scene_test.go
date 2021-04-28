package scene

import (
	"testing"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestScene_IsTeamIncluded(t *testing.T) {
	tid := id.NewTeamID()
	testCases := []struct {
		Name     string
		Teams    []id.TeamID
		S        *Scene
		Expected bool
	}{
		{
			Name:     "nil scene",
			Teams:    []id.TeamID{id.NewTeamID()},
			S:        nil,
			Expected: false,
		},
		{
			Name:     "nil teams",
			Teams:    nil,
			S:        New().NewID().Team(id.NewTeamID()).RootLayer(id.NewLayerID()).MustBuild(),
			Expected: false,
		},
		{
			Name:     "teams exist",
			Teams:    []id.TeamID{tid},
			S:        New().NewID().Team(tid).RootLayer(id.NewLayerID()).MustBuild(),
			Expected: true,
		},
		{
			Name:     "teams not exist",
			Teams:    []id.TeamID{tid},
			S:        New().NewID().Team(id.NewTeamID()).RootLayer(id.NewLayerID()).MustBuild(),
			Expected: false,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.S.IsTeamIncluded(tc.Teams)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestScene_SetUpdatedAt(t *testing.T) {
	s := New().NewID().Team(id.NewTeamID()).RootLayer(id.NewLayerID()).UpdatedAt(time.Date(1999, 1, 1, 00, 00, 1, 1, time.UTC)).MustBuild()
	s.SetUpdatedAt(time.Date(2021, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.Equal(t, time.Date(2021, 1, 1, 00, 00, 1, 1, time.UTC), s.UpdatedAt())
	s = nil
	s.SetUpdatedAt(time.Date(2020, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.NotEqual(t, time.Date(2020, 1, 1, 00, 00, 1, 1, time.UTC), s.UpdatedAt())
}

func TestScene_Properties(t *testing.T) {
	pid1 := id.NewPropertyID()
	pid2 := id.NewPropertyID()
	s := New().NewID().Team(id.NewTeamID()).RootLayer(id.NewLayerID()).Property(pid1).WidgetSystem(
		NewWidgetSystem([]*Widget{
			MustNewWidget(id.NewWidgetID().Ref(), id.MustPluginID("xxx#1.1.1"), "eee", pid2, true),
		})).MustBuild()

	assert.Equal(t, []id.PropertyID{pid1, pid2}, s.Properties())

}

func TestSceneNil(t *testing.T) {
	var s *Scene
	assert.Nil(t, s.Properties())
	assert.True(t, s.ID().IsNil())
	assert.Nil(t, s.WidgetSystem())
	assert.True(t, s.Project().IsNil())
	assert.True(t, s.Team().IsNil())
	assert.True(t, s.RootLayer().IsNil())
	assert.True(t, s.CreatedAt().IsZero())
	assert.Nil(t, s.PluginSystem())
	assert.True(t, s.Property().IsNil())
}
