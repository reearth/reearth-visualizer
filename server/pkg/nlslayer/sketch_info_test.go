package nlslayer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewSketchInfon(t *testing.T) {
	fid := NewFeatureID()
	f, err := NewFeature(
		fid,
		"Feature",
		NewPoint("Point", []float64{1, 2}),
		map[string]any{"key1": "value1"},
	)
	fc := NewFeatureCollection("FeatureCollection", []Feature{*f})

	schema := map[string]any{"key1": "value1"}
	si := NewSketchInfo(
		&schema,
		fc,
	)

	assert.NoError(t, err)
	assert.Equal(t, &schema, si.CustomPropertySchema())
	assert.Equal(t, fc, si.FeatureCollection())
}

func TestSketchInfoClone(t *testing.T) {
	fid := NewFeatureID()
	f, err := NewFeature(
		fid,
		"Feature",
		NewPoint("Point", []float64{1, 2}),
		map[string]any{"key1": "value1"},
	)
	if err != nil {
		t.Fatal(err)
	}
	fc := NewFeatureCollection("FeatureCollection", []Feature{*f})

	schema := map[string]any{"key1": "value1"}
	si := NewSketchInfo(
		&schema,
		fc,
	)

	si2 := si.Clone()

	assert.Equal(t, si, si2)
}
