package builder

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetNLSLayerJSON_DataSourceName(t *testing.T) {
	ctx := context.Background()

	t.Run("with DataSourceName", func(t *testing.T) {
		dataSourceName := "test-data-source"
		layer := nlslayer.NewNLSLayerSimple().
			NewID().
			Title("Test Layer").
			LayerType(nlslayer.Simple).
			DataSourceName(&dataSourceName).
			MustBuild()

		b := &Builder{
			nlsloader: nlslayer.LoaderFrom(nil),
			ploader:   property.LoaderFrom(nil),
		}

		result, err := b.getNLSLayerJSON(ctx, layer)
		require.NoError(t, err)
		require.NotNil(t, result)

		// Verify DataSourceName is populated
		assert.NotNil(t, result.DataSourceName)
		assert.Equal(t, dataSourceName, *result.DataSourceName)

		// Verify it's included in JSON output
		jsonBytes, err := json.Marshal(result)
		require.NoError(t, err)
		assert.Contains(t, string(jsonBytes), `"dataSourceName":"test-data-source"`)
	})

	t.Run("without DataSourceName", func(t *testing.T) {
		layer := nlslayer.NewNLSLayerSimple().
			NewID().
			Title("Test Layer").
			LayerType(nlslayer.Simple).
			MustBuild()

		b := &Builder{
			nlsloader: nlslayer.LoaderFrom(nil),
			ploader:   property.LoaderFrom(nil),
		}

		result, err := b.getNLSLayerJSON(ctx, layer)
		require.NoError(t, err)
		require.NotNil(t, result)

		// Verify DataSourceName is nil
		assert.Nil(t, result.DataSourceName)

		// Verify it's omitted from JSON output (omitempty)
		jsonBytes, err := json.Marshal(result)
		require.NoError(t, err)
		assert.NotContains(t, string(jsonBytes), "dataSourceName")
	})
}
