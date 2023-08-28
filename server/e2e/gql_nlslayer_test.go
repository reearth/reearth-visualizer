package e2e

// import (
// 	"net/http"
// 	"testing"

// 	"github.com/gavv/httpexpect/v2"
// 	"github.com/reearth/reearth/server/internal/app/config"
// )

// func addNLSLayerSimple(e *httpexpect.Expect, sId string) (GraphQLRequest, *httpexpect.Value, string) {
// 	requestBody := GraphQLRequest{
// 		OperationName: "addNLSLayerSimple",
// 		Query: `mutation AddNLSLayerSimple($input: AddNLSLayerSimpleInput!) {
// 			addNLSLayerSimple(input: $input) { 
// 				layers { 
// 					id
// 					__typename 
// 				} 
// 				__typename 
// 			}
// 		}`,
// 		Variables: map[string]any{
// 			"input": map[string]any{
// 				"parentLayerId": "parent12345",
// 				"layerType":     "SimpleType",
// 				"sceneID":       sId,
// 				"config": map[string]any{
// 					"data": map[string]any{
// 						"type":           "ExampleType",
// 						"url":            "https://example.com/data",
// 						"value":          "sampleValue",
// 						"layers":         "sampleLayerData",
// 						"jsonProperties": []string{"prop1", "prop2"},
// 						"updateInterval": 10,
// 						"parameters": map[string]any{
// 							"sampleKey": "sampleValue",
// 						},
// 						"time": map[string]any{
// 							"property":          "time",
// 							"interval":          5,
// 							"updateClockOnLoad": true,
// 						},
// 						"csv": map[string]any{
// 							"idColumn":              "id",
// 							"latColumn":             "latitude",
// 							"lngColumn":             "longitude",
// 							"heightColumn":          "height",
// 							"noHeader":              false,
// 							"disableTypeConversion": true,
// 						},
// 					},
// 					"properties": "sampleProperties",
// 					"defines": map[string]string{
// 						"defineKey": "defineValue",
// 					},
// 					"events": "sampleEvents",
// 				},
// 				"index": 0,
// 			},
// 		},
// 	}

// 	res := e.POST("/api/graphql").
// 		WithHeader("Origin", "https://example.com").
// 		WithHeader("X-Reearth-Debug-User", uID.String()).
// 		WithHeader("Content-Type", "application/json").
// 		WithJSON(requestBody).
// 		Expect().
// 		Status(http.StatusOK).
// 		JSON()

// 	layerId := res.Path("$.data.addNLSLayerSimple.layers.id").Raw().(string)
// 	return requestBody, res, layerId
// }

// func removeNLSLayer(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
// 	requestBody := GraphQLRequest{
// 		OperationName: "removeNLSLayer",
// 		Query: `mutation RemoveNLSLayer($input: RemoveNLSLayerInput!) {
// 			removeNLSLayer(input: $input) { 
// 				layerId
// 			}
// 		}`,
// 		Variables: map[string]any{
// 			"input": map[string]any{
// 				"layerId": layerId,
// 			},
// 		},
// 	}

// 	res := e.POST("/api/graphql").
// 		WithHeader("Origin", "https://example.com").
// 		WithHeader("X-Reearth-Debug-User", uID.String()).
// 		WithHeader("Content-Type", "application/json").
// 		WithJSON(requestBody).
// 		Expect().
// 		Status(http.StatusOK).
// 		JSON()

// 	return requestBody, res
// }

// func updateNLSLayer(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
// 	requestBody := GraphQLRequest{
// 		OperationName: "updateNLSLayer",
// 		Query: `mutation UpdateNLSLayer($input: UpdateNLSLayerInput!) {
// 			updateNLSLayer(input: $input) { 
// 				layer { 
// 					id
// 					__typename 
// 				} 
// 				__typename 
// 			}
// 		}`,
// 		Variables: map[string]any{
// 			"input": map[string]any{
// 				"layerId": layerId,
// 				"name":    "Updated Layer",
// 				"visible": true,
// 			},
// 		},
// 	}

// 	res := e.POST("/api/graphql").
// 		WithHeader("Origin", "https://example.com").
// 		WithHeader("X-Reearth-Debug-User", uID.String()).
// 		WithHeader("Content-Type", "application/json").
// 		WithJSON(requestBody).
// 		Expect().
// 		Status(http.StatusOK).
// 		JSON()

// 	return requestBody, res
// }

// func TestNLSLayerCRUD(t *testing.T) {
// 	e := StartServer(t, &config.Config{
// 		Origins: []string{"https://example.com"},
// 		AuthSrv: config.AuthSrvConfig{
// 			Disabled: true,
// 		},
// 	}, true, baseSeeder)

// 	pId := createProject(e)
// 	_, _, sId := createScene(e, pId)

// 	// Add NLSLayer
// 	_, _, layerId := addNLSLayerSimple(e, sId)

// 	// Update NLSLayer
// 	_, _ = updateNLSLayer(e, layerId)

// 	// Remove NLSLayer
// 	_, _ = removeNLSLayer(e, layerId)
// }
