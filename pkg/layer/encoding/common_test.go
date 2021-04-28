package encoding

import (
	"image/color"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetColor(t *testing.T) {
	c, err := getColor("#ffffff")
	assert.NoError(t, err)
	assert.Equal(t, &color.RGBA{R: 255, G: 255, B: 255, A: 255}, c)

	c, err = getColor("#fff")
	assert.NoError(t, err)
	assert.Equal(t, &color.RGBA{R: 255, G: 255, B: 255, A: 255}, c)

	c, err = getColor("#fffa")
	assert.NoError(t, err)
	assert.Equal(t, &color.RGBA{R: 255, G: 255, B: 255, A: 170}, c)

	c, err = getColor("#ff0000aa")
	assert.NoError(t, err)
	assert.Equal(t, &color.RGBA{R: 255, G: 0, B: 0, A: 170}, c)
}
