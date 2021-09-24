package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewWidgetAlignSystem(t *testing.T) {
	assert.Equal(t, &WidgetAlignSystem{}, NewWidgetAlignSystem())
}

func TestWidgetAlignSystem_Zone(t *testing.T) {
	was := NewWidgetAlignSystem()
	assert.Same(t, was.inner, was.Zone(WidgetZoneInner))
	assert.NotNil(t, was.inner)
	assert.Same(t, was.outer, was.Zone(WidgetZoneOuter))
	assert.NotNil(t, was.outer)
}

func TestWidgetAlignSystem_Area(t *testing.T) {
	was := NewWidgetAlignSystem()
	assert.Same(t, was.inner.right.middle, was.Area(WidgetLocation{
		Zone:    WidgetZoneInner,
		Section: WidgetSectionRight,
		Area:    WidgetAreaMiddle,
	}))
}

func TestWidgetAlignSystem_Find(t *testing.T) {
	wid1 := id.NewWidgetID()
	wid2 := id.NewWidgetID()
	wid3 := id.NewWidgetID()
	wid4 := id.NewWidgetID()
	wid5 := id.NewWidgetID()

	testCases := []struct {
		Name      string
		Input     id.WidgetID
		Expected1 int
		Expected2 WidgetLocation
		Nil       bool
	}{
		{
			Name:      "inner",
			Input:     wid2,
			Expected1: 1,
			Expected2: WidgetLocation{Zone: WidgetZoneInner, Section: WidgetSectionLeft, Area: WidgetAreaTop},
		},
		{
			Name:      "outer",
			Input:     wid4,
			Expected1: 0,
			Expected2: WidgetLocation{Zone: WidgetZoneOuter, Section: WidgetSectionLeft, Area: WidgetAreaTop},
		},
		{
			Name:      "invalid id",
			Input:     id.NewWidgetID(),
			Expected1: -1,
			Expected2: WidgetLocation{},
		},
		{
			Name:      "Return nil if no widget section",
			Input:     wid1,
			Nil:       true,
			Expected1: -1,
			Expected2: WidgetLocation{},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			if tc.Nil {
				index, location := (*WidgetAlignSystem)(nil).Find(tc.Input)
				assert.Equal(tt, tc.Expected1, index)
				assert.Equal(tt, tc.Expected2, location)
				return
			}

			was := NewWidgetAlignSystem()
			was.Zone(WidgetZoneInner).Section(WidgetSectionLeft).Area(WidgetAreaTop).AddAll([]id.WidgetID{wid1, wid2, wid3})
			was.Zone(WidgetZoneOuter).Section(WidgetSectionLeft).Area(WidgetAreaTop).AddAll([]id.WidgetID{wid4, wid5})

			index, location := was.Find(tc.Input)
			assert.Equal(tt, tc.Expected1, index)
			assert.Equal(tt, tc.Expected2, location)
		})
	}
}

func TestWidgetAlignSystem_Remove(t *testing.T) {
	wid := id.NewWidgetID()

	testCases := []struct {
		Name     string
		Zone     WidgetZoneType
		Input    id.WidgetID
		Expected []id.WidgetID
		Nil      bool
	}{
		{
			Name:     "inner: remove a widget from widget section",
			Zone:     WidgetZoneInner,
			Input:    wid,
			Expected: []id.WidgetID{},
		},
		{
			Name:     "inner: couldn't find widgetId",
			Zone:     WidgetZoneInner,
			Input:    id.NewWidgetID(),
			Expected: []id.WidgetID{wid},
		},
		{
			Name:     "outer: remove a widget from widget section",
			Zone:     WidgetZoneOuter,
			Input:    wid,
			Expected: []id.WidgetID{},
		},
		{
			Name:     "outer: couldn't find widgetId",
			Zone:     WidgetZoneOuter,
			Input:    id.NewWidgetID(),
			Expected: []id.WidgetID{wid},
		},
		{
			Name:  "nil",
			Zone:  WidgetZoneInner,
			Input: wid,
			Nil:   true,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			if tc.Nil {
				(*WidgetZone)(nil).Remove(tc.Input)
				return
			}

			ws := NewWidgetAlignSystem()
			ws.Zone(tc.Zone).Section(WidgetSectionLeft).Area(WidgetAreaTop).Add(wid, -1)
			ws.Remove(tc.Input)
			assert.Equal(tt, tc.Expected, ws.Zone(tc.Zone).Section(WidgetSectionLeft).Area(WidgetAreaTop).WidgetIDs())
		})
	}
}

