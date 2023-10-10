package sceneops

import (
	"github.com/reearth/reearth/server/pkg/scene"
)

type Style struct {
	SceneID scene.ID
	Value   *scene.StyleValue
	Name    string
}

func (i Style) Initialize() (*scene.Style, error) {
	builder := scene.NewStyle().
		NewID().
		Scene(i.SceneID).
		Name(i.Name).
		Value(i.Value)

	if i.Value != nil {
		builder.Value(i.Value)
	}

	Style, err := builder.Build()
	if err != nil {
		return nil, err
	}

	return Style, nil
}
