package shp

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func assertPointsEqual(t *testing.T, a, b []float64, msgAndArgs ...interface{}) bool {
	if !assert.True(t, len(a) == len(b), msgAndArgs...) {
		return false
	}

	for k, v := range a {
		if !assert.True(t, v == b[k], msgAndArgs...) {
			return false
		}
	}
	return true
}

func getShapesFromFile(prefix string, t *testing.T) (shapes []Shape) {
	filename := prefix + ".shp"
	ior, _ := os.Open(filename)
	file, err := ReadFrom(ior)
	assert.Nil(t, err, "Failed to open shapefile")

	defer func() {
		err := ior.Close()
		assert.Nil(t, err, "Failed to close shapefile")
	}()

	for file.Next() {
		_, shape := file.Shape()
		shapes = append(shapes, shape)
	}
	assert.Nil(t, file.Err(), "Error while getting shapes")

	return shapes
}

func testPoint(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*Point)
		assert.True(t, ok, "Failed to type assert.")
		assertPointsEqual(t, []float64{p.X, p.Y}, points[n], "Points did not match.")
	}
}

func testPolyLine(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*PolyLine)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y}, "Points did not match.")
		}
	}
}

func testPolygon(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*Polygon)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y}, "Points did not match.")
		}
	}
}

func testMultiPoint(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*MultiPoint)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y}, "Points did not match.")
		}
	}
}

func testPointZ(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*PointZ)
		assert.True(t, ok, "Failed to type assert.")
		assertPointsEqual(t, []float64{p.X, p.Y, p.Z}, points[n], "Points did not match.")
	}
}

func testPolyLineZ(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*PolyLineZ)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y, p.ZArray[k]}, "Points did not match.")
		}
	}
}

func testPolygonZ(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*PolygonZ)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y, p.ZArray[k]}, "Points did not match.")
		}
	}
}

func testMultiPointZ(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*MultiPointZ)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y, p.ZArray[k]}, "Points did not match.")
		}
	}
}

func testPointM(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*PointM)
		assert.True(t, ok, "Failed to type assert.")
		assertPointsEqual(t, []float64{p.X, p.Y, p.M}, points[n], "Points did not match.")
	}
}

func testPolyLineM(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*PolyLineM)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y, p.MArray[k]}, "Points did not match.")
		}
	}
}

func testPolygonM(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*PolygonM)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y, p.MArray[k]}, "Points did not match.")
		}
	}
}

func testMultiPointM(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*MultiPointM)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y, p.MArray[k]}, "Points did not match.")
		}
	}
}

func testMultiPatch(t *testing.T, points [][]float64, shapes []Shape) {
	for n, s := range shapes {
		p, ok := s.(*MultiPatch)
		assert.True(t, ok, "Failed to type assert.")
		for k, point := range p.Points {
			assertPointsEqual(t, points[n*3+k], []float64{point.X, point.Y, p.ZArray[k]}, "Points did not match.")
		}
	}
}

func TestReadBBox(t *testing.T) {
	tests := []struct {
		filename string
		want     Box
	}{
		{"test_files/multipatch.shp", Box{0, 0, 10, 10}},
		{"test_files/multipoint.shp", Box{0, 5, 10, 10}},
		{"test_files/multipointm.shp", Box{0, 5, 10, 10}},
		{"test_files/multipointz.shp", Box{0, 5, 10, 10}},
		{"test_files/point.shp", Box{0, 5, 10, 10}},
		{"test_files/pointm.shp", Box{0, 5, 10, 10}},
		{"test_files/pointz.shp", Box{0, 5, 10, 10}},
		{"test_files/polygon.shp", Box{0, 0, 5, 5}},
		{"test_files/polygonm.shp", Box{0, 0, 5, 5}},
		{"test_files/polygonz.shp", Box{0, 0, 5, 5}},
		{"test_files/polyline.shp", Box{0, 0, 25, 25}},
		{"test_files/polylinem.shp", Box{0, 0, 25, 25}},
		{"test_files/polylinez.shp", Box{0, 0, 25, 25}},
	}

	for _, tt := range tests {
		f, _ := os.Open(tt.filename)
		r, err := ReadFrom(f)
		if err != nil {
			t.Fatalf("%v", err)
		}
		if got := r.BBox().MinX; got != tt.want.MinX {
			t.Errorf("got MinX = %v, want %v", got, tt.want.MinX)
		}
		if got := r.BBox().MinY; got != tt.want.MinY {
			t.Errorf("got MinY = %v, want %v", got, tt.want.MinY)
		}
		if got := r.BBox().MaxX; got != tt.want.MaxX {
			t.Errorf("got MaxX = %v, want %v", got, tt.want.MaxX)
		}
		if got := r.BBox().MaxY; got != tt.want.MaxY {
			t.Errorf("got MaxY = %v, want %v", got, tt.want.MaxY)
		}
	}
}

func TestReader(t *testing.T) {
	tests := testData

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			shapes := getShapesFromFile(tc.name, t)
			assert.Equal(t, tc.count, len(shapes), "Number of shapes for %s read was wrong. Wanted %d, got %d.", tc.name, tc.count, len(shapes))
			tc.tester(t, tc.points, shapes)
		})
	}

}
