package layer

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
	"github.com/stretchr/testify/assert"
)

var _ Layer = &Item{}

var tags2 = []id.TagID{id.NewTagID()}
var item = Item{
	layerBase: layerBase{
		id:        id.MustLayerID(id.New().String()),
		name:      "xxx",
		visible:   false,
		plugin:    id.MustPluginID("aaa~1.1.1").Ref(),
		extension: id.PluginExtensionID("foo").Ref(),
		property:  nil,
		infobox:   nil,
		tags:      tag.NewListFromTags(tags2),
		scene:     id.SceneID{},
	},
	linkedDataset: nil,
}

func TestItem_Tags(t *testing.T) {
	tt := id.NewTagID()
	err := item.AttachTag(tt)
	assert.NoError(t, err)
	tl := tags2
	tl = append(tl, tt)
	assert.Equal(t, tl, item.Tags().Tags())
	err = item.DetachTag(tt)
	assert.NoError(t, err)
	assert.Equal(t, tags2, item.Tags().Tags())
}
