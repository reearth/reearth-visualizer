package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewWidgetSystem(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()
	testCases := []struct {
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
				MustNewWidget(wid, pid, "see", pr, true, false),
			},
			Expected: []*Widget{
				MustNewWidget(wid, pid, "see", pr, true, false),
			},
		},
		{
			Name: "widget list with duplicatd values",
			Input: []*Widget{
				MustNewWidget(wid, pid, "see", pr, true, false),
				MustNewWidget(wid, pid, "see", pr, true, false),
			},
			Expected: []*Widget{
				MustNewWidget(wid, pid, "see", pr, true, false),
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected, NewWidgetSystem(tc.Input).Widgets())
		})
	}
}

func TestWidgetSystem_Add(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()
	testCases := []struct {
		Name     string
		Widgets  []*Widget
		Input    *Widget
		Expected []*Widget
		Nil      bool
	}{
		{
			Name:     "add new widget",
			Input:    MustNewWidget(wid, pid, "see", pr, true, false),
			Expected: []*Widget{MustNewWidget(wid, pid, "see", pr, true, false)},
		},
		{
			Name:     "add nil widget",
			Input:    nil,
			Expected: []*Widget{},
		},
		{
			Name:     "add to nil widgetSystem",
			Input:    MustNewWidget(wid, pid, "see", pr, true, false),
			Expected: nil,
			Nil:      true,
		},
		{
			Name:     "add existing widget",
			Widgets:  []*Widget{MustNewWidget(wid, pid, "see", pr, true, false)},
			Input:    MustNewWidget(wid, pid, "see", pr, true, false),
			Expected: []*Widget{MustNewWidget(wid, pid, "see", pr, true, false)},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var ws *WidgetSystem
			if !tc.Nil {
				ws = NewWidgetSystem(tc.Widgets)
			}
			ws.Add(tc.Input)
			assert.Equal(tt, tc.Expected, ws.Widgets())
		})
	}
}

func TestWidgetSystem_Remove(t *testing.T) {
	wid := NewWidgetID()
	wid2 := NewWidgetID()
	pid := MustPluginID("xxx~1.1.1")
	pid2 := MustPluginID("xxx~1.1.2")
	pr := NewPropertyID()

	testCases := []struct {
		Name  string
		Input WidgetID
		Nil   bool
	}{
		{
			Name:  "remove a widget",
			Input: wid,
		},
		{
			Name:  "remove from nil widgetSystem",
			Input: wid,
			Nil:   true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var ws *WidgetSystem
			if !tc.Nil {
				ws = NewWidgetSystem([]*Widget{
					MustNewWidget(wid, pid2, "e1", pr, true, false),
					MustNewWidget(wid2, pid, "e1", pr, true, false),
				})
				assert.True(tt, ws.Has(tc.Input))
			}
			ws.Remove(tc.Input)
			assert.False(tt, ws.Has(tc.Input))
		})
	}
}

func TestWidgetSystem_RemoveAllByPlugin(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pid2 := MustPluginID("xxx~1.1.2")
	w1 := MustNewWidget(NewWidgetID(), pid, "e1", NewPropertyID(), true, false)
	w2 := MustNewWidget(NewWidgetID(), pid, "e2", NewPropertyID(), true, false)
	w3 := MustNewWidget(NewWidgetID(), pid2, "e1", NewPropertyID(), true, false)

	testCases := []struct {
		Name           string
		PID            PluginID
		WS, Expected   *WidgetSystem
		ExpectedResult []PropertyID
	}{
		{
			Name:           "remove widgets",
			PID:            pid,
			WS:             NewWidgetSystem([]*Widget{w1, w2, w3}),
			Expected:       NewWidgetSystem([]*Widget{w3}),
			ExpectedResult: []PropertyID{w1.Property(), w2.Property()},
		},
		{
			Name:           "remove from nil widgetSystem",
			WS:             nil,
			Expected:       nil,
			ExpectedResult: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.ExpectedResult, tc.WS.RemoveAllByPlugin(tc.PID))
			assert.Equal(tt, tc.Expected, tc.WS)
		})
	}
}

