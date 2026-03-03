package image

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestProcessIconImage(t *testing.T) {
	tests := []struct {
		name    string
		width   int
		height  int
		wantErr error
	}{
		{"square image", 100, 100, nil},
		{"landscape image", 200, 100, nil},
		{"portrait image", 100, 200, nil},
		{"small image", 32, 32, nil},
		{"large image", 1000, 1000, nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create test image
			img := createTestImage(tt.width, tt.height)
			var buf bytes.Buffer
			require.NoError(t, png.Encode(&buf, img))

			result, err := ProcessIconImage(&buf, int64(buf.Len()))

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}

			require.NoError(t, err)
			assert.NotEmpty(t, result)

			// Verify the result is a valid PNG
			resultImg, err := png.Decode(bytes.NewReader(result))
			require.NoError(t, err)

			// Verify dimensions are 64x64
			bounds := resultImg.Bounds()
			assert.Equal(t, IconSize, bounds.Dx())
			assert.Equal(t, IconSize, bounds.Dy())
		})
	}
}

func TestProcessIconImage_TooLarge(t *testing.T) {
	_, err := ProcessIconImage(bytes.NewReader([]byte{}), MaxUploadSize+1)
	assert.ErrorIs(t, err, ErrImageTooLarge)
}

func TestProcessIconImage_InvalidFormat(t *testing.T) {
	_, err := ProcessIconImage(bytes.NewReader([]byte("not an image")), 100)
	assert.ErrorIs(t, err, ErrInvalidImage)
}

func createTestImage(width, height int) image.Image {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{R: uint8(x % 256), G: uint8(y % 256), B: 128, A: 255})
		}
	}
	return img
}
