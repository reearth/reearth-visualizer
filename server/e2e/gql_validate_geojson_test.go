package e2e

import (
	"testing"
)

func TestValidateGeoJsonExternal(t *testing.T) {
	// just only check the URL format
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
			hasError: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e, result := Server(t, baseSeeder)
			pId := createProject(e, result.UID, map[string]any{
				"name":        "test",
				"description": "abc",
				"workspaceId": result.WID.String(),
				"visualizer":  "CESIUM",
				"coreSupport": true,
			})

			sId := createScene(e, result.UID, pId)
			res := addNLSLayerSimpleByGeojson(e, sId, tt.url, "test", 0, result.UID.String())
			if tt.hasError {
				res.Object().Value("errors").Array().NotEmpty()
			} else {
				res.Object().NotContainsKey("errors")
			}
		})
	}
}

func TestValidateGeoFormData(t *testing.T) {
	e, result := Server(t, baseSeeder)

	pId := createProject(e, result.UID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, result.UID, pId)
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

			res := Request(e, result.UID.String(), requestBody)
			if tt.hasError {
				res.Object().Value("errors").Array().NotEmpty()
			} else {
				res.Object().NotContainsKey("errors")
			}
		})
	}
}
