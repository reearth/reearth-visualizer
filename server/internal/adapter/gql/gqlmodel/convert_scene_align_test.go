package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestFromSceneWidgetAreaPadding(t *testing.T) {
	got := FromSceneWidgetAreaPadding(&WidgetAreaPaddingInput{
		Top:    2,
		Bottom: 2,
		Left:   2,
		Right:  2,
	})
	want := scene.NewWidgetAreaPadding(2, 2, 2, 2)
	assert.Equal(t, want, got)
	var want2 *scene.WidgetAreaPadding
	assert.Equal(t, want2, FromSceneWidgetAreaPadding(nil))
}
