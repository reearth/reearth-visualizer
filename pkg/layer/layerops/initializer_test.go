package layerops

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/plugin"
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
	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			layerItem, property, err := LayerItem{
				SceneID:       *tc.sceneID,
				ParentLayerID: *tc.parentLayerID,
				Plugin:        tc.plugin,
				ExtensionID:   tc.extID,
				Name:          tc.name,
			}.Initialize()
			if tc.err == nil {
				assert.NoError(tt, err)
				assert.NotNil(tt, layerItem)
				assert.NotNil(tt, property)
			} else {
				assert.True(t, errors.As(err, &tc.err))
			}
		})
	}
}
