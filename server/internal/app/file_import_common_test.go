package app

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
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

func getAssetIDValue(t *testing.T, data *[]byte, index int) string {
	t.Helper()
	var d map[string]any
	require.NoError(t, json.Unmarshal(*data, &d))
	raw := d["scene"].(map[string]any)["property"].(map[string]any)["tiles"].([]any)
	tile := raw[index].(map[string]any)
	return tile["cesium_ion_asset_id"].(map[string]any)["value"].(string)
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

		assert.Equal(t, "cesium_ion", getTileTypeValue(t, data, 0))
		assert.Equal(t, "2", getAssetIDValue(t, data, 0))

		assert.Equal(t, "cesium_ion", getTileTypeValue(t, data, 1))
		assert.Equal(t, "3", getAssetIDValue(t, data, 1))

		assert.Equal(t, "cesium_ion", getTileTypeValue(t, data, 2))
		assert.Equal(t, "4", getAssetIDValue(t, data, 2))

		assert.Equal(t, "cesium_ion", getTileTypeValue(t, data, 3))
		assert.Equal(t, "3812", getAssetIDValue(t, data, 3))
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

// TestImportProject_RecoversFromPanic is a regression test for REL-07: the
// zip contents ImportProject parses are caller-controlled and some of the
// usecases it calls (e.g. plugin/schema parsing) don't fully validate their
// input, so a malformed import zip can panic partway through. Neither
// Pub/Sub handler that calls ImportProject has its own recover, so without
// one here the panic would skip every UpdateImportStatus call, leaving the
// project stuck at its prior status after its only upload is deleted.
func TestImportProject_RecoversFromPanic(t *testing.T) {
	prj, err := project.New().NewID().Build()
	require.NoError(t, err)

	done := make(chan struct{})
	var gotStatus project.ProjectImportStatus
	var gotMessage string
	fake := &fakeProjectUsecase{
		importProjectData: func(ctx context.Context, wsID string, sceneID *string, data *[]byte, op *usecase.Operator) (*project.Project, error) {
			panic("simulated parse panic on malformed import data")
		},
		updateImportStatus: func(ctx context.Context, pid id.ProjectID, status project.ProjectImportStatus, msg *map[string]any, op *usecase.Operator) (*project.ProjectMetadata, error) {
			gotStatus = status
			gotMessage, _ = (*msg)["message"].(string)
			close(done)
			return nil, nil
		},
	}

	usecases := &interfaces.Container{Project: fake}
	data := []byte(`{"project": {}}`)

	var ok bool
	func() {
		defer func() {
			if r := recover(); r != nil {
				t.Fatalf("ImportProject should recover its own panic, not let it propagate: %v", r)
			}
		}()
		ok = ImportProject(context.Background(), usecases, nil, accountsID.WorkspaceID{}, prj.ID(), &data, nil, nil, map[string]any{}, nil)
	}()

	assert.False(t, ok, "ImportProject should report failure when it recovers a panic")

	select {
	case <-done:
	default:
		t.Fatal("UpdateImportStatus was never called")
	}
	assert.Equal(t, project.ProjectImportStatusFailed, gotStatus)
	assert.True(t, strings.Contains(gotMessage, "panic during import"), "message = %q, want it to mention the panic", gotMessage)
}
