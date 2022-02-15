package scene

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestBuilder_IDs(t *testing.T) {
	tid := NewTeamID()
	lid := NewLayerID()
	b := New().NewID().RootLayer(lid).Team(tid).MustBuild()
	assert.NotNil(t, b.ID())
	assert.Equal(t, tid, b.Team())
	assert.Equal(t, lid, b.RootLayer())
	sid := NewID()
	b2 := New().ID(sid).RootLayer(lid).Team(tid).MustBuild()
	assert.Equal(t, sid, b2.ID())
}

func TestBuilder_UpdatedAt(t *testing.T) {
	ti := time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC)
	b := New().NewID().RootLayer(NewLayerID()).Team(NewTeamID()).UpdatedAt(ti).MustBuild()
	assert.Equal(t, ti, b.UpdatedAt())
}

func TestBuilder_Property(t *testing.T) {
	pid := NewPropertyID()
	b := New().NewID().RootLayer(NewLayerID()).Team(NewTeamID()).Property(pid).MustBuild()
	assert.Equal(t, pid, b.Property())
}

func TestBuilder_Plugins(t *testing.T) {
	ps := NewPlugins([]*Plugin{
		NewPlugin(OfficialPluginID, NewPropertyID().Ref()),
	})
	b := New().NewID().RootLayer(NewLayerID()).Team(NewTeamID()).Plugins(ps).MustBuild()
	assert.Equal(t, ps, b.Plugins())
}

func TestBuilder_Project(t *testing.T) {
	pid := NewProjectID()
	b := New().NewID().RootLayer(NewLayerID()).Team(NewTeamID()).Project(pid).MustBuild()
	assert.Equal(t, pid, b.Project())
}

func TestBuilder_Widgets(t *testing.T) {
	ws := NewWidgets([]*Widget{
		MustNewWidget(NewWidgetID(), OfficialPluginID, "xxx", NewPropertyID(), true, false),
	}, nil)
	b := New().NewID().RootLayer(NewLayerID()).Team(NewTeamID()).Widgets(ws).MustBuild()
	assert.Equal(t, ws, b.Widgets())
}

func TestBuilder_Build(t *testing.T) {
	tid := NewTeamID()
	sid := NewID()
	pid := NewProjectID()
	ppid := NewPropertyID()
	lid := NewLayerID()
	ws := NewWidgets([]*Widget{
		MustNewWidget(NewWidgetID(), OfficialPluginID, "xxx", ppid, true, false),
	}, nil)
	ps := NewPlugins([]*Plugin{
		NewPlugin(OfficialPluginID, ppid.Ref()),
	})

	type args struct {
		ID        ID
		Project   ProjectID
		Team      TeamID
		RootLayer LayerID
		Widgets   *Widgets
		Plugins   *Plugins
		UpdatedAt time.Time
		Property  PropertyID
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Scene
		Err      error
	}{
		{
			Name: "fail nil scene id",
			Args: args{
				ID:        ID{},
				Project:   pid,
				Team:      tid,
				RootLayer: lid,
				Widgets:   ws,
				Plugins:   ps,
				UpdatedAt: time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:  ppid,
			},
			Err: ErrInvalidID,
		},
		{
			Name: "fail nil team id",
			Args: args{
				ID:        sid,
				Project:   pid,
				Team:      TeamID{},
				RootLayer: lid,
				Widgets:   ws,
				Plugins:   ps,
				UpdatedAt: time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:  ppid,
			},
			Err: ErrInvalidID,
		},
		{
			Name: "fail nil root layer id",
			Args: args{
				ID:        sid,
				Project:   pid,
				Team:      tid,
				RootLayer: LayerID{},
				Widgets:   ws,
				Plugins:   ps,
				UpdatedAt: time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:  ppid,
			},
			Err: ErrInvalidID,
		},
		{
			Name: "success build new scene",
			Args: args{
				ID:        sid,
				Project:   pid,
				Team:      tid,
				RootLayer: lid,
				Widgets:   ws,
				Plugins:   ps,
				UpdatedAt: time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:  ppid,
			},
			Expected: &Scene{
				id:        sid,
				project:   pid,
				team:      tid,
				rootLayer: lid,
				widgets:   ws,
				plugins:   ps,
				updatedAt: time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				property:  ppid,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := New().
				ID(tt.Args.ID).
				Widgets(tt.Args.Widgets).
				Project(tt.Args.Project).
				Plugins(tt.Args.Plugins).
				Property(tt.Args.Property).
				RootLayer(tt.Args.RootLayer).
				Team(tt.Args.Team).
				UpdatedAt(tt.Args.UpdatedAt).
				Build()

			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	tid := NewTeamID()
	sid := NewID()
	pid := NewProjectID()
	ppid := NewPropertyID()
	lid := NewLayerID()
	ws := NewWidgets([]*Widget{
		MustNewWidget(NewWidgetID(), OfficialPluginID, "xxx", ppid, true, false),
	}, nil)
	was := NewWidgetAlignSystem()
	ps := NewPlugins([]*Plugin{
		NewPlugin(OfficialPluginID, ppid.Ref()),
	})

	type args struct {
		ID                ID
		Project           ProjectID
		Team              TeamID
		RootLayer         LayerID
		Widgets           *Widgets
		WidgetAlignSystem *WidgetAlignSystem
		Plugins           *Plugins
		UpdatedAt         time.Time
		Property          PropertyID
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Scene
		Err      error
	}{
		{
			Name: "fail nil scene id",
			Args: args{
				ID:                ID{},
				Project:           pid,
				Team:              tid,
				RootLayer:         lid,
				Widgets:           ws,
				WidgetAlignSystem: was,
				Plugins:           ps,
				UpdatedAt:         time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:          ppid,
			},
			Err: ErrInvalidID,
		},
		{
			Name: "fail nil team id",
			Args: args{
				ID:                sid,
				Project:           pid,
				Team:              TeamID{},
				RootLayer:         lid,
				Widgets:           ws,
				WidgetAlignSystem: was,
				Plugins:           ps,
				UpdatedAt:         time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:          ppid,
			},
			Err: ErrInvalidID,
		},
		{
			Name: "fail nil root layer id",
			Args: args{
				ID:                sid,
				Project:           pid,
				Team:              tid,
				RootLayer:         LayerID{},
				Widgets:           ws,
				WidgetAlignSystem: was,
				Plugins:           ps,
				UpdatedAt:         time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:          ppid,
			},
			Err: ErrInvalidID,
		},
		{
			Name: "success build new scene",
			Args: args{
				ID:                sid,
				Project:           pid,
				Team:              tid,
				RootLayer:         lid,
				Widgets:           ws,
				WidgetAlignSystem: was,
				Plugins:           ps,
				UpdatedAt:         time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				Property:          ppid,
			},
			Expected: &Scene{
				id:        sid,
				project:   pid,
				team:      tid,
				rootLayer: lid,
				widgets:   ws,
				plugins:   ps,
				updatedAt: time.Date(2000, 1, 1, 1, 1, 0, 0, time.UTC),
				property:  ppid,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()

			build := func() *Scene {
				t.Helper()
				return New().
					ID(tt.Args.ID).
					Widgets(tt.Args.Widgets).
					Project(tt.Args.Project).
					Plugins(tt.Args.Plugins).
					Property(tt.Args.Property).
					RootLayer(tt.Args.RootLayer).
					Team(tt.Args.Team).
					UpdatedAt(tt.Args.UpdatedAt).
					MustBuild()
			}

			if tt.Err != nil {
				assert.PanicsWithValue(t, tt.Err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.Expected, build())
			}
		})
	}
}
