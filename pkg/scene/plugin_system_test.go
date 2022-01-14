package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPluginSystem(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()
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
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    PluginID
		PS       *PluginSystem
		Expected *PropertyID
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
			PS:       NewPluginSystem([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
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
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    PluginID
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
			PS:       NewPluginSystem([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
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
	pr := NewPropertyID().Ref()
	pr2 := NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		PS       *PluginSystem
		Expected []PropertyID
	}{
		{
			Name:     "pluginSystem is nil",
			PS:       nil,
			Expected: nil,
		},
		{
			Name: "get properties",
			PS: NewPluginSystem([]*Plugin{
				NewPlugin(MustPluginID("zzz~1.1.1"), pr),
				NewPlugin(MustPluginID("xxx~1.1.1"), pr2),
			}),
			Expected: []PropertyID{*pr, *pr2},
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
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    PluginID
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
			PS:       NewPluginSystem([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
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
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()
	testCases := []struct {
		Name     string
		Input    PluginID
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
			PS:       NewPluginSystem([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
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
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()
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
			Input:    NewPlugin(OfficialPluginID, pr),
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
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()
	testCases := []struct {
		Name         string
		Input        PluginID
		PS, Expected *PluginSystem
	}{
		{
			Name:     "remove official plugin",
			Input:    OfficialPluginID,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
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
	pid := MustPluginID("xxx~1.1.1")
	nid := MustPluginID("zzz~1.1.1")
	pr := NewPropertyID().Ref()
	testCases := []struct {
		Name         string
		PID, NewID   PluginID
		PS, Expected *PluginSystem
	}{
		{
			Name:     "upgrade official plugin",
			PID:      OfficialPluginID,
			PS:       NewPluginSystem([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
			Expected: NewPluginSystem([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
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
