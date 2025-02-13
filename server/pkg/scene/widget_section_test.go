package scene

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewWidgetSection(t *testing.T) {
	assert.Equal(t, &WidgetSection{}, NewWidgetSection())
}

func TestWidgetSection_Area(t *testing.T) {
	ws := NewWidgetSection()
	assert.Same(t, ws.top, ws.Area(WidgetAreaTop))
	assert.NotNil(t, ws.top)
	assert.Same(t, ws.middle, ws.Area(WidgetAreaMiddle))
	assert.NotNil(t, ws.middle)
	assert.Same(t, ws.bottom, ws.Area(WidgetAreaBottom))
	assert.NotNil(t, ws.bottom)
}

func TestWidgetSection_Find(t *testing.T) {
	wid1 := id.NewWidgetID()
	wid2 := id.NewWidgetID()
	wid3 := id.NewWidgetID()
	wid4 := id.NewWidgetID()
	wid5 := id.NewWidgetID()
	wid6 := id.NewWidgetID()
	wid7 := id.NewWidgetID()

	tests := []struct {
		Name      string
		Input     id.WidgetID
		Expected1 int
		Expected2 WidgetAreaType
		Nil       bool
	}{
		{
			Name:      "top",
			Input:     wid2,
			Expected1: 1,
			Expected2: WidgetAreaTop,
		},
		{
			Name:      "middle",
			Input:     wid4,
			Expected1: 0,
			Expected2: WidgetAreaMiddle,
		},
		{
			Name:      "bottom",
			Input:     wid7,
			Expected1: 1,
			Expected2: WidgetAreaBottom,
		},
		{
			Name:      "invalid id",
			Input:     id.NewWidgetID(),
			Expected1: -1,
			Expected2: "",
		},
		{
			Name:      "Return nil if no widget section",
			Input:     wid1,
			Nil:       true,
			Expected1: -1,
			Expected2: "",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			if tc.Nil {
				index, area := (*WidgetSection)(nil).Find(tc.Input)
				assert.Equal(t, tc.Expected1, index)
				assert.Equal(t, tc.Expected2, area)
				return
			}

			ws := NewWidgetSection()
			ws.Area(WidgetAreaTop).AddAll(id.WidgetIDList{wid1, wid2, wid3})
			ws.Area(WidgetAreaMiddle).AddAll(id.WidgetIDList{wid4, wid5})
			ws.Area(WidgetAreaBottom).AddAll(id.WidgetIDList{wid6, wid7})

			index, area := ws.Find(tc.Input)
			assert.Equal(t, tc.Expected1, index)
			assert.Equal(t, tc.Expected2, area)
		})
	}
}

func TestWidgetSection_Remove(t *testing.T) {
	wid := id.NewWidgetID()

	tests := []struct {
		Name     string
		Area     WidgetAreaType
		Input    id.WidgetID
		Expected id.WidgetIDList
		Nil      bool
	}{
		{
			Name:     "top: remove a widget from widget section",
			Area:     WidgetAreaTop,
			Input:    wid,
			Expected: id.WidgetIDList{},
		},
		{
			Name:     "top: couldn't find widgetId",
			Area:     WidgetAreaTop,
			Input:    id.NewWidgetID(),
			Expected: id.WidgetIDList{wid},
		},
		{
			Name:     "middle: remove a widget from widget section",
			Area:     WidgetAreaMiddle,
			Input:    wid,
			Expected: id.WidgetIDList{},
		},
		{
			Name:     "middle: couldn't find widgetId",
			Area:     WidgetAreaMiddle,
			Input:    id.NewWidgetID(),
			Expected: id.WidgetIDList{wid},
		},
		{
			Name:     "bottom: remove a widget from widget section",
			Area:     WidgetAreaBottom,
			Input:    wid,
			Expected: id.WidgetIDList{},
		},
		{
			Name:     "bottom: couldn't find widgetId",
			Area:     WidgetAreaBottom,
			Input:    id.NewWidgetID(),
			Expected: id.WidgetIDList{wid},
		},
		{
			Name:  "nil",
			Area:  WidgetAreaTop,
			Input: wid,
			Nil:   true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			if tc.Nil {
				(*WidgetSection)(nil).Remove(tc.Input)
				return
			}

			ws := NewWidgetSection()
			ws.Area(tc.Area).Add(wid, -1)
			ws.Remove(tc.Input)
			assert.Equal(t, tc.Expected, ws.Area(tc.Area).WidgetIDs())
		})
	}
}

func TestWidgetSection_SetArea(t *testing.T) {
	type args struct {
		t WidgetAreaType
		a *WidgetArea
	}

	tests := []struct {
		name string
		args args
		nil  bool
	}{
		{
			name: "top",
			args: args{
				t: WidgetAreaTop,
				a: &WidgetArea{},
			},
		},
		{
			name: "middle",
			args: args{
				t: WidgetAreaMiddle,
				a: &WidgetArea{},
			},
		},
		{
			name: "bottom",
			args: args{
				t: WidgetAreaBottom,
				a: &WidgetArea{},
			},
		},
		{
			name: "nil area",
			args: args{
				t: WidgetAreaTop,
				a: nil,
			},
		},
		{
			name: "nil",
			args: args{
				t: WidgetAreaTop,
				a: &WidgetArea{},
			},
			nil: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var s *WidgetSection
			if !tt.nil {
				s = &WidgetSection{}
			}

			s.SetArea(tt.args.t, tt.args.a)

			if !tt.nil {
				var a2 *WidgetArea
				switch tt.args.t {
				case WidgetAreaTop:
					a2 = s.top
				case WidgetAreaMiddle:
					a2 = s.middle
				case WidgetAreaBottom:
					a2 = s.bottom
				}
				assert.Same(t, tt.args.a, a2)
			}
		})
	}
}
