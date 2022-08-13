package shp

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

var filenamePrefix = "test_files/write_"

func removeShapefile(t *testing.T, filename string) {
	_ = os.Remove(filename + ".shp")
	// _ = os.Remove(filename + ".shx")
	// _ = os.Remove(filename + ".dbf")
}

func pointsToFloats(points []Point) [][]float64 {
	floats := make([][]float64, len(points))
	for k, v := range points {
		floats[k] = make([]float64, 2)
		floats[k][0] = v.X
		floats[k][1] = v.Y
	}
	return floats
}

func TestWriter_Write_Point(t *testing.T) {
	filename := filenamePrefix + "point"
	defer removeShapefile(t, filename)

	points := [][]float64{
		{0.0, 0.0},
		{5.0, 5.0},
		{10.0, 10.0},
	}

	f, err := os.Create(filename + ".shp")
	assert.Nil(t, err, "Error open file")

	shape, err := CreateFrom(f, POINT)
	assert.Nil(t, err, "Error shp create")

	for _, p := range points {
		_, err = shape.Write(&Point{p[0], p[1]})
		assert.Nil(t, err, "Error writing shape")
	}

	err = shape.Close()
	assert.Nil(t, err)

	err = f.Close()
	assert.Nil(t, err)

	shapes := getShapesFromFile(filename, t)

	assert.Equal(t, len(points), len(shapes), "Number of shapes read was wrong")
	testPoint(t, points, shapes)
}

func TestWriter_Write_PolyLine(t *testing.T) {
	filename := filenamePrefix + "polyline"
	defer removeShapefile(t, filename)

	points := [][]Point{
		{Point{0.0, 0.0}, Point{5.0, 5.0}},
		{Point{10.0, 10.0}, Point{15.0, 15.0}},
	}

	f, _ := os.Create(filename + ".shp")
	shape, err := CreateFrom(f, POLYLINE)
	assert.Nil(t, err, "Error shp create")

	polyLine := NewPolyLine(points)

	_, err = shape.Write(polyLine)
	assert.Nil(t, err)

	err = shape.Close()
	assert.Nil(t, err)

	err = f.Close()
	assert.Nil(t, err)

	shapes := getShapesFromFile(filename, t)

	assert.Equal(t, 1, len(shapes), "Number of shapes read was wrong")
	testPolyLine(t, pointsToFloats(flatten(points)), shapes)
}

func TestWriter_Close(t *testing.T) {
	filename := filenamePrefix + "point"
	defer removeShapefile(t, filename)

	points := [][]float64{
		{0.0, 0.0},
		{5.0, 5.0},
		{10.0, 10.0},
	}

	f, err := os.Create(filename + ".shp")
	assert.Nil(t, err, "Error open file")

	shape, err := CreateFrom(f, POINT)
	assert.Nil(t, err, "Error shp create")

	for _, p := range points {
		_, err = shape.Write(&Point{p[0], p[1]})
		assert.Nil(t, err, "Error writing shape")
	}

	err = f.Close()
	assert.Nil(t, err)

	err = shape.Close()
	assert.NotNil(t, err)
}

func TestWriter(t *testing.T) {
	tests := testData

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			shapes := getShapesFromFile(tc.name, t)
			assert.Equal(t, tc.count, len(shapes), "Number of shapes for %s read was wrong. Wanted %d, got %d.", tc.name, tc.count, len(shapes))

			for i, shp := range shapes {
				outputPath := tc.name + "_out_" + fmt.Sprint(i)
				f, _ := os.Create(outputPath + ".shp")
				shape, _ := CreateFrom(f, tc.shpType)

				_, err := shape.Write(shp)
				assert.Nil(t, err)

				err = shape.Close()
				assert.Nil(t, err)

				err = f.Close()
				assert.Nil(t, err)

				shpFromOut := getShapesFromFile(outputPath, t)
				assert.Equal(t, shpFromOut[0], shp)

				removeShapefile(t, outputPath)
			}
			tc.tester(t, tc.points, shapes)
		})
	}

}
