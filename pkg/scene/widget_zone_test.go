package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewWidgetZone(t *testing.T) {
	assert.Equal(t, &WidgetZone{}, NewWidgetZone())
}

func TestWidgetZone_Section(t *testing.T) {
	wz := NewWidgetZone()
	assert.Same(t, wz.left, wz.Section(WidgetSectionLeft))
	assert.NotNil(t, wz.left)
	assert.Same(t, wz.center, wz.Section(WidgetSectionCenter))
	assert.NotNil(t, wz.center)
	assert.Same(t, wz.right, wz.Section(WidgetSectionRight))
	assert.NotNil(t, wz.right)
}

func TestWidgetZone_Find(t *testing.T) {
	wid1 := id.NewWidgetID()
	wid2 := id.NewWidgetID()
	wid3 := id.NewWidgetID()
	wid4 := id.NewWidgetID()
	wid5 := id.NewWidgetID()
	wid6 := id.NewWidgetID()
	wid7 := id.NewWidgetID()

	testCases := []struct {
		Name      string
		Input     id.WidgetID
		Expected1 int
		Expected2 WidgetSectionType
		Expected3 WidgetAreaType
		Nil       bool
	}{
		{
			Name:      "left",
			Input:     wid2,
			Expected1: 1,
			Expected2: WidgetSectionLeft,
			Expected3: WidgetAreaTop,
		},
		{
			Name:      "center",
			Input:     wid4,
			Expected1: 0,
			Expected2: WidgetSectionCenter,
			Expected3: WidgetAreaTop,
		},
		{
			Name:      "right",
			Input:     wid7,
			Expected1: 1,
			Expected2: WidgetSectionRight,
			Expected3: WidgetAreaTop,
		},
		{
			Name:      "invalid id",
			Input:     id.NewWidgetID(),
			Expected1: -1,
			Expected2: "",
			Expected3: "",
		},
		{
			Name:      "Return nil if no widget section",
			Input:     wid1,
			Nil:       true,
			Expected1: -1,
			Expected2: "",
			Expected3: "",
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			if tc.Nil {
				index, section, area := (*WidgetZone)(nil).Find(tc.Input)
				assert.Equal(tt, tc.Expected1, index)
				assert.Equal(tt, tc.Expected2, section)
				assert.Equal(tt, tc.Expected3, area)
				return
			}

			ez := NewWidgetZone()
			ez.Section(WidgetSectionLeft).Area(WidgetAreaTop).AddAll([]id.WidgetID{wid1, wid2, wid3})
			ez.Section(WidgetSectionCenter).Area(WidgetAreaTop).AddAll([]id.WidgetID{wid4, wid5})
			ez.Section(WidgetSectionRight).Area(WidgetAreaTop).AddAll([]id.WidgetID{wid6, wid7})

			index, section, area := ez.Find(tc.Input)
			assert.Equal(tt, tc.Expected1, index)
			assert.Equal(tt, tc.Expected2, section)
			assert.Equal(tt, tc.Expected3, area)
		})
	}
}

func TestWidgetZone_Remove(t *testing.T) {
	wid := id.NewWidgetID()

	testCases := []struct {
		Name     string
		Section  WidgetSectionType
		Input    id.WidgetID
		Expected []id.WidgetID
		Nil      bool
	}{
		{
			Name:     "left: remove a widget from widget section",
			Section:  WidgetSectionLeft,
			Input:    wid,
			Expected: []id.WidgetID{},
		},
		{
			Name:     "left: couldn't find widgetId",
			Section:  WidgetSectionLeft,
			Input:    id.NewWidgetID(),
			Expected: []id.WidgetID{wid},
		},
		{
			Name:     "center: remove a widget from widget section",
			Section:  WidgetSectionCenter,
			Input:    wid,
			Expected: []id.WidgetID{},
		},
		{
			Name:     "center: couldn't find widgetId",
			Section:  WidgetSectionCenter,
			Input:    id.NewWidgetID(),
			Expected: []id.WidgetID{wid},
		},
		{
			Name:     "right: remove a widget from widget section",
			Section:  WidgetSectionRight,
			Input:    wid,
			Expected: []id.WidgetID{},
		},
		{
			Name:     "right: couldn't find widgetId",
			Section:  WidgetSectionRight,
			Input:    id.NewWidgetID(),
			Expected: []id.WidgetID{wid},
		},
		{
			Name:    "nil",
			Section: WidgetSectionLeft,
			Input:   wid,
			Nil:     true,
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

			ws := NewWidgetZone()
			ws.Section(tc.Section).Area(WidgetAreaTop).Add(wid, -1)
			ws.Remove(tc.Input)
			assert.Equal(tt, tc.Expected, ws.Section(tc.Section).Area(WidgetAreaTop).WidgetIDs())
		})
	}
}

func TestWidgetZone_SetSection(t *testing.T) {
	type args struct {
		t WidgetSectionType
		s *WidgetSection
	}
	tests := []struct {
		name string
		args args
		nil  bool
	}{
		{
			name: "left",
			args: args{
				t: WidgetSectionLeft,
				s: &WidgetSection{},
			},
		},
		{
			name: "center",
			args: args{
				t: WidgetSectionCenter,
				s: &WidgetSection{},
			},
		},
		{
			name: "right",
			args: args{
				t: WidgetSectionRight,
				s: &WidgetSection{},
			},
		},
		{
			name: "nil area",
			args: args{
				t: WidgetSectionLeft,
				s: nil,
			},
		},
		{
			name: "nil",
			args: args{
				t: WidgetSectionLeft,
				s: &WidgetSection{},
			},
			nil: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var z *WidgetZone
			if !tt.nil {
				z = &WidgetZone{}
			}

			z.SetSection(tt.args.t, tt.args.s)

			if !tt.nil {
				var s2 *WidgetSection
				switch tt.args.t {
				case WidgetSectionLeft:
					s2 = z.left
				case WidgetSectionCenter:
					s2 = z.center
				case WidgetSectionRight:
					s2 = z.right
				}
				assert.Same(t, tt.args.s, s2)
			}
		})
	}
}
