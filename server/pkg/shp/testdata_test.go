package shp

import "testing"

type testFunc func(*testing.T, [][]float64, []Shape)

var testData = []struct {
	name    string
	points  [][]float64
	tester  testFunc
	shpType ShapeType
	count   int
}{
	{
		name:    "test_files/point",
		shpType: POINT,
		points: [][]float64{
			{10, 10},
			{5, 5},
			{0, 10},
		},
		tester: testPoint,
		count:  3,
	},
	{
		name:    "test_files/polyline",
		shpType: POLYLINE,
		points: [][]float64{
			{0, 0},
			{5, 5},
			{10, 10},
			{15, 15},
			{20, 20},
			{25, 25},
		},
		tester: testPolyLine,
		count:  2,
	},
	{
		name:    "test_files/polygon",
		shpType: POLYGON,
		points: [][]float64{
			{0, 0},
			{0, 5},
			{5, 5},
			{5, 0},
			{0, 0},
		},
		tester: testPolygon,
		count:  1,
	},
	{
		name:    "test_files/multipoint",
		shpType: MULTIPOINT,
		points: [][]float64{
			{10, 10},
			{5, 5},
			{0, 10},
		},
		tester: testMultiPoint,
		count:  1,
	},
	{
		name:    "test_files/pointz",
		shpType: POINTZ,
		points: [][]float64{
			{10, 10, 100},
			{5, 5, 50},
			{0, 10, 75},
		},
		tester: testPointZ,
		count:  3,
	},
	{
		name:    "test_files/polylinez",
		shpType: POLYLINEZ,
		points: [][]float64{
			{0, 0, 0},
			{5, 5, 5},
			{10, 10, 10},
			{15, 15, 15},
			{20, 20, 20},
			{25, 25, 25},
		},
		tester: testPolyLineZ,
		count:  2,
	},
	{
		name:    "test_files/polygonz",
		shpType: POLYGONZ,
		points: [][]float64{
			{0, 0, 0},
			{0, 5, 5},
			{5, 5, 10},
			{5, 0, 15},
			{0, 0, 0},
		},
		tester: testPolygonZ,
		count:  1,
	},
	{
		name:    "test_files/multipointz",
		shpType: MULTIPOINTZ,
		points: [][]float64{
			{10, 10, 100},
			{5, 5, 50},
			{0, 10, 75},
		},
		tester: testMultiPointZ,
		count:  1,
	},
	{
		name:    "test_files/pointm",
		shpType: POINTM,
		points: [][]float64{
			{10, 10, 100},
			{5, 5, 50},
			{0, 10, 75},
		},
		tester: testPointM,
		count:  3,
	},
	{
		name:    "test_files/polylinem",
		shpType: POLYLINEM,
		points: [][]float64{
			{0, 0, 0},
			{5, 5, 5},
			{10, 10, 10},
			{15, 15, 15},
			{20, 20, 20},
			{25, 25, 25},
		},
		tester: testPolyLineM,
		count:  2,
	},
	{
		name:    "test_files/polygonm",
		shpType: POLYGONM,
		points: [][]float64{
			{0, 0, 0},
			{0, 5, 5},
			{5, 5, 10},
			{5, 0, 15},
			{0, 0, 0},
		},
		tester: testPolygonM,
		count:  1,
	},
	{
		name:    "test_files/multipointm",
		shpType: MULTIPOINTM,
		points: [][]float64{
			{10, 10, 100},
			{5, 5, 50},
			{0, 10, 75},
		},
		tester: testMultiPointM,
		count:  1,
	},
	{
		name:    "test_files/multipatch",
		shpType: MULTIPATCH,
		points: [][]float64{
			{0, 0, 0},
			{10, 0, 0},
			{10, 10, 0},
			{0, 10, 0},
			{0, 0, 0},
			{0, 10, 0},
			{0, 10, 10},
			{0, 0, 10},
			{0, 0, 0},
			{0, 10, 0},
			{10, 0, 0},
			{10, 0, 10},
			{10, 10, 10},
			{10, 10, 0},
			{10, 0, 0},
			{0, 0, 0},
			{0, 0, 10},
			{10, 0, 10},
			{10, 0, 0},
			{0, 0, 0},
			{10, 10, 0},
			{10, 10, 10},
			{0, 10, 10},
			{0, 10, 0},
			{10, 10, 0},
			{0, 0, 10},
			{0, 10, 10},
			{10, 10, 10},
			{10, 0, 10},
			{0, 0, 10},
		},
		tester: testMultiPatch,
		count:  1,
	},
}
