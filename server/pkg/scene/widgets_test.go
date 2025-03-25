package scene

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewWidgets(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	wid := id.NewWidgetID()

	tests := []struct {
		Name     string
		Input    []*Widget
		Expected []*Widget
	}{
		{
			Name:     "nil widget list",
			Input:    nil,
			Expected: []*Widget{},
		},
		{
			Name:     "widget list with nil",
			Input:    []*Widget{nil},
			Expected: []*Widget{},
		},
		{
			Name: "widget list",
			Input: []*Widget{
				MustWidget(wid, pid, "see", pr, true, false),
			},
			Expected: []*Widget{
				MustWidget(wid, pid, "see", pr, true, false),
			},
		},
		{
			Name: "widget list with duplicatd values",
			Input: []*Widget{
				MustWidget(wid, pid, "see", pr, true, false),
				MustWidget(wid, pid, "see", pr, true, false),
			},
			Expected: []*Widget{
				MustWidget(wid, pid, "see", pr, true, false),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, NewWidgets(tc.Input, nil).Widgets())
		})
	}
}

func TestWidgets_Add(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	wid := id.NewWidgetID()

	tests := []struct {
		Name     string
		Widgets  []*Widget
		Input    *Widget
		Expected []*Widget
		Nil      bool
	}{
		{
			Name:     "add new widget",
			Input:    MustWidget(wid, pid, "see", pr, true, false),
			Expected: []*Widget{MustWidget(wid, pid, "see", pr, true, false)},
		},
		{
			Name:     "add nil widget",
			Input:    nil,
			Expected: []*Widget{},
		},
		{
			Name:     "add to nil widgets",
			Input:    MustWidget(wid, pid, "see", pr, true, false),
			Expected: nil,
			Nil:      true,
		},
		{
			Name:     "add existing widget",
			Widgets:  []*Widget{MustWidget(wid, pid, "see", pr, true, false)},
			Input:    MustWidget(wid, pid, "see", pr, true, false),
			Expected: []*Widget{MustWidget(wid, pid, "see", pr, true, false)},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			var ws *Widgets
			if !tc.Nil {
				ws = NewWidgets(tc.Widgets, nil)
			}
			ws.Add(tc.Input)
			assert.Equal(t, tc.Expected, ws.Widgets())
		})
	}
}

func TestWidgets_Remove(t *testing.T) {
	wid := id.NewWidgetID()
	wid2 := id.NewWidgetID()
	pid := id.MustPluginID("xxx~1.1.1")
	pid2 := id.MustPluginID("xxx~1.1.2")
	pr := id.NewPropertyID()

	tests := []struct {
		Name  string
		Input id.WidgetID
		Nil   bool
	}{
		{
			Name:  "remove a widget",
			Input: wid,
		},
		{
			Name:  "remove from nil widgets",
			Input: wid,
			Nil:   true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			var ws *Widgets
			if !tc.Nil {
				ws = NewWidgets([]*Widget{
					MustWidget(wid, pid2, "e1", pr, true, false),
					MustWidget(wid2, pid, "e1", pr, true, false),
				}, nil)
				assert.True(t, ws.Has(tc.Input))
			}
			ws.Remove(tc.Input)
			assert.False(t, ws.Has(tc.Input))
		})
	}
}

func TestWidgets_RemoveAllByPlugin(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pid2 := id.MustPluginID("xxx~1.1.2")
	w1 := MustWidget(id.NewWidgetID(), pid, "e1", id.NewPropertyID(), true, false)
	w2 := MustWidget(id.NewWidgetID(), pid, "e2", id.NewPropertyID(), true, false)
	w3 := MustWidget(id.NewWidgetID(), pid2, "e1", id.NewPropertyID(), true, false)

	tests := []struct {
		Name             string
		ArgsPID          id.PluginID
		ArgsEID          *id.PluginExtensionID
		Target, Expected *Widgets
		ExpectedResult   []id.PropertyID
	}{
		{
			Name:           "remove widgets",
			ArgsPID:        pid,
			ArgsEID:        nil,
			Target:         NewWidgets([]*Widget{w1, w2, w3}, nil),
			Expected:       NewWidgets([]*Widget{w3}, nil),
			ExpectedResult: []id.PropertyID{w1.Property(), w2.Property()},
		},
		{
			Name:           "remove widgets of extension",
			ArgsPID:        pid,
			ArgsEID:        id.PluginExtensionID("e2").Ref(),
			Target:         NewWidgets([]*Widget{w1, w2, w3}, nil),
			Expected:       NewWidgets([]*Widget{w1, w3}, nil),
			ExpectedResult: []id.PropertyID{w2.Property()},
		},
		{
			Name:           "remove from nil widgets",
			Target:         nil,
			Expected:       nil,
			ExpectedResult: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.ExpectedResult, tc.Target.RemoveAllByPlugin(tc.ArgsPID, tc.ArgsEID))
			assert.Equal(t, tc.Expected, tc.Target)
		})
	}
}

