package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewWidget(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()

	tests := []struct {
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled, tc.Extended)
			if tc.Err == nil {
				assert.Equal(t, tc.ID, res.ID())
				assert.Equal(t, tc.Property, res.Property())
				assert.Equal(t, tc.Extension, res.Extension())
				assert.Equal(t, tc.Enabled, res.Enabled())
				assert.Equal(t, tc.Extended, res.Extended())
				assert.Equal(t, tc.Plugin, res.Plugin())
			} else {
				assert.ErrorIs(t, err, tc.Err)
			}
		})
	}
}

func TestMustNewWidget(t *testing.T) {
	pid := MustPluginID("xxx~1.1.1")
	pr := NewPropertyID()
	wid := NewWidgetID()

	tests := []struct {
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			if tc.Err != nil {
				assert.PanicsWithError(t, tc.Err.Error(), func() {
					MustWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled, tc.Extended)
				})
				return
			}

			res := MustWidget(tc.ID, tc.Plugin, tc.Extension, tc.Property, tc.Enabled, tc.Extended)
			assert.Equal(t, tc.ID, res.ID())
			assert.Equal(t, tc.Property, res.Property())
			assert.Equal(t, tc.Extension, res.Extension())
			assert.Equal(t, tc.Enabled, res.Enabled())
			assert.Equal(t, tc.Plugin, res.Plugin())
		})
	}
}

func TestWidget_SetEnabled(t *testing.T) {
	res := MustWidget(NewWidgetID(), MustPluginID("xxx~1.1.1"), "eee", NewPropertyID(), false, false)
	res.SetEnabled(true)
	assert.True(t, res.Enabled())
}

func TestWidget_SetExtended(t *testing.T) {
	res := MustWidget(NewWidgetID(), MustPluginID("xxx~1.1.1"), "eee", NewPropertyID(), false, false)
	res.SetExtended(true)
	assert.True(t, res.Extended())
}

func TestWidget_Clone(t *testing.T) {
	res := MustWidget(NewWidgetID(), MustPluginID("xxx~1.1.1"), "eee", NewPropertyID(), false, false)
	res2 := res.Clone()
	assert.Equal(t, res, res2)
	assert.NotSame(t, res, res2)
	assert.Nil(t, (*Widget)(nil).Clone())
}
