package app

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func tileField(v string) map[string]any {
	return map[string]any{"type": "string", "value": v}
}

func buildImportData(t *testing.T, tiles []map[string]any) *[]byte {
	t.Helper()
	d := map[string]any{
		"scene": map[string]any{
			"property": map[string]any{
				"tiles": tiles,
			},
		},
	}
	b, err := json.Marshal(d)
	require.NoError(t, err)
	return &b
}

func getTileTypeValue(t *testing.T, data *[]byte, index int) string {
	t.Helper()
	var d map[string]any
	require.NoError(t, json.Unmarshal(*data, &d))
	raw := d["scene"].(map[string]any)["property"].(map[string]any)["tiles"].([]any)
	tile := raw[index].(map[string]any)
	return tile["tile_type"].(map[string]any)["value"].(string)
}

func TestMigrateLegacyTileTypes(t *testing.T) {
	t.Run("legacy types are remapped", func(t *testing.T) {
		data := buildImportData(t, []map[string]any{
			{"tile_type": tileField("default")},
			{"tile_type": tileField("default_label")},
			{"tile_type": tileField("default_road")},
			{"tile_type": tileField("black_marble")},
		})

		require.NoError(t, migrateLegacyTileTypes(data))

		assert.Equal(t, "google_satellite", getTileTypeValue(t, data, 0))
		assert.Equal(t, "google_satellite", getTileTypeValue(t, data, 1))
		assert.Equal(t, "google_roadmap", getTileTypeValue(t, data, 2))
		assert.Equal(t, "nasa_black_marble", getTileTypeValue(t, data, 3))
	})

	t.Run("non-legacy types are left alone", func(t *testing.T) {
		data := buildImportData(t, []map[string]any{
			{"tile_type": tileField("open_street_map")},
			{"tile_type": tileField("url"), "tile_url": "https://example.com/{z}/{x}/{y}.png"},
			{"tile_type": tileField("google_satellite")},
		})

		require.NoError(t, migrateLegacyTileTypes(data))

		assert.Equal(t, "open_street_map", getTileTypeValue(t, data, 0))
		assert.Equal(t, "url", getTileTypeValue(t, data, 1))
		assert.Equal(t, "google_satellite", getTileTypeValue(t, data, 2))
	})

	t.Run("tile with no tile_type field is untouched", func(t *testing.T) {
		data := buildImportData(t, []map[string]any{
			{"tile_opacity": 1},
		})

		require.NoError(t, migrateLegacyTileTypes(data))

		var d map[string]any
		require.NoError(t, json.Unmarshal(*data, &d))
		raw := d["scene"].(map[string]any)["property"].(map[string]any)["tiles"].([]any)
		tile := raw[0].(map[string]any)
		_, hasType := tile["tile_type"]
		assert.False(t, hasType)
	})

	t.Run("no tiles in scene returns nil", func(t *testing.T) {
		d := map[string]any{
			"scene": map[string]any{
				"property": map[string]any{},
			},
		}
		b, err := json.Marshal(d)
		require.NoError(t, err)
		assert.NoError(t, migrateLegacyTileTypes(&b))
	})

	t.Run("malformed json returns error", func(t *testing.T) {
		b := []byte(`not valid json`)
		assert.Error(t, migrateLegacyTileTypes(&b))
	})
}
