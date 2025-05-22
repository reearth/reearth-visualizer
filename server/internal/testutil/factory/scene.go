package factory

import (
	"github.com/reearth/reearth/server/pkg/scene"
)

type SceneOption func(*scene.Builder)

func NewScene(opts ...SceneOption) *scene.Scene {
	p := scene.New().
		NewID()
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
