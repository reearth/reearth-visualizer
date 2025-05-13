package e2e

import (
	"testing"
)

func TestValidateGeoJsonOfAssets(t *testing.T) {
	e := Server(t, baseSeeder)

	teamId := wID.String()
	pId := createProject(e, uID, map[string]any{
		"name":        "test",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, pId)

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
			name: "Valid Point coordinates",
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
			hasError: false,
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
			res := createAssetFromFileData(t, e, []byte(tt.data), true, teamId, nil)
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

func TestValidateGeoJsonExternal(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		hasError bool
	}{
		{
			name:     "Valid GeoJSON URL",
			url:      "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson",
			hasError: false,
		},
		{
			name:     "Invalid URL",
			url:      "not-a-url",
			hasError: true,
		},
		{
			name:     "Non-existent file",
			url:      "https://example.com/nonexistent.geojson",
			hasError: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := Server(t, baseSeeder)
			pId := createProject(e, uID, map[string]any{
				"name":        "test",
				"description": "abc",
				"teamId":      wID.String(),
				"visualizer":  "CESIUM",
				"coreSupport": true,
			})

			sId := createScene(e, pId)
			res := addNLSLayerSimpleByGeojson(e, sId, tt.url, "test", 0)
			if tt.hasError {
				res.Object().Value("errors").Array().NotEmpty()
			} else {
				res.Object().NotContainsKey("errors")
			}
		})
	}
}

func TestValidateGeoFormData(t *testing.T) {
	e := Server(t, baseSeeder)

	pId := createProject(e, uID, map[string]any{
		"name":        "test",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, pId)
	tests := []struct {
		name     string
		geometry map[string]any
		hasError bool
	}{
		{
			name: "Valid Point",
			geometry: map[string]any{
				"type":        "Point",
				"coordinates": []float64{125.6, 10.1},
			},
			hasError: false,
		},
		{
			name: "Invalid Point coordinates",
			geometry: map[string]any{
				"type":        "Point",
				"coordinates": []float64{200.0, 100.0},
			},
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			requestBody := GraphQLRequest{
				OperationName: "AddNLSLayerSimple",
				Query: `mutation AddNLSLayerSimple($input: AddNLSLayerSimpleInput!) {
			addNLSLayerSimple(input: $input) {
				layers {
					id
					__typename
				}
				__typename
			}
		}`,
				Variables: map[string]any{
					"input": map[string]any{
						"sceneId": sId,
						"config": map[string]any{
							"data": map[string]any{
								"type": "geojson",
								"value": map[string]any{
									"type":     "Feature",
									"geometry": tt.geometry,
									"properties": map[string]any{
										"name": "Dinagat Islands",
									},
								},
								"geojson": map[string]any{
									"useAsResource": false,
								},
							},
						},
						"visible":   true,
						"layerType": "simple",
						"title":     "cbbed",
						"index":     0,
					},
				},
			}

			res := Request(e, uID.String(), requestBody)
			if tt.hasError {
				res.Object().Value("errors").Array().NotEmpty()
			} else {
				res.Object().NotContainsKey("errors")
			}
		})
	}
}
