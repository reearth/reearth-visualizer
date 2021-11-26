package encoding

import (
	"image/color"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetColor(t *testing.T) {
	assert.Equal(t, &color.RGBA{R: 255, G: 255, B: 255, A: 255}, getColor("#ffffff"))
	assert.Equal(t, &color.RGBA{R: 255, G: 255, B: 255, A: 255}, getColor("#fff"))
	assert.Equal(t, &color.RGBA{R: 255, G: 255, B: 255, A: 170}, getColor("#fffa"))
	assert.Equal(t, &color.RGBA{R: 255, G: 0, B: 0, A: 170}, getColor("#ff0000aa"))
}
