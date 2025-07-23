package gqlmodel

import (
	"time"

	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/util"
)

func FromPublishmentStatus(v PublishmentStatus) scene.PublishmentStatus {
	switch v {
	case PublishmentStatusPublic:
		return scene.PublishmentStatusPublic
	case PublishmentStatusLimited:
		return scene.PublishmentStatusLimited
	case PublishmentStatusPrivate:
		return scene.PublishmentStatusPrivate
	}
	return scene.PublishmentStatus("")
}

func ToPublishmentStatus(v scene.PublishmentStatus) PublishmentStatus {
	switch v {
	case scene.PublishmentStatusPublic:
		return PublishmentStatusPublic
	case scene.PublishmentStatusLimited:
		return PublishmentStatusLimited
	case scene.PublishmentStatusPrivate:
		return PublishmentStatusPrivate
	}
	return PublishmentStatus("")
}

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

func ToScene(scene *scene.Scene) *Scene {
	if scene == nil {
		return nil
	}

	var publishedAtRes *time.Time
	if publishedAt := scene.PublishedAt(); !publishedAt.IsZero() {
		publishedAtRes = &publishedAt
	}

	return &Scene{
		ID:                IDFrom(scene.ID()),
		ProjectID:         IDFrom(scene.Project()),
		PropertyID:        IDFrom(scene.Property()),
		TeamID:            IDFrom(scene.Workspace()),
		CreatedAt:         scene.CreatedAt(),
		UpdatedAt:         scene.UpdatedAt(),
		Plugins:           util.Map(scene.Plugins().Plugins(), ToScenePlugin),
		Widgets:           util.Map(scene.Widgets().Widgets(), ToSceneWidget),
		WidgetAlignSystem: ToWidgetAlignSystem(scene.Widgets().Alignment()),

		// publishment ---------------------
		Alias:             scene.Alias(),
		PublishmentStatus: ToPublishmentStatus(scene.PublishmentStatus()),
		PublishedAt:       publishedAtRes,
		PublicTitle:       scene.PublicTitle(),
		PublicDescription: scene.PublicDescription(),
		PublicImage:       scene.PublicImage(),
		PublicNoIndex:     scene.PublicNoIndex(),
		IsBasicAuthActive: scene.IsBasicAuthActive(),
		BasicAuthUsername: scene.BasicAuthUsername(),
		BasicAuthPassword: scene.BasicAuthPassword(),
		EnableGa:          scene.EnableGA(),
		TrackingID:        scene.TrackingID(),
	}
}

func ToStyle(v *scene.Style) *Style {
	return &Style{
		ID:    IDFrom(v.ID()),
		Name:  v.Name(),
		Value: JSON(*v.Value()),

		SceneID: IDFrom(v.Scene()),
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
