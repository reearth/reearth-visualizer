package layerops

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/stretchr/testify/assert"
)

func TestInitialize(t *testing.T) {
	lid := layer.NewID()
	ps := plugin.MustPropertySchemaID("xxx~1.1.1/aa")
	eid := plugin.ExtensionID("foo")
	eid2 := plugin.ExtensionID("foo2")
	e := plugin.NewExtension().
		ID("foo").
		Description(i18n.StringFrom("foo/des")).
		Name(i18n.StringFrom("foo/name")).
		Schema(ps).
		Type(plugin.ExtensionTypePrimitive).
		MustBuild()
	e2 := plugin.NewExtension().
		ID("foo2").
		Type("not primitive").
		MustBuild()
	es := append(make([]*plugin.Extension, 0), e)
	es = append(es, e2)
	p := plugin.New().
		ID(layer.MustPluginID("xxx~1.1.1")).
		Schema(&ps).
		Extensions(es).
		MustBuild()
	s := layer.NewSceneID()

	tests := []struct {
		name          string
		sceneID       *layer.SceneID
		parentLayerID *layer.ID
		plugin        *plugin.Plugin
		extID         *layer.PluginExtensionID
		err           error
	}{
		{
			name:          "Success",
			sceneID:       &s,
			parentLayerID: &lid,
			plugin:        p,
			extID:         &eid,
			err:           nil,
		},
		{
			name:          "extension type error",
			sceneID:       &s,
			parentLayerID: &lid,
			plugin:        p,
			extID:         &eid2,
			err:           ErrExtensionTypeMustBePrimitive,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			layerItem, property, err := LayerItem{
				SceneID:       *tt.sceneID,
				ParentLayerID: *tt.parentLayerID,
				Plugin:        tt.plugin,
				ExtensionID:   tt.extID,
				Name:          tt.name,
			}.Initialize()
			if tt.err == nil {
				assert.NoError(t, err)
				assert.NotNil(t, layerItem)
				assert.NotNil(t, property)
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}