func TestWidgets_UpgradePlugin(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pid2 := id.MustPluginID("zzz~1.1.1")
	pr := id.NewPropertyID()
	wid := id.NewWidgetID()

	tests := []struct {
		Name         string
		PID, NewID   id.PluginID
		WS, Expected *Widgets
	}{
		{
			Name:     "replace a widget",
			PID:      pid,
			NewID:    pid2,
			WS:       NewWidgets([]*Widget{MustWidget(wid, pid, "eee", pr, true, false)}, nil),
			Expected: NewWidgets([]*Widget{MustWidget(wid, pid2, "eee", pr, true, false)}, nil),
		},
		{
			Name:     "replace with nil widget",
			PID:      pid,
			WS:       NewWidgets(nil, nil),
			Expected: NewWidgets(nil, nil),
		},
		{
			Name:     "replace from nil widgets",
			WS:       nil,
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			tc.WS.UpgradePlugin(tc.PID, tc.NewID)
			assert.Equal(t, tc.Expected, tc.WS)
		})
	}
}

func TestWidgets_Properties(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	pr2 := id.NewPropertyID()
	wid := id.NewWidgetID()
	wid2 := id.NewWidgetID()

	tests := []struct {
		Name     string
		WS       *Widgets
		Expected []id.PropertyID
	}{
		{
			Name: "get properties",
			WS: NewWidgets([]*Widget{
				MustWidget(wid, pid, "eee", pr, true, false),
				MustWidget(wid2, pid, "eee", pr2, true, false),
			}, nil),
			Expected: []id.PropertyID{pr, pr2},
		},
		{
			Name:     "get properties from nil widgets",
			WS:       nil,
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.WS.Properties()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestWidgets_Widgets(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	pr2 := id.NewPropertyID()
	wid := id.NewWidgetID()
	wid2 := id.NewWidgetID()

	tests := []struct {
		Name     string
		WS       *Widgets
		Expected []*Widget
	}{
		{
			Name: "get widgets",
			WS: NewWidgets([]*Widget{
				MustWidget(wid, pid, "eee", pr, true, false),
				MustWidget(wid2, pid, "eee", pr2, true, false),
			}, nil),
			Expected: []*Widget{
				MustWidget(wid, pid, "eee", pr, true, false),
				MustWidget(wid2, pid, "eee", pr2, true, false),
			},
		},
		{
			Name:     "get widgets from nil widgets",
			WS:       nil,
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.WS.Widgets()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestWidgets_Widget(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	wid := id.NewWidgetID()

	tests := []struct {
		Name     string
		ID       id.WidgetID
		WS       *Widgets
		Expected *Widget
	}{
		{
			Name:     "get a widget",
			ID:       wid,
			WS:       NewWidgets([]*Widget{MustWidget(wid, pid, "eee", pr, true, false)}, nil),
			Expected: MustWidget(wid, pid, "eee", pr, true, false),
		},
		{
			Name:     "dont has the widget",
			ID:       wid,
			WS:       NewWidgets([]*Widget{}, nil),
			Expected: nil,
		},
		{
			Name:     "get widget from nil widgets",
			ID:       wid,
			WS:       nil,
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.WS.Widget(tc.ID)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestWidgets_Has(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	wid := id.NewWidgetID()

	tests := []struct {
		Name     string
		ID       id.WidgetID
		WS       *Widgets
		Expected bool
	}{
		{
			Name:     "has a widget",
			ID:       wid,
			WS:       NewWidgets([]*Widget{MustWidget(wid, pid, "eee", pr, true, false)}, nil),
			Expected: true,
		},
		{
			Name:     "dont has a widget",
			ID:       wid,
			WS:       NewWidgets([]*Widget{}, nil),
			Expected: false,
		},
		{
			Name:     "has from nil widgets",
			ID:       wid,
			WS:       nil,
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.WS.Has(tc.ID)
			assert.Equal(t, tc.Expected, res)
		})
	}
}
