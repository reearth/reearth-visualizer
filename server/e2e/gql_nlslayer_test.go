package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
)

func addNLSLayerSimple(e *httpexpect.Expect, sId string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddNLSLayerSimple",
		Query: `mutation AddNLSLayerSimple($layerType: String!, $sceneId: ID!, $config: JSON, $index: Int, $title: String!) {
            addNLSLayerSimple(input: { layerType: $layerType, sceneId: $sceneId, config: $config, index: $index, title: $title}) {
                layers {
                    id
					sceneId
					layerType
					config
                }
            }
        }`,
		Variables: map[string]any{
			"layerType": "simple",
			"sceneId":   sId,
			"title":     "someTitle",
			"config": map[string]any{
				"data": map[string]any{
					"type":           "ExampleType",
					"url":            "https://example.com/data",
					"value":          "sampleValue",
					"layers":         "sampleLayerData",
					"jsonProperties": []string{"prop1", "prop2"},
					"updateInterval": 10,
					"parameters": map[string]any{
						"sampleKey": "sampleValue",
					},
					"time": map[string]any{
						"property":          "time",
						"interval":          5,
						"updateClockOnLoad": true,
					},
					"csv": map[string]any{
						"idColumn":              "id",
						"latColumn":             "latitude",
						"lngColumn":             "longitude",
						"heightColumn":          "height",
						"noHeader":              false,
						"disableTypeConversion": true,
					},
				},
				"properties": "sampleProperties",
				"defines": map[string]string{
					"defineKey": "defineValue",
				},
				"events": "sampleEvents",
			},
			"index": 0,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	layerId := res.Path("$.data.addNLSLayerSimple.layers.id").Raw().(string)
	return requestBody, res, layerId
}

func removeNLSLayer(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "RemoveNLSLayer",
		Query: `mutation RemoveNLSLayer($layerId: ID!) {
			removeNLSLayer(input: {layerId: $layerId}) {
				layerId
			}
		}`,
		Variables: map[string]any{
			"layerId": layerId,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return requestBody, res
}

func updateNLSLayer(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateNLSLayer",
		Query: `mutation UpdateNLSLayer($layerId: ID!, $name: String, $visible: Boolean, $config: JSON) {
			updateNLSLayer(input: {layerId: $layerId, name: $name, visible: $visible, config: $config}) {
				layer {
					id
					__typename
				}
				__typename
			}
		}`,
		Variables: map[string]any{
			"layerId": layerId,
			"name":    "Updated Layer",
			"visible": true,
			"config": map[string]any{
				"data": map[string]any{
					"type":           "ExampleType",
					"url":            "https://example.com/data",
					"value":          "secondSampleValue",
					"layers":         "sampleLayerData",
					"jsonProperties": []string{"prop1", "prop2"},
					"updateInterval": 10,
					"parameters": map[string]any{
						"sampleKey": "sampleValue",
					},
					"time": map[string]any{
						"property":          "time",
						"interval":          5,
						"updateClockOnLoad": true,
					},
					"csv": map[string]any{
						"idColumn":              "id",
						"latColumn":             "latitude",
						"lngColumn":             "longitude",
						"heightColumn":          "height",
						"noHeader":              false,
						"disableTypeConversion": true,
					},
				},
			},
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return requestBody, res
}

func fetchSceneForNewLayers(e *httpexpect.Expect, sID string) (GraphQLRequest, *httpexpect.Value) {
	fetchSceneRequestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query: `query GetScene($sceneId: ID!) {
		  node(id: $sceneId, type: SCENE) {
			id
			... on Scene {
			  rootLayerId
			  newLayers {
				id
				layerType
				config
		 	  }
			  __typename
			}
			__typename
		  }
		}`,
		Variables: map[string]any{
			"sceneId": sID,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(fetchSceneRequestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return fetchSceneRequestBody, res
}

func TestNLSLayerCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pId := createProject(e)
	_, _, sId := createScene(e, pId)

	// fetch scene
	_, res := fetchSceneForNewLayers(e, sId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(0)

	// Add NLSLayer
	_, _, layerId := addNLSLayerSimple(e, sId)

	_, res2 := fetchSceneForNewLayers(e, sId)

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(1)

	// Update NLSLayer
	_, _ = updateNLSLayer(e, layerId)

	_, res3 := fetchSceneForNewLayers(e, sId)

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("config").Object().
		Value("data").Object().
		Value("value").Equal("secondSampleValue")

	// Additional check to ensure 'properties' and 'events' are present
	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("config").Object().
		ContainsKey("properties").
		ContainsKey("events").
		ContainsKey("defines")

	// Save current config before update
	savedConfig := res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("config").Raw()

	// Perform update with nil config
	updateReq, _ := updateNLSLayer(e, layerId)
	updateReq.Variables["config"] = nil
	e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(updateReq).
		Expect().
		Status(http.StatusOK).
		JSON()

	// Fetch the layer again and compare the config with the saved config
	_, res4 := fetchSceneForNewLayers(e, sId)
	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("config").Equal(savedConfig)

	// Remove NLSLayer
	_, _ = removeNLSLayer(e, layerId)
}
