package nlslayer

import (
	"github.com/pkg/errors"
)

type LayerType string

const (
	Simple = "simple"
	Group  = "group"
)

func NewLayerType(value string) (LayerType, error) {
	switch value {
	case Simple, Group:
		return LayerType(value), nil
	default:
		return "", errors.New("value must be 'simple' or 'b'")
	}
}

func (d *LayerType) IsValidLayerType() bool {
	switch *d {
	case Simple, Group:
		return true
	default:
		return false
	}
}
