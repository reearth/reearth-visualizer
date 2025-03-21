package storytelling

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestPageBuilder(t *testing.T) {

	b := NewPage()
	assert.Equal(t, &PageBuilder{page: &Page{}}, b)

	assert.PanicsWithError(t, id.ErrInvalidID.Error(), func() {
		b.MustBuild()
	})

	b = b.NewID()
	assert.False(t, b.page.id.IsEmpty())

	pageID := id.NewPageID()
	b = b.ID(pageID)
	assert.Equal(t, pageID, b.page.id)

	propertyID := id.NewPropertyID()
	b = b.Property(propertyID)
	assert.Equal(t, propertyID, b.page.property)

	b = b.Title("test")
	assert.Equal(t, "test", b.page.title)

	b = b.Swipeable(true)
	assert.Equal(t, true, b.page.swipeable)

	layerID := id.NewNLSLayerID()
	b = b.Layers(id.NLSLayerIDList{layerID})
	assert.Equal(t, id.NLSLayerIDList{layerID}, b.page.layers)

	b = b.SwipeableLayers(id.NLSLayerIDList{layerID})
	assert.Equal(t, id.NLSLayerIDList{layerID}, b.page.swipeableLayers)

	block := &Block{}
	b = b.Blocks(BlockList{block})
	assert.Equal(t, BlockList{block}, b.page.blocks)

	p, err := b.Build()
	assert.NoError(t, err)
	assert.Equal(t, &Page{
		id:              pageID,
		property:        propertyID,
		title:           "test",
		swipeable:       true,
		layers:          id.NLSLayerIDList{layerID},
		swipeableLayers: id.NLSLayerIDList{layerID},
		blocks:          BlockList{block},
	}, p)

	assert.NotPanics(t, func() {
		b.MustBuild()
	})
}
