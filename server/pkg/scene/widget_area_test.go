package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWidgetArea(t *testing.T) {
	wid1 := NewWidgetID()
	wid2 := NewWidgetID()

	tests := []struct {
		Name     string
		Input1   WidgetIDList
		Input2   WidgetAlignType
		Input3   *WidgetAreaProperties
		Expected *WidgetArea
	}{
		{
			Name:     "New widget area with proper widget ids and widget align type",
			Input1:   WidgetIDList{wid1, wid2},
			Input2:   WidgetAlignEnd,
			Expected: &WidgetArea{widgetIds: WidgetIDList{wid1, wid2}, align: WidgetAlignEnd},
		},
		{
			Name:     "New widget area with duplicated widget ids",
			Input1:   WidgetIDList{wid1},
			Input2:   WidgetAlignEnd,
			Expected: &WidgetArea{widgetIds: WidgetIDList{wid1}, align: WidgetAlignEnd},
		},
		{
			Name:   "New widget area with properties",
			Input1: WidgetIDList{wid1},
			Input2: WidgetAlignEnd,
			Input3: &WidgetAreaProperties{
				padding: WidgetAreaPadding{
					top:    10,
					bottom: 15,
					left:   5,
					right:  5,
				},
				gap:        40,
				centered:   true,
				background: "#ffffff",
			},
			Expected: &WidgetArea{widgetIds: WidgetIDList{wid1}, align: WidgetAlignEnd, properties: &WidgetAreaProperties{
				padding: WidgetAreaPadding{
					top:    10,
					bottom: 15,
					left:   5,
					right:  5,
				},
				gap:        40,
				centered:   true,
				background: "#ffffff",
			}},
		},
		{
			Name:     "New widget area with wrong widget align type",
			Input1:   WidgetIDList{wid1, wid2},
			Input2:   "wrong",
			Expected: &WidgetArea{widgetIds: WidgetIDList{wid1, wid2}, align: WidgetAlignStart},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			wa := NewWidgetArea(tc.Input1, tc.Input2, tc.Input3)
			assert.Equal(t, tc.Expected, wa)
		})
	}
}

func TestWidgetArea_WidgetIDs(t *testing.T) {
	wid := NewWidgetID()
	wa := NewWidgetArea(WidgetIDList{wid}, WidgetAlignStart, nil)
	assert.Equal(t, wa.widgetIds, wa.WidgetIDs())
	assert.Nil(t, (*WidgetArea)(nil).WidgetIDs())
}

func TestWidgetArea_Alignment(t *testing.T) {
	wa := NewWidgetArea(nil, WidgetAlignEnd, nil)
	assert.Equal(t, WidgetAlignEnd, wa.Alignment())
	assert.Equal(t, WidgetAlignType(""), (*WidgetArea)(nil).Alignment())
}

func TestWidgetArea_Find(t *testing.T) {
	wid := NewWidgetID()
	wid2 := NewWidgetID()

	tests := []struct {
		Name     string
		Input    WidgetID
		Expected int
		Nil      bool
	}{
		{
			Name:     "Return index if contains widget id",
			Input:    wid,
			Expected: 0,
		},
		{
			Name:     "Return -1 if doesn't contain widget id",
			Input:    wid2,
			Expected: -1,
		},
		{
			Name:     "Return nil if WidgetArea is nil",
			Nil:      true,
			Expected: -1,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea(WidgetIDList{wid}, WidgetAlignStart, nil)
			}
			assert.Equal(t, tc.Expected, wa.Find(tc.Input))
		})
	}
}

