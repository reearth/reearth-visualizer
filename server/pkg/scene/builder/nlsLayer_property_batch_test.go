package builder

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// countingPropertyLoader wraps a loader and records how many times it was called and with how
// many IDs, so a test can assert on query count rather than only on output.
func countingPropertyLoader(inner property.Loader) (property.Loader, *int, *int) {
	calls, ids := 0, 0
	return func(ctx context.Context, i ...id.PropertyID) (property.List, error) {
		calls++
		ids += len(i)
		return inner(ctx, i...)
	}, &calls, &ids
}

// buildLayersWithProperties makes n layers, each with an infobox holding blocksPerLayer blocks
// plus a photo overlay, and returns the layers alongside every property they reference.
func buildLayersWithProperties(t *testing.T, n, blocksPerLayer int) (nlslayer.NLSLayerList, []*property.Property) {
	t.Helper()

	sceneID := id.NewSceneID()
	schemaID := id.MustPropertySchemaID("xx~1.0.0/aa")

	var layers nlslayer.NLSLayerList
	var props []*property.Property

	newProp := func() id.PropertyID {
		p := property.New().NewID().Scene(sceneID).Schema(schemaID).MustBuild()
		props = append(props, p)
		return p.ID()
	}

	for range n {
		blocks := make([]*nlslayer.InfoboxBlock, 0, blocksPerLayer)
		for range blocksPerLayer {
			blocks = append(blocks, nlslayer.NewInfoboxBlock().
				NewID().
				Property(newProp()).
				Plugin(id.OfficialPluginID).
				Extension(id.PluginExtensionID("textblock")).
				MustBuild())
		}

		layer := nlslayer.NewNLSLayerSimple().
			NewID().
			Scene(sceneID).
			Title("layer").
			LayerType(nlslayer.Simple).
			Infobox(nlslayer.NewInfobox(blocks, newProp())).
			PhotoOverlay(nlslayer.NewPhotoOverlay(newProp())).
			MustBuild()

		var l nlslayer.NLSLayer = layer
		layers = append(layers, &l)
	}

	return layers, props
}

// Before batching, each layer loaded its own properties one ID at a time, costing roughly
// L*(2+B) loads. The whole set now goes out in chunked batches instead, so the number of loads
// tracks the number of chunks rather than the number of layers.
func TestNLSLayersJSON_BatchesPropertyLoads(t *testing.T) {
	ctx := context.Background()

	const layerCount = 40
	const blocksPerLayer = 3
	// infobox + photo overlay + one per block
	const propertiesPerLayer = 2 + blocksPerLayer

	layers, props := buildLayersWithProperties(t, layerCount, blocksPerLayer)
	loader, calls, loadedIDs := countingPropertyLoader(property.LoaderFrom(props))

	b := &Builder{
		nlsloader: nlslayer.LoaderFrom(nil),
		ploader:   loader,
		nlsLayer:  &layers,
	}

	res, err := b.nlsLayersJSON(ctx)
	require.NoError(t, err)
	require.Len(t, res, layerCount)

	total := layerCount * propertiesPerLayer
	assert.Equal(t, total, *loadedIDs, "every property should still be requested exactly once")

	// total is below propertyLoadChunkSize here, so it all fits in a single load.
	assert.Equal(t, 1, *calls,
		"property loads should be batched, not issued per layer (unbatched would be %d)", total)
}

// A scene large enough to exceed the chunk size must still be split, so we never build one
// unbounded query, and must not lose or duplicate any ID in the process.
func TestNLSLayersJSON_ChunksLargePropertySets(t *testing.T) {
	ctx := context.Background()

	// 2 properties per layer (infobox + photo overlay), chosen to span several chunks.
	layerCount := propertyLoadChunkSize + 10
	layers, props := buildLayersWithProperties(t, layerCount, 0)
	loader, calls, loadedIDs := countingPropertyLoader(property.LoaderFrom(props))

	b := &Builder{
		nlsloader: nlslayer.LoaderFrom(nil),
		ploader:   loader,
		nlsLayer:  &layers,
	}

	res, err := b.nlsLayersJSON(ctx)
	require.NoError(t, err)
	require.Len(t, res, layerCount)

	total := layerCount * 2
	expectedCalls := (total + propertyLoadChunkSize - 1) / propertyLoadChunkSize

	assert.Equal(t, total, *loadedIDs, "chunking must not drop or repeat IDs")
	assert.Equal(t, expectedCalls, *calls)
	assert.Less(t, *calls, layerCount, "still far fewer loads than one per layer")
}

// Properties shared between layers should only be fetched once.
func TestLoadNLSLayerProperties_DeduplicatesIDs(t *testing.T) {
	ctx := context.Background()

	sceneID := id.NewSceneID()
	shared := property.New().NewID().Scene(sceneID).
		Schema(id.MustPropertySchemaID("xx~1.0.0/aa")).MustBuild()

	var layers nlslayer.NLSLayerList
	for range 5 {
		layer := nlslayer.NewNLSLayerSimple().
			NewID().
			Scene(sceneID).
			LayerType(nlslayer.Simple).
			// Every layer points at the same property.
			PhotoOverlay(nlslayer.NewPhotoOverlay(shared.ID())).
			MustBuild()
		var l nlslayer.NLSLayer = layer
		layers = append(layers, &l)
	}

	loader, calls, loadedIDs := countingPropertyLoader(
		property.LoaderFrom([]*property.Property{shared}))

	b := &Builder{
		nlsloader: nlslayer.LoaderFrom(nil),
		ploader:   loader,
		nlsLayer:  &layers,
	}

	got := b.loadNLSLayerProperties(ctx)

	assert.Equal(t, 1, *calls)
	assert.Equal(t, 1, *loadedIDs, "a shared property should be requested once, not once per layer")
	assert.Len(t, got, 1)
	assert.Contains(t, got, shared.ID())
}

// A failing load must not fail the whole scene build, matching the previous per-layer behaviour
// where loader errors were discarded.
func TestNLSLayersJSON_TolerantOfPropertyLoadFailure(t *testing.T) {
	ctx := context.Background()

	layers, _ := buildLayersWithProperties(t, 3, 1)

	b := &Builder{
		nlsloader: nlslayer.LoaderFrom(nil),
		ploader: func(context.Context, ...id.PropertyID) (property.List, error) {
			return nil, assert.AnError
		},
		nlsLayer: &layers,
	}

	res, err := b.nlsLayersJSON(ctx)
	require.NoError(t, err, "a property load failure should not fail the scene build")
	assert.Len(t, res, 3, "layers should still be emitted without their properties")
}

func TestLoadNLSLayerProperties_NoLayers(t *testing.T) {
	ctx := context.Background()

	empty := nlslayer.NLSLayerList{}
	loader, calls, _ := countingPropertyLoader(property.LoaderFrom(nil))
	b := &Builder{ploader: loader, nlsLayer: &empty}

	assert.Nil(t, b.loadNLSLayerProperties(ctx))
	assert.Equal(t, 0, *calls, "no layers means no property query at all")
}
