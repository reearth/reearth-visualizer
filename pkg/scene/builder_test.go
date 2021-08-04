package scene

import (
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_IDs(t *testing.T) {
	tid := id.NewTeamID()
	lid := id.NewLayerID()
	b := New().NewID().RootLayer(lid).Team(tid).MustBuild()
	assert.NotNil(t, b.ID())
	assert.Equal(t, tid, b.Team())
	assert.Equal(t, lid, b.RootLayer())
	sid := id.NewSceneID()
	b2 := New().ID(sid).RootLayer(lid).Team(tid).MustBuild()
	assert.Equal(t, sid, b2.ID())
}

func TestBuilder_UpdatedAt(t *testing.T) {
	ti := time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC)
	b := New().NewID().RootLayer(id.NewLayerID()).Team(id.NewTeamID()).UpdatedAt(ti).MustBuild()
	assert.Equal(t, ti, b.UpdatedAt())
}

func TestBuilder_Property(t *testing.T) {
	pid := id.NewPropertyID()
	b := New().NewID().RootLayer(id.NewLayerID()).Team(id.NewTeamID()).Property(pid).MustBuild()
	assert.Equal(t, pid, b.Property())
}

func TestBuilder_PluginSystem(t *testing.T) {
	ps := NewPluginSystem([]*Plugin{
		NewPlugin(id.OfficialPluginID, id.NewPropertyID().Ref()),
	})
	b := New().NewID().RootLayer(id.NewLayerID()).Team(id.NewTeamID()).PluginSystem(ps).MustBuild()
	assert.Equal(t, ps, b.PluginSystem())
}

func TestBuilder_Project(t *testing.T) {
	pid := id.NewProjectID()
	b := New().NewID().RootLayer(id.NewLayerID()).Team(id.NewTeamID()).Project(pid).MustBuild()
	assert.Equal(t, pid, b.Project())
}

func TestBuilder_WidgetSystem(t *testing.T) {
	nid := id.New()
	ws := NewWidgetSystem([]*Widget{
		MustNewWidget(id.WidgetID(nid), id.OfficialPluginID, "xxx", id.NewPropertyID(), true),
	})
	b := New().NewID().RootLayer(id.NewLayerID()).Team(id.NewTeamID()).WidgetSystem(ws).MustBuild()
	assert.Equal(t, ws, b.WidgetSystem())
}

