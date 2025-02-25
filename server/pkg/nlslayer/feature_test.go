package nlslayer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewFeatureWithNewId(t *testing.T) {
	featureType := "Feature"
	point := NewPoint("Point", []float64{1, 2})
	properties := map[string]any{"key1": "value1"}
	f, err := NewFeatureWithNewId(
		featureType,
		point,
	)
	f.UpdateProperties(&properties)

	assert.NoError(t, err)
	assert.Equal(t, featureType, f.FeatureType())
	assert.Equal(t, point, f.Geometry())
	assert.Equal(t, properties, *f.Properties())
}

func TestNewFeature(t *testing.T) {
	id := NewFeatureID()
	featureType := "Feature"
	point := NewPoint("Point", []float64{1, 2})
	properties := map[string]any{"key1": "value1"}
	f, err := NewFeature(
		id,
		featureType,
		point,
	)
	f.UpdateProperties(&properties)

	assert.NoError(t, err)
	assert.Equal(t, id, f.ID())
	assert.Equal(t, featureType, f.FeatureType())
	assert.Equal(t, point, f.Geometry())
	assert.Equal(t, properties, *f.Properties())
}
