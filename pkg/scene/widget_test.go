package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewWidget(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()
	testCases := []struct {
		Name      string
		ID        WidgetID
		Plugin    PluginID
		Extension PluginExtensionID
		Property  PropertyID
		Enabled   bool
		Extended  bool
		Err       error
	}{
		{
			Name:      "success new widget",
			ID:        wid,
			Plugin:    pid,
			Extension: "eee",
			Property:  pr,
			Enabled:   true,
			Extended:  true,
			Err:       nil,
		},
		{
			Name:      "fail empty extension",
			ID:        wid,
			Plugin:    pid,
			Extension: "",
			Property:  pr,
			Enabled:   true,
			Extended:  false,
			Err:       ErrInvalidID,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled, tc.Extended)
			if tc.Err == nil {
				assert.Equal(tt, tc.ID, res.ID())
				assert.Equal(tt, tc.Property, res.Property())
				assert.Equal(tt, tc.Extension, res.Extension())
				assert.Equal(tt, tc.Enabled, res.Enabled())
				assert.Equal(tt, tc.Extended, res.Extended())
				assert.Equal(tt, tc.Plugin, res.Plugin())
			} else {
				assert.ErrorIs(tt, err, tc.Err)
			}
		})
	}
}

func TestMustNewWidget(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()
	testCases := []struct {
		Name      string
		ID        WidgetID
		Plugin    PluginID
		Extension PluginExtensionID
		Property  PropertyID
		Enabled   bool
		Extended  bool
		Err       error
	}{
		{
			Name:      "success new widget",
			ID:        wid,
			Plugin:    pid,
			Extension: "eee",
			Property:  pr,
			Enabled:   true,
			Extended:  true,
			Err:       nil,
		},
		{
			Name:      "fail empty extension",
			ID:        wid,
			Plugin:    pid,
			Extension: "",
			Property:  pr,
			Enabled:   true,
			Extended:  false,
			Err:       ErrInvalidID,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			if tc.Err != nil {
				assert.PanicsWithError(tt, tc.Err.Error(), func() {
					MustNewWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled, tc.Extended)
				})
				return
			}

			res := MustNewWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled, tc.Extended)
			assert.Equal(tt, tc.ID, res.ID())
			assert.Equal(tt, tc.Property, res.Property())
			assert.Equal(tt, tc.Extension, res.Extension())
			assert.Equal(tt, tc.Enabled, res.Enabled())
			assert.Equal(tt, tc.Plugin, res.Plugin())
		})
	}
}

func TestWidget_SetEnabled(t *testing.T) {
	res := MustNewWidget(NewWidgetID(), MustPluginID("xxx~1.1.1"), "eee", NewPropertyID(), false, false)
	res.SetEnabled(true)
	assert.True(t, res.Enabled())
}

func TestWidget_SetExtended(t *testing.T) {
	res := MustNewWidget(NewWidgetID(), MustPluginID("xxx~1.1.1"), "eee", NewPropertyID(), false, false)
	res.SetExtended(true)
	assert.True(t, res.Extended())
}