func TestBuilder_Build(t *testing.T) {
	tid := id.NewTeamID()
	sid := id.NewSceneID()
	pid := id.NewProjectID()
	ppid := id.NewPropertyID()
	lid := id.NewLayerID()
	nid := id.New()
	ws := NewWidgetSystem([]*Widget{
		MustNewWidget(id.WidgetID(nid), id.OfficialPluginID, "xxx", ppid, true),
	})
	ps := NewPluginSystem([]*Plugin{
		NewPlugin(id.OfficialPluginID, ppid.Ref()),
	})
	testCases := []struct {
		Name         string
		Id           id.SceneID
		Project      id.ProjectID
		Team         id.TeamID
		RootLayer    id.LayerID
		WidgetSystem *WidgetSystem
		PluginSystem *PluginSystem
		UpdatedAt    time.Time
		Property     id.PropertyID
		Expected     struct {
			Id           id.SceneID
			Project      id.ProjectID
			Team         id.TeamID
			RootLayer    id.LayerID
			WidgetSystem *WidgetSystem
			PluginSystem *PluginSystem
			UpdatedAt    time.Time
			Property     id.PropertyID
		}
		err error
	}{
		{
			Name:         "fail nil scene id",
			Id:           id.SceneID{},
			Project:      pid,
			Team:         tid,
			RootLayer:    lid,
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			err:          id.ErrInvalidID,
		},
		{
			Name:         "fail nil team id",
			Id:           sid,
			Project:      pid,
			Team:         id.TeamID{},
			RootLayer:    lid,
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			err:          id.ErrInvalidID,
		},
		{
			Name:         "fail nil root layer id",
			Id:           sid,
			Project:      pid,
			Team:         tid,
			RootLayer:    id.LayerID{},
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			err:          id.ErrInvalidID,
		},
		{
			Name:         "success build new scene",
			Id:           sid,
			Project:      pid,
			Team:         tid,
			RootLayer:    lid,
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			Expected: struct {
				Id           id.SceneID
				Project      id.ProjectID
				Team         id.TeamID
				RootLayer    id.LayerID
				WidgetSystem *WidgetSystem
				PluginSystem *PluginSystem
				UpdatedAt    time.Time
				Property     id.PropertyID
			}{
				Id:           sid,
				Project:      pid,
				Team:         tid,
				RootLayer:    lid,
				WidgetSystem: ws,
				PluginSystem: ps,
				UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:     ppid,
			},
			err: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := New().
				ID(tc.Id).
				WidgetSystem(tc.WidgetSystem).
				Project(tc.Project).
				PluginSystem(tc.PluginSystem).
				Property(tc.Property).
				RootLayer(tc.RootLayer).
				Team(tc.Team).
				UpdatedAt(tc.UpdatedAt).
				Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.UpdatedAt, res.UpdatedAt())
				assert.Equal(tt, tc.Expected.Team, res.Team())
				assert.Equal(tt, tc.Expected.RootLayer, res.RootLayer())
				assert.Equal(tt, tc.Expected.Property, res.Property())
				assert.Equal(tt, tc.Expected.PluginSystem, res.PluginSystem())
				assert.Equal(tt, tc.Expected.WidgetSystem, res.WidgetSystem())
				assert.Equal(tt, tc.Expected.Project, res.Project())
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	tid := id.NewTeamID()
	sid := id.NewSceneID()
	pid := id.NewProjectID()
	ppid := id.NewPropertyID()
	lid := id.NewLayerID()
	nid := id.New()
	ws := NewWidgetSystem([]*Widget{
		MustNewWidget(id.WidgetID(nid), id.OfficialPluginID, "xxx", ppid, true),
	})
	ps := NewPluginSystem([]*Plugin{
		NewPlugin(id.OfficialPluginID, ppid.Ref()),
	})
	testCases := []struct {
		Name         string
		Id           id.SceneID
		Project      id.ProjectID
		Team         id.TeamID
		RootLayer    id.LayerID
		WidgetSystem *WidgetSystem
		PluginSystem *PluginSystem
		UpdatedAt    time.Time
		Property     id.PropertyID
		Expected     struct {
			Id           id.SceneID
			Project      id.ProjectID
			Team         id.TeamID
			RootLayer    id.LayerID
			WidgetSystem *WidgetSystem
			PluginSystem *PluginSystem
			UpdatedAt    time.Time
			Property     id.PropertyID
		}
		err error
	}{
		{
			Name:         "fail nil scene id",
			Id:           id.SceneID{},
			Project:      pid,
			Team:         tid,
			RootLayer:    lid,
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			err:          id.ErrInvalidID,
		},
		{
			Name:         "fail nil team id",
			Id:           sid,
			Project:      pid,
			Team:         id.TeamID{},
			RootLayer:    lid,
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			err:          id.ErrInvalidID,
		},
		{
			Name:         "fail nil root layer id",
			Id:           sid,
			Project:      pid,
			Team:         tid,
			RootLayer:    id.LayerID{},
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			err:          id.ErrInvalidID,
		},
		{
			Name:         "success build new scene",
			Id:           sid,
			Project:      pid,
			Team:         tid,
			RootLayer:    lid,
			WidgetSystem: ws,
			PluginSystem: ps,
			UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
			Property:     ppid,
			Expected: struct {
				Id           id.SceneID
				Project      id.ProjectID
				Team         id.TeamID
				RootLayer    id.LayerID
				WidgetSystem *WidgetSystem
				PluginSystem *PluginSystem
				UpdatedAt    time.Time
				Property     id.PropertyID
			}{
				Id:           sid,
				Project:      pid,
				Team:         tid,
				RootLayer:    lid,
				WidgetSystem: ws,
				PluginSystem: ps,
				UpdatedAt:    time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:     ppid,
			},
			err: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var res *Scene
			defer func() {
				if r := recover(); r == nil {
					assert.Equal(tt, tc.Expected.Id, res.ID())
					assert.Equal(tt, tc.Expected.UpdatedAt, res.UpdatedAt())
					assert.Equal(tt, tc.Expected.Team, res.Team())
					assert.Equal(tt, tc.Expected.RootLayer, res.RootLayer())
					assert.Equal(tt, tc.Expected.Property, res.Property())
					assert.Equal(tt, tc.Expected.PluginSystem, res.PluginSystem())
					assert.Equal(tt, tc.Expected.WidgetSystem, res.WidgetSystem())
					assert.Equal(tt, tc.Expected.Project, res.Project())
				}
			}()

			res = New().
				ID(tc.Id).
				WidgetSystem(tc.WidgetSystem).
				Project(tc.Project).
				PluginSystem(tc.PluginSystem).
				Property(tc.Property).
				RootLayer(tc.RootLayer).
				Team(tc.Team).
				UpdatedAt(tc.UpdatedAt).
				MustBuild()
		})
	}
}
