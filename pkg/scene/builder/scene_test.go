package builder

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestScene_FindProperty(t *testing.T) {
	p1 := id.NewPropertyID()
	sid := id.NewSceneID()
	scid := id.MustPropertySchemaID("xx~1.0.0/aa")
	pl := []*property.Property{
		property.New().NewID().Scene(sid).Schema(scid).MustBuild(),
		property.New().ID(p1).Scene(sid).Schema(scid).MustBuild(),
	}
	testCases := []struct {
		Name     string
		PL       []*property.Property
		Input    id.PropertyID
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
			Input:    id.NewPropertyID(),
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := findProperty(tc.PL, tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestScene_ToString(t *testing.T) {
	wid := id.NewWidgetID()
	widS := wid.String()
	wid2 := id.NewWidgetID()
	wid2S := wid2.String()
	wid3 := id.NewWidgetID()
	wid3S := wid3.String()
	wids := []id.WidgetID{wid, wid2, wid3}
	widsString := []string{widS, wid2S, wid3S}

	testCases := []struct {
		Name     string
		Input    []id.WidgetID
		Expected []string
	}{
		{
			Name:     "Convert a slice of id.WidgetID to a slice of strings",
			Input:    wids,
			Expected: widsString,
		},
		{
			Name:     "Return nil when no WidgetIDs are inputted",
			Input:    nil,
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := toString(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestBuildWidgetAlignSystem(t *testing.T) {
	wid := id.NewWidgetID()
	was := scene.NewWidgetAlignSystem()
	was.Area(scene.WidgetLocation{
		Zone:    scene.WidgetZoneInner,
		Section: scene.WidgetSectionLeft,
		Area:    scene.WidgetAreaTop,
	}).Add(wid, -1)

	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := buildWidgetAlignSystem(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