func TestWidgetSystem_RemoveAllByExtension(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pid2 := MustPluginID("xxx~1.1.2")
	w1 := MustNewWidget(NewWidgetID(), pid, "e1", NewPropertyID(), true, false)
	w2 := MustNewWidget(NewWidgetID(), pid, "e2", NewPropertyID(), true, false)
	w3 := MustNewWidget(NewWidgetID(), pid, "e1", NewPropertyID(), true, false)
	w4 := MustNewWidget(NewWidgetID(), pid2, "e1", NewPropertyID(), true, false)

	testCases := []struct {
		Name           string
		PID            PluginID
		EID            PluginExtensionID
		WS, Expected   *WidgetSystem
		ExpectedResult []PropertyID
	}{
		{
			Name:           "remove widgets",
			PID:            pid,
			EID:            PluginExtensionID("e1"),
			WS:             NewWidgetSystem([]*Widget{w1, w2, w3, w4}),
			Expected:       NewWidgetSystem([]*Widget{w2, w4}),
			ExpectedResult: []PropertyID{w1.Property(), w3.Property()},
		},
		{
			Name:           "remove widgets from nil widget system",
			PID:            pid,
			EID:            PluginExtensionID("e1"),
			WS:             nil,
			Expected:       nil,
			ExpectedResult: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.ExpectedResult, tc.WS.RemoveAllByExtension(tc.PID, tc.EID))
			assert.Equal(tt, tc.Expected, tc.WS)
		})
	}
}

func TestWidgetSystem_ReplacePlugin(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pid2 := MustPluginID("zzz~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()
	testCases := []struct {
		Name         string
		PID, NewID   PluginID
		WS, Expected *WidgetSystem
	}{
		{
			Name:     "replace a widget",
			PID:      pid,
			NewID:    pid2,
			WS:       NewWidgetSystem([]*Widget{MustNewWidget(wid, pid, "eee", pr, true, false)}),
			Expected: NewWidgetSystem([]*Widget{MustNewWidget(wid, pid2, "eee", pr, true, false)}),
		},
		{
			Name:     "replace with nil widget",
			PID:      pid,
			WS:       NewWidgetSystem(nil),
			Expected: NewWidgetSystem(nil),
		},
		{
			Name:     "replace from nil widgetSystem",
			WS:       nil,
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			tc.WS.ReplacePlugin(tc.PID, tc.NewID)
			assert.Equal(tt, tc.Expected, tc.WS)
		})
	}
}

func TestWidgetSystem_Properties(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	pr2 := NewPropertyID()
	wid := NewWidgetID()
	wid2 := NewWidgetID()
	testCases := []struct {
		Name     string
		WS       *WidgetSystem
		Expected []PropertyID
	}{
		{
			Name: "get properties",
			WS: NewWidgetSystem([]*Widget{
				MustNewWidget(wid, pid, "eee", pr, true, false),
				MustNewWidget(wid2, pid, "eee", pr2, true, false),
			}),
			Expected: []PropertyID{pr, pr2},
		},
		{
			Name:     "get properties from nil widgetSystem",
			WS:       nil,
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.WS.Properties()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestWidgetSystem_Widgets(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	pr2 := NewPropertyID()
	wid := NewWidgetID()
	wid2 := NewWidgetID()
	testCases := []struct {
		Name     string
		WS       *WidgetSystem
		Expected []*Widget
	}{
		{
			Name: "get widgets",
			WS: NewWidgetSystem([]*Widget{
				MustNewWidget(wid, pid, "eee", pr, true, false),
				MustNewWidget(wid2, pid, "eee", pr2, true, false),
			}),
			Expected: []*Widget{
				MustNewWidget(wid, pid, "eee", pr, true, false),
				MustNewWidget(wid2, pid, "eee", pr2, true, false),
			},
		},
		{
			Name:     "get widgets from nil widgetSystem",
			WS:       nil,
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.WS.Widgets()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestWidgetSystem_Widget(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()
	testCases := []struct {
		Name     string
		ID       WidgetID
		WS       *WidgetSystem
		Expected *Widget
	}{
		{
			Name:     "get a widget",
			ID:       wid,
			WS:       NewWidgetSystem([]*Widget{MustNewWidget(wid, pid, "eee", pr, true, false)}),
			Expected: MustNewWidget(wid, pid, "eee", pr, true, false),
		},
		{
			Name:     "dont has the widget",
			ID:       wid,
			WS:       NewWidgetSystem([]*Widget{}),
			Expected: nil,
		},
		{
			Name:     "get widget from nil widgetSystem",
			ID:       wid,
			WS:       nil,
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.WS.Widget(tc.ID)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestWidgetSystem_Has(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()
	testCases := []struct {
		Name     string
		ID       WidgetID
		WS       *WidgetSystem
		Expected bool
	}{
		{
			Name:     "has a widget",
			ID:       wid,
			WS:       NewWidgetSystem([]*Widget{MustNewWidget(wid, pid, "eee", pr, true, false)}),
			Expected: true,
		},
		{
			Name:     "dont has a widget",
			ID:       wid,
			WS:       NewWidgetSystem([]*Widget{}),
			Expected: false,
		},
		{
			Name:     "has from nil widgetSystem",
			ID:       wid,
			WS:       nil,
			Expected: false,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.WS.Has(tc.ID)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
