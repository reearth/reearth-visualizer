package scene

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewPlugins(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

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
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    id.PluginID
		PS       *Plugins
		Expected *id.PropertyID
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
			PS:       NewPlugins([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
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
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    id.PluginID
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
			PS:       NewPlugins([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
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

func TestPlugins_PluginByName(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    string
		PS       *Plugins
		Expected *Plugin
	}{
		{
			Name:     "plugin is found",
			Input:    "xxx",
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugin(pid, pr),
		},
		{
			Name:     "plugin is not found",
			Input:    "xxz",
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.PS.PluginByName(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_Properties(t *testing.T) {
	pr := id.NewPropertyID().Ref()
	pr2 := id.NewPropertyID().Ref()

	tests := []struct {
		Name     string
		PS       *Plugins
		Expected []id.PropertyID
	}{
		{
			Name:     "plugins is nil",
			PS:       nil,
			Expected: nil,
		},
		{
			Name: "get properties",
			PS: NewPlugins([]*Plugin{
				NewPlugin(id.MustPluginID("zzz~1.1.1"), pr),
				NewPlugin(id.MustPluginID("xxx~1.1.1"), pr2),
			}),
			Expected: []id.PropertyID{*pr, *pr2},
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
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    id.PluginID
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
			PS:       NewPlugins([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
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
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    id.PluginID
		PS       *Plugins
		Expected bool
	}{
		{
			Name:     "plugin is found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: true,
		},
		{
			Name:     "plugin is not found",
			Input:    pid,
			PS:       NewPlugins([]*Plugin{NewPlugin(id.MustPluginID("xxx~1.2.1"), pr)}),
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

func TestPlugins_HasPluginByName(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name     string
		Input    string
		PS       *Plugins
		Expected bool
	}{
		{
			Name:     "plugin is found",
			Input:    "xxx",
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: true,
		},
		{
			Name:     "plugin is not found",
			Input:    "xxxx",
			PS:       NewPlugins([]*Plugin{NewPlugin(id.MustPluginID("zzz~1.1.1"), pr)}),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.PS.HasPluginByName(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestPlugins_Add(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name         string
		Input        *Plugin
		PS, Expected *Plugins
		Want         bool
	}{
		{
			Name:     "add nil plugin",
			Input:    nil,
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Want:     false,
		},
		{
			Name:     "add existing plugin",
			Input:    NewPlugin(pid, pr),
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Want:     false,
		},
		{
			Name:     "add official plugin",
			Input:    NewPlugin(id.OfficialPluginID, pr),
			PS:       NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Want:     false,
		},
		{
			Name:     "add new plugin",
			Input:    NewPlugin(pid, pr),
			PS:       NewPlugins([]*Plugin{}),
			Expected: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			Want:     true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Want, tc.PS.Add(tc.Input))
			assert.Equal(t, tc.Expected, tc.PS)
		})
	}
}

func TestPlugins_Remove(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	tests := []struct {
		Name         string
		Input        id.PluginID
		PS, Expected *Plugins
	}{
		{
			Name:     "remove official plugin",
			Input:    id.OfficialPluginID,
			PS:       NewPlugins([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
			Expected: NewPlugins([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
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
	pid := id.MustPluginID("xxx~1.1.1")
	nid := id.MustPluginID("zzz~1.1.1")
	pr := id.NewPropertyID().Ref()
	pr2 := id.NewPropertyID().Ref()

	type args struct {
		From           id.PluginID
		To             id.PluginID
		Property       *id.PropertyID
		DeleteProperty bool
	}

	tests := []struct {
		name   string
		args   args
		target *Plugins
		want   *Plugins
	}{
		{
			name: "upgrade a plugin",
			args: args{
				From: pid,
				To:   nid,
			},
			target: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			want:   NewPlugins([]*Plugin{NewPlugin(nid, pr)}),
		},
		{
			name: "upgrade a plugin with changing property",
			args: args{
				From:     pid,
				To:       nid,
				Property: pr2,
			},
			target: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			want:   NewPlugins([]*Plugin{NewPlugin(nid, pr2)}),
		},
		{
			name: "upgrade a plugin with deleting property",
			args: args{
				From:           pid,
				To:             nid,
				Property:       pr2,
				DeleteProperty: true,
			},
			target: NewPlugins([]*Plugin{NewPlugin(pid, pr)}),
			want:   NewPlugins([]*Plugin{NewPlugin(nid, nil)}),
		},
		{
			name: "upgrade official plugin",
			args: args{
				From: id.OfficialPluginID,
				To:   nid,
			},
			target: NewPlugins([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
			want:   NewPlugins([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
		},
		{
			name: "same plugin",
			args: args{
				From: pid,
				To:   pid,
			},
			target: NewPlugins([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
			want:   NewPlugins([]*Plugin{NewPlugin(id.OfficialPluginID, pr)}),
		},
		{
			name: "nil",
			args: args{
				From: pid,
				To:   nid,
			},
			target: nil,
			want:   nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			tc.target.Upgrade(tc.args.From, tc.args.To, tc.args.Property, tc.args.DeleteProperty)
			assert.Equal(t, tc.want, tc.target)
		})
	}
}
