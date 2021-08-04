package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewWidget(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	wid := id.NewWidgetID()
	testCases := []struct {
		Name      string
		ID        id.WidgetID
		Plugin    id.PluginID
		Extension id.PluginExtensionID
		Property  id.PropertyID
		Enabled   bool
		Expected  struct {
			Id        id.WidgetID
			Plugin    id.PluginID
			Extension id.PluginExtensionID
			Property  id.PropertyID
			Enabled   bool
		}
		err error
	}{
		{
			Name:      "success new widget",
			ID:        wid,
			Plugin:    pid,
			Extension: "eee",
			Property:  pr,
			Enabled:   true,
			Expected: struct {
				Id        id.WidgetID
				Plugin    id.PluginID
				Extension id.PluginExtensionID
				Property  id.PropertyID
				Enabled   bool
			}{
				Id:        wid,
				Plugin:    pid,
				Extension: "eee",
				Property:  pr,
				Enabled:   true,
			},
			err: nil,
		},
		{
			Name:      "fail empty extension",
			ID:        wid,
			Plugin:    pid,
			Extension: "",
			Property:  pr,
			Enabled:   true,
			err:       id.ErrInvalidID,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled)
			if err == nil {
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.Property, res.Property())
				assert.Equal(tt, tc.Expected.Extension, res.Extension())
				assert.Equal(tt, tc.Expected.Enabled, res.Enabled())
				assert.Equal(tt, tc.Expected.Plugin, res.Plugin())
			} else {
				assert.ErrorIs(tt, err, tc.err)
			}
		})
	}
}
func TestMustNewWidget(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID()
	wid := id.NewWidgetID()
	testCases := []struct {
		Name      string
		ID        id.WidgetID
		Plugin    id.PluginID
		Extension id.PluginExtensionID
		Property  id.PropertyID
		Enabled   bool
		Expected  struct {
			Id        id.WidgetID
			Plugin    id.PluginID
			Extension id.PluginExtensionID
			Property  id.PropertyID
			Enabled   bool
		}
		err error
	}{
		{
			Name:      "success new widget",
			ID:        wid,
			Plugin:    pid,
			Extension: "eee",
			Property:  pr,
			Enabled:   true,
			Expected: struct {
				Id        id.WidgetID
				Plugin    id.PluginID
				Extension id.PluginExtensionID
				Property  id.PropertyID
				Enabled   bool
			}{
				Id:        wid,
				Plugin:    pid,
				Extension: "eee",
				Property:  pr,
				Enabled:   true,
			},
			err: nil,
		},
		{
			Name:      "fail empty extension",
			ID:        wid,
			Plugin:    pid,
			Extension: "",
			Property:  pr,
			Enabled:   true,
			err:       id.ErrInvalidID,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var res *Widget
			defer func() {
				if r := recover(); r == nil {
					assert.Equal(tt, tc.Expected.Id, res.ID())
					assert.Equal(tt, tc.Expected.Property, res.Property())
					assert.Equal(tt, tc.Expected.Extension, res.Extension())
					assert.Equal(tt, tc.Expected.Enabled, res.Enabled())
					assert.Equal(tt, tc.Expected.Plugin, res.Plugin())
				}
			}()
			res = MustNewWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled)
		})
	}
}

func TestWidget_SetEnabled(t *testing.T) {
	res := MustNewWidget(id.NewWidgetID(), id.MustPluginID("xxx~1.1.1"), "eee", id.NewPropertyID(), false)
	res.SetEnabled(true)
	assert.True(t, res.Enabled())
}