func TestWidgetArea_Add(t *testing.T) {
	wid1 := NewWidgetID()
	wid2 := NewWidgetID()
	wid3 := NewWidgetID()

	tests := []struct {
		Name     string
		Nil      bool
		Input    WidgetID
		Input2   int
		Expected WidgetIDList
	}{
		{
			Name:     "add a widget id",
			Input:    wid3,
			Input2:   -1,
			Expected: WidgetIDList{wid1, wid2, wid3},
		},
		{
			Name:     "add a widget id but already exists",
			Input:    wid1,
			Input2:   -1,
			Expected: WidgetIDList{wid1, wid2},
		},
		{
			Name:     "insert a widget id",
			Input:    wid3,
			Input2:   1,
			Expected: WidgetIDList{wid1, wid3, wid2},
		},
		{
			Name: "nil widget area",
			Nil:  true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			if tc.Nil {
				(*WidgetArea)(nil).Add(wid1, -1)
				return
			}

			wa := NewWidgetArea(WidgetIDList{wid1, wid2}, WidgetAlignStart, nil)
			wa.Add(tc.Input, tc.Input2)
			assert.Equal(t, tc.Expected, wa.WidgetIDs())
		})
	}
}

func TestWidgetArea_AddAll(t *testing.T) {
	wid1 := NewWidgetID()
	wid2 := NewWidgetID()

	tests := []struct {
		Name     string
		Nil      bool
		Input    WidgetIDList
		Expected WidgetIDList
	}{
		{
			Name:     "add widget ids",
			Input:    WidgetIDList{wid1, wid2},
			Expected: WidgetIDList{wid1, wid2},
		},
		{
			Name:     "add widget ids but duplicated",
			Input:    WidgetIDList{wid1, wid1, wid2},
			Expected: WidgetIDList{wid1, wid2},
		},
		{
			Name: "nil widget area",
			Nil:  true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			if tc.Nil {
				(*WidgetArea)(nil).AddAll(nil)
				return
			}

			wa := NewWidgetArea(nil, WidgetAlignStart, nil)
			wa.AddAll(tc.Input)
			assert.Equal(t, tc.Expected, wa.WidgetIDs())
		})
	}
}

func TestWidgetArea_SetAlignment(t *testing.T) {
	tests := []struct {
		Name     string
		Nil      bool
		Input    WidgetAlignType
		Expected WidgetAlignType
	}{
		{
			Name:     "set alignment",
			Input:    WidgetAlignEnd,
			Expected: WidgetAlignEnd,
		},
		{
			Name:     "set alignment with wrong alignment",
			Input:    "wrong",
			Expected: WidgetAlignStart,
		},
		{
			Name:  "set alignment when widget area is nil",
			Nil:   true,
			Input: WidgetAlignStart,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea(nil, WidgetAlignStart, nil)
			}
			wa.SetAlignment(tc.Input)
			if !tc.Nil {
				assert.Equal(t, tc.Expected, wa.align)
			}
		})
	}
}

func TestWidgetArea_Remove(t *testing.T) {
	wid := NewWidgetID()

	tests := []struct {
		Name     string
		Input    WidgetID
		Expected WidgetIDList
		Nil      bool
	}{
		{
			Name:     "Remove a widget from widget area",
			Input:    wid,
			Expected: WidgetIDList{},
		},
		{
			Name:     "Remove a widget from widget area that doesn't exist",
			Input:    NewWidgetID(),
			Expected: WidgetIDList{wid},
		},
		{
			Name:  "Return nil if no widget area",
			Input: wid,
			Nil:   true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea(WidgetIDList{wid}, "", nil)
			}
			wa.Remove(tc.Input)
			if !tc.Nil {
				assert.Equal(t, tc.Expected, wa.widgetIds)
			}
		})
	}
}

func TestWidgetArea_Move(t *testing.T) {
	wid := NewWidgetID()
	wid2 := NewWidgetID()
	wid3 := NewWidgetID()

	tests := []struct {
		Name           string
		Input1, Input2 int
		Expected       WidgetIDList
		Nil            bool
	}{
		{
			Name:     "Move widget Id",
			Input1:   1,
			Input2:   2,
			Expected: WidgetIDList{wid, wid3, wid2},
		},
		{
			Name:     "Move widget Id",
			Input1:   2,
			Input2:   0,
			Expected: WidgetIDList{wid3, wid, wid2},
		},
		{
			Name: "Nil",
			Nil:  true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea(WidgetIDList{wid, wid2, wid3}, "", nil)
			}
			wa.Move(tc.Input1, tc.Input2)
			if !tc.Nil {
				assert.Equal(t, tc.Expected, wa.widgetIds)
			}
		})
	}
}
