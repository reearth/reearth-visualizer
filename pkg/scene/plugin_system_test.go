package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewPluginSystem(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    []*Plugin
		Expected *PluginSystem
	}{
		{
			Name:     "nil plugin list",
			Input:    nil,
			Expected: &PluginSystem{plugins: []*Plugin{}},
		},
		{
			Name:     "plugin list with nil",
			Input:    []*Plugin{nil},
			Expected: &PluginSystem{plugins: []*Plugin{}},
		},
		{
			Name: "plugin list with matched values",
			Input: []*Plugin{
				{
					plugin:   pid,
					property: pr,
				},
			},
			Expected: &PluginSystem{plugins: []*Plugin{
				NewPlugin(pid, pr),
			}},
		},
		{
			Name: "plugin list with duplicated values",
			Input: []*Plugin{
				{
					plugin:   pid,
					property: pr,
				},
				{
					plugin:   pid,
					property: pr,
				},
			},
			Expected: &PluginSystem{plugins: []*Plugin{
				NewPlugin(pid, pr),
			}},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := NewPluginSystem(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestPluginSystem_Property(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    id.PluginID
		PS       *PluginSystem
		Expected *id.PropertyID
	}{
		{
			Name:     "property is found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: pr,
		},
		{
			Name:     "property is nil",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, nil)}),
			Expected: nil,
		},
		{
			Name:     "property is not found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.PS.Property(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestPluginSystem_Plugin(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    id.PluginID
		PS       *PluginSystem
		Expected *Plugin
	}{
		{
			Name:     "plugin is found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugin(pid, pr),
		},
		{
			Name:     "plugin is not found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.PS.Plugin(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestPluginSystem_Properties(t *testing.T) {
	pr := id.NewPropertyID().Ref()
	pr2 := id.NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		PS       *PluginSystem
		Expected []id.PropertyID
	}{
		{
			Name:     "pluginSystem is nil",
			PS:       nil,
			Expected: nil,
		},
		{
			Name: "get properties",
			PS: NewPluginSystem([]*Plugin{
				NewPlugin(id.MustPluginID("zzz~1.1.1"), pr),
				NewPlugin(id.MustPluginID("xxx~1.1.1"), pr2),
			}),
			Expected: []id.PropertyID{*pr, *pr2},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.PS.Properties()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestPluginSystem_Has(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    id.PluginID
		PS       *PluginSystem
		Expected bool
	}{
		{
			Name:     "property is found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: true,
		},
		{
			Name:     "property is not found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
			Expected: false,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.PS.Has(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestPluginSystem_HasPlugin(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    id.PluginID
		PS       *PluginSystem
		Expected bool
	}{
		{
			Name:     "property is found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: true,
		},
		{
			Name:     "property is not found",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
			Expected: false,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.PS.HasPlugin(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestPluginSystem_Add(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name         string
		Input        *Plugin
		PS, Expected *PluginSystem
	}{
		{
			Name:     "add nil plugin",
			Input:    nil,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
		},
		{
			Name:     "add existing plugin",
			Input:    NewPlugin(pid, pr),
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
		},
		{
			Name:     "add official plugin",
			Input:    NewPlugin(id.OfficialPluginID, pr),
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
		},
		{
			Name:     "add new plugin",
			Input:    NewPlugin(pid, pr),
			PS:       NewPluginSystem([]*Plugin{}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			tc.PS.Add(tc.Input)
			assert.Equal(tt, tc.Expected, tc.PS)
		})
	}
}

func TestPluginSystem_Remove(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name         string
		Input        id.PluginID
		PS, Expected *PluginSystem
	}{
		{
			Name:     "remove official plugin",
			Input:    id.OfficialPluginID,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
		},
		{
			Name:     "remove a plugin",
			Input:    pid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPluginSystem([]*Plugin{}),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			tc.PS.Remove(tc.Input)
			assert.Equal(tt, tc.Expected, tc.PS)
		})
	}
}

func TestPluginSystem_Upgrade(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	nid := id.MustPluginID("zzz~1.1.1")
	pr := id.NewPropertyID().Ref()
	testCases := []struct {
		Name         string
		PID, NewID   id.PluginID
		PS, Expected *PluginSystem
	}{
		{
			Name:     "upgrade official plugin",
			PID:      id.OfficialPluginID,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
		},
		{
			Name:     "upgrade a plugin",
			PID:      pid,
			NewID:    nid,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(nid, pr)}),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			tc.PS.Upgrade(tc.PID, tc.NewID)
			assert.Equal(tt, tc.Expected, tc.PS)
		})
	}
}
