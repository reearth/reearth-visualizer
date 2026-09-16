package builder

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetNLSLayerJSON_DataSourceName(t *testing.T) {
	ctx := context.Background()

	t.Run("with DataSourceName included", func(t *testing.T) {
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

		result, err := b.getNLSLayerJSON(ctx, layer, nil)
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

		result, err := b.getNLSLayerJSON(ctx, layer, nil)
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

// TestLoadNLSLayerProperties_ChunkFailureFallsBackPerID guards against a batching
// regression: when a chunk load fails, the still-missing IDs must be retried one
// at a time so a single unloadable property does not blank the other valid
// properties that shared its chunk.
func TestLoadNLSLayerProperties_ChunkFailureFallsBackPerID(t *testing.T) {
	ctx := context.Background()

	sid := id.NewSceneID()
	scid := id.MustPropertySchemaID("xx~1.0.0/aa")
	goodPID := id.NewPropertyID()
	badPID := id.NewPropertyID()
	goodProp := property.New().ID(goodPID).Scene(sid).Schema(scid).MustBuild()

	goodLayer := nlslayer.NewNLSLayerSimple().NewID().LayerType(nlslayer.Simple).
		Infobox(nlslayer.NewInfobox(nil, goodPID)).MustBuild()
	badLayer := nlslayer.NewNLSLayerSimple().NewID().LayerType(nlslayer.Simple).
		Infobox(nlslayer.NewInfobox(nil, badPID)).MustBuild()

	var g nlslayer.NLSLayer = goodLayer
	var b2 nlslayer.NLSLayer = badLayer
	list := nlslayer.NLSLayerList{&g, &b2}

	// Simulate an all-or-nothing loader: any batch containing badPID fails
	// wholesale, so only a per-ID retry can recover goodPID.
	ploader := func(_ context.Context, ids ...id.PropertyID) (property.List, error) {
		for _, i := range ids {
			if i == badPID {
				return nil, errors.New("boom")
			}
		}
		res := property.List{}
		for _, i := range ids {
			if i == goodPID {
				res = append(res, goodProp)
			}
		}
		return res, nil
	}

	b := &Builder{nlsLayer: &list, ploader: ploader}
	props := b.loadNLSLayerProperties(ctx)

	assert.Same(t, goodProp, props[goodPID], "valid property must survive a failed chunk")
	_, hasBad := props[badPID]
	assert.False(t, hasBad, "unloadable property is absent and renders empty")
}
