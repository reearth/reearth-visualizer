package dataset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValueInterface(t *testing.T) {
	assert.Equal(
		t,
		map[string]interface{}{
			"lat": 1.2,
			"lng": 1.3,
		},
		ValueTypeLatLng.ValueFrom(LatLng{
			Lat: 1.2,
			Lng: 1.3,
		}).Interface(),
	)

	assert.Equal(
		t,
		map[string]interface{}{
			"lat":    1.2,
			"lng":    1.3,
			"height": 1.4,
		},
		ValueTypeLatLngHeight.ValueFrom(LatLngHeight{
			Lat:    1.2,
			Lng:    1.3,
			Height: 1.4,
		}).Interface(),
	)
}

func TestValueFromInterface(t *testing.T) {
	assert.Equal(
		t,
		LatLng{
			Lat: 1.2,
			Lng: 1.3,
		},
		ValueTypeLatLng.ValueFrom(map[string]interface{}{
			"lat": 1.2,
			"lng": 1.3,
		}).Value(),
	)

	assert.Equal(
		t,
		LatLngHeight{
			Lat:    1.2,
			Lng:    1.3,
			Height: 1.4,
		},
		ValueTypeLatLngHeight.ValueFrom(map[string]interface{}{
			"lat":    1.2,
			"lng":    1.3,
			"height": 1.4,
		}).Value(),
	)
}
