package image

import (
	"bytes"
	"errors"
	"image"
	"image/draw"
	"image/png"
	"io"

	// Import image decoders
	_ "image/gif"
	_ "image/jpeg"

	xdraw "golang.org/x/image/draw"
)

const (
	IconSize      = 64
	MaxUploadSize = 10 * 1024 * 1024 // 10MB limit for icon uploads
)

var (
	ErrInvalidImage     = errors.New("invalid image format")
	ErrImageTooLarge    = errors.New("image file too large")
	ErrProcessingFailed = errors.New("image processing failed")
)

// ProcessIconImage takes an image reader and returns a 64x64 PNG image.
// It center-crops non-square images and resizes to IconSize.
func ProcessIconImage(r io.Reader, size int64) ([]byte, error) {
	if size > MaxUploadSize {
		return nil, ErrImageTooLarge
	}

	// Decode the source image
	src, _, err := image.Decode(r)
	if err != nil {
		return nil, ErrInvalidImage
	}

	// Get dimensions and center-crop to square
	bounds := src.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	var cropped image.Image
	if width != height {
		// Center-crop to square
		cropped = centerCrop(src, width, height)
	} else {
		cropped = src
	}

	// Resize to 64x64 using CatmullRom (high quality) interpolation
	resized := resize(cropped, IconSize, IconSize)

	// Encode to PNG
	var buf bytes.Buffer
	if err := png.Encode(&buf, resized); err != nil {
		return nil, ErrProcessingFailed
	}

	return buf.Bytes(), nil
}

// centerCrop crops the image to a square from the center.
func centerCrop(src image.Image, width, height int) image.Image {
	minDim := width
	if height < width {
		minDim = height
	}

	// Calculate crop rectangle centered on the image
	bounds := src.Bounds()
	x0 := bounds.Min.X + (width-minDim)/2
	y0 := bounds.Min.Y + (height-minDim)/2
	cropRect := image.Rect(x0, y0, x0+minDim, y0+minDim)

	// Create a new image with the cropped region
	dst := image.NewRGBA(image.Rect(0, 0, minDim, minDim))
	draw.Draw(dst, dst.Bounds(), src, cropRect.Min, draw.Src)

	return dst
}

// resize scales the image to the specified dimensions using high-quality interpolation.
func resize(src image.Image, width, height int) image.Image {
	dst := image.NewRGBA(image.Rect(0, 0, width, height))
	xdraw.CatmullRom.Scale(dst, dst.Bounds(), src, src.Bounds(), xdraw.Over, nil)
	return dst
}
