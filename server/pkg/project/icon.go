package project

import (
	"bytes"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"

	ico "github.com/biessek/golang-ico"
	"golang.org/x/image/draw"
)

const (
	iconDataMaxSize          = 1024 * 10        // 10KB
	srcIconDataMaxSize int64 = 1024 * 1024 * 10 // 10MB
	iconSize                 = 32
)

func GenerateIcon(r io.Reader) ([]byte, error) {
	m, _, err := image.Decode(io.LimitReader(r, srcIconDataMaxSize))
	if err != nil {
		return nil, err
	}

	resultImg := m
	bounds := m.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	if w > iconSize || h > iconSize {
		nw, nh := iconSize, iconSize
		if w > h {
			nh = int(float64(h) * float64(iconSize) / float64(w))
		} else if w < h {
			nw = int(float64(w) * float64(iconSize) / float64(h))
		}
		imgDst := image.NewRGBA(image.Rect(0, 0, nw, nh))
		draw.BiLinear.Scale(imgDst, imgDst.Bounds(), m, bounds, draw.Over, nil)
		imgDst2 := image.NewRGBA(image.Rect(0, 0, iconSize, iconSize))
		draw.Copy(imgDst2, image.Point{X: (iconSize - nw) / 2, Y: (iconSize - nh) / 2}, imgDst, imgDst.Bounds(), draw.Over, nil)
		resultImg = imgDst2
	}

	b := new(bytes.Buffer)
	if err := ico.Encode(b, resultImg); err != nil {
		return nil, err
	}

	return b.Bytes(), nil
}
