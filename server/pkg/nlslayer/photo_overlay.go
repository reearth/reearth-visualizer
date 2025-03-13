package nlslayer

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type PhotoOverlay struct {
	id       id.PhotoOverlayID
	property id.PropertyID
}

func NewPhotoOverlay(p PropertyID) *PhotoOverlay {
	photooverlay := PhotoOverlay{
		id:       id.NewPhotoOverlayID(),
		property: p,
	}
	return &photooverlay
}

func (i *PhotoOverlay) Id() id.PhotoOverlayID {
	return i.id
}

func (i *PhotoOverlay) Property() PropertyID {
	return i.property
}

func (i *PhotoOverlay) PropertyRef() *PropertyID {
	if i == nil {
		return nil
	}
	pid := i.property
	return &pid
}
