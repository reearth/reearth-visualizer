package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/util"
)

func ToSceneWidget(w *scene.Widget) *SceneWidget {
	if w == nil {
		return nil
	}

	return &SceneWidget{
		ID:          IDFrom(w.ID()),
		PluginID:    IDFromPluginID(w.Plugin()),
		ExtensionID: ID(w.Extension()),
		PropertyID:  IDFrom(w.Property()),
		Enabled:     w.Enabled(),
		Extended:    w.Extended(),
	}
}

func ToScenePlugin(sp *scene.Plugin) *ScenePlugin {
	if sp == nil {
		return nil
	}

	return &ScenePlugin{
		PluginID:   IDFromPluginID(sp.Plugin()),
		PropertyID: IDFromRef(sp.Property()),
	}
}

func ToCluster(c *scene.Cluster) *Cluster {
	return &Cluster{
		ID:         IDFrom(c.ID()),
		Name:       c.Name(),
		PropertyID: IDFrom(c.Property()),
	}
}

func ToScene(scene *scene.Scene) *Scene {
	if scene == nil {
		return nil
	}

	return &Scene{
		ID:         IDFrom(scene.ID()),
		ProjectID:  IDFrom(scene.Project()),
		PropertyID: IDFrom(scene.Property()),
		TeamID:     IDFrom(scene.Workspace()),
		CreatedAt:  scene.CreatedAt(),
		UpdatedAt:  scene.UpdatedAt(),
		Plugins:    util.Map(scene.Plugins().Plugins(), ToScenePlugin),
		Widgets:    util.Map(scene.Widgets().Widgets(), ToSceneWidget),
	}
}

func ToStyle(v *scene.Style) *Style {
	return &Style{
		ID:    IDFrom(v.ID()),
		Name:  v.Name(),
		Value: JSON(*v.Value()),
	}
}

func ToStyleValue(p JSON) *scene.StyleValue {
	if p == nil {
		return nil
	}
	sv := make(scene.StyleValue)

	for key, value := range p {
		sv[key] = value
	}

	return &sv
}

func ToStyles(styles scene.StyleList) []*Style {
	return util.Map(styles, func(s *scene.Style) *Style {
		return ToStyle(s)
	})
}