func TestWidgetAlignSystem_Move(t *testing.T) {
	wid1 := id.NewWidgetID()
	wid2 := id.NewWidgetID()
	wid3 := id.NewWidgetID()
	wid4 := id.NewWidgetID()
	wid5 := id.NewWidgetID()

	testCases := []struct {
		Name           string
		Input1         id.WidgetID
		Input2         WidgetLocation
		Input3         int
		Source         WidgetLocation
		ExpectedSource []id.WidgetID
		ExpectedDest   []id.WidgetID
		Nil            bool
	}{
		{
			Name:   "move a widget in the same area with positive index",
			Input1: wid1,
			Input2: WidgetLocation{
				Zone:    WidgetZoneInner,
				Section: WidgetSectionLeft,
				Area:    WidgetAreaTop,
			},
			Input3: 1,
			Source: WidgetLocation{
				Zone:    WidgetZoneInner,
				Section: WidgetSectionLeft,
				Area:    WidgetAreaTop,
			},
			ExpectedSource: []id.WidgetID{wid2, wid1, wid3},
			ExpectedDest:   []id.WidgetID{wid2, wid1, wid3},
		},
		{
			Name:   "move a widget in the same area with negative index",
			Input1: wid1,
			Input2: WidgetLocation{
				Zone:    WidgetZoneInner,
				Section: WidgetSectionLeft,
				Area:    WidgetAreaTop,
			},
			Input3: -1,
			Source: WidgetLocation{
				Zone:    WidgetZoneInner,
				Section: WidgetSectionLeft,
				Area:    WidgetAreaTop,
			},
			ExpectedSource: []id.WidgetID{wid2, wid3, wid1},
			ExpectedDest:   []id.WidgetID{wid2, wid3, wid1},
		},
		{
			Name:   "move a widget to a different area with positive index",
			Input1: wid1,
			Input2: WidgetLocation{
				Zone:    WidgetZoneInner,
				Section: WidgetSectionLeft,
				Area:    WidgetAreaBottom,
			},
			Input3: 1,
			Source: WidgetLocation{
				Zone:    WidgetZoneOuter,
				Section: WidgetSectionRight,
				Area:    WidgetAreaTop,
			},
			ExpectedSource: []id.WidgetID{wid2, wid3},
			ExpectedDest:   []id.WidgetID{wid4, wid1, wid5},
		},
		{
			Name:   "move a widget to a different area with negative index",
			Input1: wid1,
			Input2: WidgetLocation{
				Zone:    WidgetZoneInner,
				Section: WidgetSectionLeft,
				Area:    WidgetAreaBottom,
			},
			Input3: -1,
			Source: WidgetLocation{
				Zone:    WidgetZoneOuter,
				Section: WidgetSectionCenter,
				Area:    WidgetAreaMiddle,
			},
			ExpectedSource: []id.WidgetID{wid2, wid3},
			ExpectedDest:   []id.WidgetID{wid4, wid5, wid1},
		},
		{
			Name: "nil",
			Nil:  true,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			if tc.Nil {
				(*WidgetAlignSystem)(nil).Move(tc.Input1, tc.Input2, tc.Input3)
				return
			}

			ws := NewWidgetAlignSystem()
			ws.Area(tc.Source).AddAll([]id.WidgetID{wid1, wid2, wid3})
			if tc.Source != tc.Input2 {
				ws.Area(tc.Input2).AddAll([]id.WidgetID{wid4, wid5})
			}

			ws.Move(tc.Input1, tc.Input2, tc.Input3)

			assert.Equal(tt, tc.ExpectedSource, ws.Area(tc.Source).WidgetIDs())
			assert.Equal(tt, tc.ExpectedDest, ws.Area(tc.Input2).WidgetIDs())
		})
	}
}

func TestWidgetAlignSystem_SetZone(t *testing.T) {
	type args struct {
		t WidgetZoneType
		z *WidgetZone
	}
	tests := []struct {
		name string
		args args
		nil  bool
	}{
		{
			name: "inner",
			args: args{
				t: WidgetZoneInner,
				z: &WidgetZone{},
			},
		},
		{
			name: "outer",
			args: args{
				t: WidgetZoneOuter,
				z: &WidgetZone{},
			},
		},
		{
			name: "nil area",
			args: args{
				t: WidgetZoneInner,
				z: nil,
			},
		},
		{
			name: "nil",
			args: args{
				t: WidgetZoneInner,
				z: &WidgetZone{},
			},
			nil: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var w *WidgetAlignSystem
			if !tt.nil {
				w = &WidgetAlignSystem{}
			}

			w.SetZone(tt.args.t, tt.args.z)

			if !tt.nil {
				var z2 *WidgetZone
				switch tt.args.t {
				case WidgetZoneInner:
					z2 = w.inner
				case WidgetZoneOuter:
					z2 = w.outer
				}
				assert.Same(t, tt.args.z, z2)
			}
		})
	}
}
