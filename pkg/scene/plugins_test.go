package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPlugins(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    []*Plugin
		Expected *Plugins
	}{
		{
			Name:     "nil plugin list",
			Input:    nil,
			Expected: &Plugins{plugins: []*Plugin{}},
		},
		{
			Name:     "plugin list with nil",
			Input:    []*Plugin{nil},
			Expected: &Plugins{plugins: []*Plugin{}},
		},
		{
			Name: "plugin list with matched values",
			Input: []*Plugin{
				{
					plugin:   pid,
					property: pr,
				},
			},
			Expected: &Plugins{plugins: []*Plugin{
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
			Expected: &Plugins{plugins: []*Plugin{
				NewPlugin(pid, pr),
			}},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := NewPlugins(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_Property(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    PluginID
		PS       *Plugins
		Expected *PropertyID
	}{
		{
			Name:     "property is found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: pr,
		},
		{
			Name:     "property is nil",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, nil)}),
			Expected: nil,
		},
		{
			Name:     "property is not found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.PS.Property(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_Plugin(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    PluginID
		PS       *Plugins
		Expected *Plugin
	}{
		{
			Name:     "plugin is found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugin(pid, pr),
		},
		{
			Name:     "plugin is not found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.PS.Plugin(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_Properties(t *testing.T) {
	pr := NewPropertyID().Ref()
	pr2 := NewPropertyID().Ref()

	tests := []struct {
		Name     string
		PS       *Plugins
		Expected []PropertyID
	}{
		{
			Name:     "plugins is nil",
			PS:       nil,
			Expected: nil,
		},
		{
			Name: "get properties",
			PS: NewPlugins([]*Plugin{
				NewPlugin(MustPluginID("zzz~1.1.1"), pr),
				NewPlugin(MustPluginID("xxx~1.1.1"), pr2),
			}),
			Expected: []PropertyID{*pr, *pr2},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.PS.Properties()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_Has(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    PluginID
		PS       *Plugins
		Expected bool
	}{
		{
			Name:     "property is found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: true,
		},
		{
			Name:     "property is not found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.PS.Has(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_HasPlugin(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    PluginID
		PS       *Plugins
		Expected bool
	}{
		{
			Name:     "property is found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: true,
		},
		{
			Name:     "property is not found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(MustPluginID("zzz~1.1.1"), pr)}),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.PS.HasPlugin(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_Add(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name         string
		Input        *Plugin
		PS, Expected *Plugins
	}{
		{
			Name:     "add nil plugin",
			Input:    nil,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
		},
		{
			Name:     "add existing plugin",
			Input:    NewPlugin(pid, pr),
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
		},
		{
			Name:     "add official plugin",
			Input:    NewPlugin(OfficialPluginID, pr),
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
		},
		{
			Name:     "add new plugin",
			Input:    NewPlugin(pid, pr),
			PS:       NewPlugins([]*Plugin{}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			tc.PS.Add(tc.Input)
			assert.Equal(t, tc.Expected, tc.PS)
		})
	}
}

func TestPlugins_Remove(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name         string
		Input        PluginID
		PS, Expected *Plugins
	}{
		{
			Name:     "remove official plugin",
			Input:    OfficialPluginID,
			PS:       NewPlugins([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
		},
		{
			Name:     "remove a plugin",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{}),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			tc.PS.Remove(tc.Input)
			assert.Equal(t, tc.Expected, tc.PS)
		})
	}
}

func TestPlugins_Upgrade(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	nid := MustPluginID("zzz~1.1.1")
	pr := NewPropertyID().Ref()

	tests := []struct {
		Name         string
		PID, NewID   PluginID
		PS, Expected *Plugins
	}{
		{
			Name:     "upgrade official plugin",
			PID:      OfficialPluginID,
			PS:       NewPlugins([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(OfficialPluginID, pr)}),
		},
		{
			Name:     "upgrade a plugin",
			PID:      pid,
			NewID:    nid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(nid, pr)}),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			tc.PS.Upgrade(tc.PID, tc.NewID)
			assert.Equal(t, tc.Expected, tc.PS)
		})
	}
}
