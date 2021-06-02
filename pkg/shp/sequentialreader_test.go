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
	t.Parallel()
	testCases := testsData

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			shapes := getShapesSequentially(tc.name, tt)
			assert.Equal(tt, tc.count, len(shapes), "Number of shapes for %s read was wrong. Wanted %d, got %d.", tc.name, tc.count, len(shapes))
			tc.tester(tt, tc.points, shapes)
		})
	}
}
