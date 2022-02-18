package scene

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestScene_IsTeamIncluded(t *testing.T) {
	tid := NewTeamID()

	tests := []struct {
		Name     string
		Teams    []TeamID
		S        *Scene
		Expected bool
	}{
		{
			Name:     "nil scene",
			Teams:    []TeamID{NewTeamID()},
			S:        nil,
			Expected: false,
		},
		{
			Name:     "nil teams",
			Teams:    nil,
			S:        New().NewID().Team(NewTeamID()).RootLayer(NewLayerID()).MustBuild(),
			Expected: false,
		},
		{
			Name:     "teams exist",
			Teams:    []TeamID{tid},
			S:        New().NewID().Team(tid).RootLayer(NewLayerID()).MustBuild(),
			Expected: true,
		},
		{
			Name:     "teams not exist",
			Teams:    []TeamID{tid},
			S:        New().NewID().Team(NewTeamID()).RootLayer(NewLayerID()).MustBuild(),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.S.IsTeamIncluded(tc.Teams)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestScene_SetUpdatedAt(t *testing.T) {
	s := New().NewID().Team(NewTeamID()).RootLayer(NewLayerID()).UpdatedAt(time.Date(1999, 1, 1, 00, 00, 1, 1, time.UTC)).MustBuild()
	s.SetUpdatedAt(time.Date(2021, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.Equal(t, time.Date(2021, 1, 1, 00, 00, 1, 1, time.UTC), s.UpdatedAt())
	s = nil
	s.SetUpdatedAt(time.Date(2020, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.NotEqual(t, time.Date(2020, 1, 1, 00, 00, 1, 1, time.UTC), s.UpdatedAt())
}

func TestScene_Properties(t *testing.T) {
	pid1 := NewPropertyID()
	pid2 := NewPropertyID()
	s := New().
		NewID().
		Team(NewTeamID()).
		RootLayer(NewLayerID()).
		Property(pid1).
		Widgets(
			NewWidgets([]*Widget{
				MustWidget(NewWidgetID(), MustPluginID("xxx~1.1.1"), "eee", pid2, true, false),
			}, nil),
		).
		MustBuild()

	assert.Equal(t, []PropertyID{pid1, pid2}, s.Properties())
}

func TestSceneNil(t *testing.T) {
	var s *Scene
	assert.Nil(t, s.Properties())
	assert.True(t, s.ID().IsNil())
	assert.Nil(t, s.Widgets())
	assert.True(t, s.Project().IsNil())
	assert.True(t, s.Team().IsNil())
	assert.True(t, s.RootLayer().IsNil())
	assert.True(t, s.CreatedAt().IsZero())
	assert.Nil(t, s.Plugins())
	assert.True(t, s.Property().IsNil())
}

func TestScene_Clusters(t *testing.T) {
	c1, _ := NewCluster(NewClusterID(), "xxx", NewPropertyID())

	tests := []struct {
		name  string
		scene *Scene
		want  *ClusterList
	}{
		{
			name: "should return a cluster list",
			scene: &Scene{
				clusters: NewClusterListFrom([]*Cluster{c1}),
			},
			want: NewClusterListFrom([]*Cluster{c1}),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.scene.Clusters())
		})
	}
}
