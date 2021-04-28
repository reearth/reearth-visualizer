package encoding

import (
	"github.com/reearth/reearth-backend/pkg/layer/merging"
)

type Encoder interface {
	Encode(merging.SealedLayer) error
}
