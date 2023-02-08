package builder

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestScene_FindProperty(t *testing.T) {
	p1 := property.NewID()
	sid := scene.NewID()
	scid := property.MustSchemaID("xx~1.0.0/aa")
	pl := []*property.Property{
		property.New().NewID().Scene(sid).Schema(scid).MustBuild(),
		property.New().ID(p1).Scene(sid).Schema(scid).MustBuild(),
	}

	tests := []struct {
		Name     string
		PL       []*property.Property
		Input    property.ID
		Expected *property.Property
	}{
		{
			Name:     "Found",
			PL:       pl,
			Input:    p1,
			Expected: property.New().Scene(sid).Schema(scid).ID(p1).MustBuild(),
		},
		{
			Name:     " NotFound",
			PL:       pl,
			Input:    property.NewID(),
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := findProperty(tc.PL, tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestScene_ToString(t *testing.T) {
	wid := scene.NewWidgetID()
	widS := wid.String()
	wid2 := scene.NewWidgetID()
	wid2S := wid2.String()
	wid3 := scene.NewWidgetID()
	wid3S := wid3.String()
	wids := []scene.WidgetID{wid, wid2, wid3}
	widsString := []string{widS, wid2S, wid3S}

	tests := []struct {
		Name     string
		Input    []scene.WidgetID
		Expected []string
	}{
		{
			Name:     "Convert a slice of scene.WidgetID to a slice of strings",
			Input:    wids,
			Expected: widsString,
		},
		{
			Name:     "Return nil when no WidgetIDs are inputted",
			Input:    nil,
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := toString(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestBuildWidgetAlignSystem(t *testing.T) {
	wid := scene.NewWidgetID()
	was := scene.NewWidgetAlignSystem()
	was.Area(scene.WidgetLocation{
		Zone:    scene.WidgetZoneInner,
		Section: scene.WidgetSectionLeft,
		Area:    scene.WidgetAreaTop,
	}).Add(wid, -1)

	tests := []struct {
		Name     string
		Input    *scene.WidgetAlignSystem
		Expected *widgetAlignSystemJSON
	}{
		{
			Name:  "works",
			Input: was,
			Expected: &widgetAlignSystemJSON{
				Inner: &widgetZoneJSON{
					Left: &widgetSectionJSON{
						Top: &widgetAreaJSON{
							WidgetIDs: []string{wid.String()},
							Align:     "start",
							Padding: &widgetAreaPaddingJSON{
								Top:    0,
								Bottom: 0,
								Left:   0,
								Right:  0,
							},
							Gap:        nil,
							Centered:   false,
							Background: nil,
						},
					},
				},
			},
		},
		{
			Name:     "nil",
			Input:    nil,
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := buildWidgetAlignSystem(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}
