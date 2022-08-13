package shp

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func openFile(name string, t *testing.T) *os.File {
	f, err := os.Open(name)
	if err != nil {
		t.Fatalf("Failed to open %s: %v", name, err)
	}
	return f
}

func getShapesSequentially(prefix string, t *testing.T) (shapes []Shape) {
	shp := openFile(prefix+".shp", t)
	// dbf := openFile(prefix+".dbf", t)

	sr := SequentialReaderFromExt(shp /*, dbf*/)
	err := sr.Err()
	assert.Nil(t, err, "Error when iterating over the shapefile header")

	for sr.Next() {
		_, shape := sr.Shape()
		shapes = append(shapes, shape)
	}
	err = sr.Err()
	assert.Nil(t, err, "Error when iterating over the shapes")

	err = sr.Close()
	assert.Nil(t, err, "Could not close sequential reader")

	return shapes
}

func TestSequentialReader(t *testing.T) {
	tests := testData

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			shapes := getShapesSequentially(tc.name, t)
			assert.Equal(t, tc.count, len(shapes), "Number of shapes for %s read was wrong. Wanted %d, got %d.", tc.name, tc.count, len(shapes))
			tc.tester(t, tc.points, shapes)
		})
	}
}
