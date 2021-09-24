package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestWidgetArea(t *testing.T) {
	wid1 := id.NewWidgetID()
	wid2 := id.NewWidgetID()

	testCases := []struct {
		Name     string
		Input1   []id.WidgetID
		Input2   WidgetAlignType
		Expected *WidgetArea
	}{
		{
			Name:     "New widget area with proper widget ids and widget align type",
			Input1:   []id.WidgetID{wid1, wid2},
			Input2:   WidgetAlignEnd,
			Expected: &WidgetArea{widgetIds: []id.WidgetID{wid1, wid2}, align: WidgetAlignEnd},
		},
		{
			Name:     "New widget area with duplicated widget ids",
			Input1:   []id.WidgetID{wid1, wid1},
			Input2:   WidgetAlignEnd,
			Expected: &WidgetArea{widgetIds: []id.WidgetID{wid1}, align: WidgetAlignEnd},
		},
		{
			Name:     "New widget area with wrong widget align type",
			Input1:   []id.WidgetID{wid1, wid2},
			Input2:   "wrong",
			Expected: &WidgetArea{widgetIds: []id.WidgetID{wid1, wid2}, align: WidgetAlignStart},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			wa := NewWidgetArea(tc.Input1, tc.Input2)
			assert.Equal(t, tc.Expected, wa)
		})
	}
}

func TestWidgetArea_WidgetIDs(t *testing.T) {
	wid := id.NewWidgetID()
	wa := NewWidgetArea([]id.WidgetID{wid}, WidgetAlignStart)
	assert.Equal(t, wa.widgetIds, wa.WidgetIDs())
	assert.Nil(t, (*WidgetArea)(nil).WidgetIDs())
}

func TestWidgetArea_Alignment(t *testing.T) {
	wa := NewWidgetArea(nil, WidgetAlignEnd)
	assert.Equal(t, WidgetAlignEnd, wa.Alignment())
	assert.Equal(t, WidgetAlignType(""), (*WidgetArea)(nil).Alignment())
}

func TestWidgetArea_Find(t *testing.T) {
	wid := id.NewWidgetID()
	wid2 := id.NewWidgetID()

	testCases := []struct {
		Name     string
		Input    id.WidgetID
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

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea([]id.WidgetID{wid}, WidgetAlignStart)
			}
			assert.Equal(tt, tc.Expected, wa.Find(tc.Input))
		})
	}
}

func TestWidgetArea_Add(t *testing.T) {
	wid1 := id.NewWidgetID()
	wid2 := id.NewWidgetID()
	wid3 := id.NewWidgetID()

	testCases := []struct {
		Name     string
		Nil      bool
		Input    id.WidgetID
		Input2   int
		Expected []id.WidgetID
	}{
		{
			Name:     "add a widget id",
			Input:    wid3,
			Input2:   -1,
			Expected: []id.WidgetID{wid1, wid2, wid3},
		},
		{
			Name:     "add a widget id but already exists",
			Input:    wid1,
			Input2:   -1,
			Expected: []id.WidgetID{wid1, wid2},
		},
		{
			Name:     "insert a widget id",
			Input:    wid3,
			Input2:   1,
			Expected: []id.WidgetID{wid1, wid3, wid2},
		},
		{
			Name: "nil widget area",
			Nil:  true,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			if tc.Nil {
				(*WidgetArea)(nil).Add(wid1, -1)
				return
			}

			wa := NewWidgetArea([]id.WidgetID{wid1, wid2}, WidgetAlignStart)
			wa.Add(tc.Input, tc.Input2)
			assert.Equal(tt, tc.Expected, wa.WidgetIDs())
		})
	}
}

func TestWidgetArea_AddAll(t *testing.T) {
	wid1 := id.NewWidgetID()
	wid2 := id.NewWidgetID()

	testCases := []struct {
		Name     string
		Nil      bool
		Input    []id.WidgetID
		Expected []id.WidgetID
	}{
		{
			Name:     "add widget ids",
			Input:    []id.WidgetID{wid1, wid2},
			Expected: []id.WidgetID{wid1, wid2},
		},
		{
			Name:     "add widget ids but duplicated",
			Input:    []id.WidgetID{wid1, wid1, wid2},
			Expected: []id.WidgetID{wid1, wid2},
		},
		{
			Name: "nil widget area",
			Nil:  true,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			if tc.Nil {
				(*WidgetArea)(nil).AddAll(nil)
				return
			}

			wa := NewWidgetArea(nil, WidgetAlignStart)
			wa.AddAll(tc.Input)
			assert.Equal(tt, tc.Expected, wa.WidgetIDs())
		})
	}
}

func TestWidgetArea_SetAlignment(t *testing.T) {
	testCases := []struct {
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

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea(nil, WidgetAlignStart)
			}
			wa.SetAlignment(tc.Input)
			if !tc.Nil {
				assert.Equal(t, tc.Expected, wa.align)
			}
		})
	}
}

func TestWidgetArea_Remove(t *testing.T) {
	wid := id.NewWidgetID()
	testCases := []struct {
		Name     string
		Input    id.WidgetID
		Expected []id.WidgetID
		Nil      bool
	}{
		{
			Name:     "Remove a widget from widget area",
			Input:    wid,
			Expected: []id.WidgetID{},
		},
		{
			Name:     "Remove a widget from widget area that doesn't exist",
			Input:    id.NewWidgetID(),
			Expected: []id.WidgetID{wid},
		},
		{
			Name:  "Return nil if no widget area",
			Input: wid,
			Nil:   true,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea([]id.WidgetID{wid}, "")
			}
			wa.Remove(tc.Input)
			if !tc.Nil {
				assert.Equal(tt, tc.Expected, wa.widgetIds)
			}
		})
	}
}

func TestWidgetArea_Move(t *testing.T) {
	wid := id.NewWidgetID()
	wid2 := id.NewWidgetID()
	wid3 := id.NewWidgetID()

	testCases := []struct {
		Name           string
		Input1, Input2 int
		Expected       []id.WidgetID
		Nil            bool
	}{
		{
			Name:     "Move widget Id",
			Input1:   1,
			Input2:   2,
			Expected: []id.WidgetID{wid, wid3, wid2},
		},
		{
			Name:     "Move widget Id",
			Input1:   2,
			Input2:   0,
			Expected: []id.WidgetID{wid3, wid, wid2},
		},
		{
			Name: "Nil",
			Nil:  true,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			var wa *WidgetArea
			if !tc.Nil {
				wa = NewWidgetArea([]id.WidgetID{wid, wid2, wid3}, "")
			}
			wa.Move(tc.Input1, tc.Input2)
			if !tc.Nil {
				assert.Equal(tt, tc.Expected, wa.widgetIds)
			}
		})
	}
}
