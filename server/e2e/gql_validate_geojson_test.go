package e2e

import (
	"testing"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestValidateGeoJsonOfAssets ./e2e/...

func TestValidateGeoJsonOfAssets(t *testing.T) {
	e := Server(t, baseSeeder)

	teamId := wID.String()
	pId := createProject(e, "test")
	_, _, sId := createScene(e, pId)

	tests := []struct {
		name     string
		data     []byte
		hasError bool
	}{
		{
			name: "Valid Feature",
			data: []byte(`
				{
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [100.0, 0.0]
					},
					"properties": {}
				}
			`),
			hasError: false,
		},
		{
			name: "Valid FeatureCollection",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [100.0, 0.0]
							},
							"properties": {}
						}
					]
				}
			`),
			hasError: false,
		},
		{
			name: "Invalid Point coordinates",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [100.0]
							},
							"properties": {}
						}
					]
				}
			`),
			hasError: true,
		},
		{
			name: "Invalid BBox",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"bbox": [100.0, 0.0, 101.0, 1.0],
					"features": [
						{
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [100.0, 0.0]
							},
							"properties": {}
						}
					]
				}
			`),
			hasError: false,
		},
		{
			name: "Missing Geometry",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"properties": {}
						}
					]
				}
			`),
			hasError: true,
		},
		{
			name: "Invalid MultiPoint coordinates",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {
								"type": "MultiPoint",
								"coordinates": [[100.0, 0.0], [200.0]]
							},
							"properties": {}
						}
					]
				}
			`),
			hasError: true,
		},
		{
			name: "Invalid LineString coordinates",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {
								"type": "LineString",
								"coordinates": [[100.0, 0.0]]
							},
							"properties": {}
						}
					]
				}
			`),
			hasError: true,
		},
		{
			name: "Polygon with invalid ring",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {
								"type": "Polygon",
								"coordinates": [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
							},
							"properties": {}
						}
					]
				}
			`),
			hasError: false,
		},
		{
			name: "Unsupported Geometry type",
			data: []byte(`
				{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {
								"type": "UnsupportedType",
								"coordinates": [100.0, 0.0]
							},
							"properties": {}
						}
					]
				}
			`),
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res := createAssetFromFileData(t, e, []byte(tt.data), true, teamId)
			title := res.Path("$.data.createAsset.asset.name").Raw().(string)
			url := res.Path("$.data.createAsset.asset.url").Raw().(string)
			res = addNLSLayerSimpleByGeojson(e, sId, url, title, 0)
			// ValueDump(res)
			if tt.hasError {
				res.Object().Value("errors").Array().NotEmpty()
			} else {
				res.Object().NotContainsKey("errors")
			}
		})
	}

}
