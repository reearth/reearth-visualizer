package encoding

import (
	"io"

	"github.com/reearth/reearth/server/pkg/layer/merging"
)

var encoders = map[string]func(w io.Writer) Encoder{
	"kml":     func(w io.Writer) Encoder { return NewKMLEncoder(w) },
	"geojson": func(w io.Writer) Encoder { return NewGeoJSONEncoder(w) },
	"czml":    func(w io.Writer) Encoder { return NewCZMLEncoder(w) },
	"shp":     func(w io.Writer) Encoder { return NewSHPEncoder(w) },
}

type Encoder interface {
	Encode(merging.SealedLayer) error
	MimeType() string
}

func EncoderFromExt(ext string, w io.Writer) Encoder {
	e := encoders[ext]
	if e == nil {
		return nil
	}
	return e(w)
}
