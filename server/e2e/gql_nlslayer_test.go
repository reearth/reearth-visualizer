package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
)

func addNLSLayerSimple(e *httpexpect.Expect, sId string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "addNLSLayerSimple",
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
				"parentLayerId":            "parent12345",
				"layerType":                "SimpleType",
				"sceneID":                  sId,
				"dataType":                 "ExampleType",
				"dataUrl":                  "https://example.com/data",
				"dataValue":                "sampleValue",
				"dataLayers":               "sampleLayerData",
				"dataJsonProperties":       []string{"prop1", "prop2"},
				"dataUpdateInterval":       10,
				"dataParameters":           "sampleDataParameters",
				"timeProperty":             "time",
				"timeInterval":             5,
				"timeUpdateClockOnLoad":    true,
				"csvIdColumn":              "id",
				"csvLatColumn":             "latitude",
				"csvLngColumn":             "longitude",
				"csvHeightColumn":          "height",
				"csvNoHeader":              false,
				"csvDisableTypeConversion": true,
				"value":                    "sampleValue",
				"index":                    0,
				"Properties":               "sampleProperties",
				"Defines":                  "sampleDefines",
				"Events":                   "sampleEvents",
				"Appearance":               "sampleAppearance",
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

	layerId := res.Path("$.data.addNLSLayerSimple.layers.id").Raw().(string)
	return requestBody, res, layerId
}

func removeNLSLayer(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "removeNLSLayer",
		Query: `mutation RemoveNLSLayer($input: RemoveNLSLayerInput!) {
			removeNLSLayer(input: $input) { 
				layerId
			}
		}`,
		Variables: map[string]any{
			"input": map[string]any{
				"layerId": layerId,
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

func updateNLSLayer(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "updateNLSLayer",
		Query: `mutation UpdateNLSLayer($input: UpdateNLSLayerInput!) {
			updateNLSLayer(input: $input) { 
				layer { 
					id
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"input": map[string]any{
				"layerId": layerId,
				"name":    "Updated Layer",
				"visible": true,
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

func TestNLSLayerCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pId := createProject(e)
	_, _, sId := createScene(e, pId)

	// Add NLSLayer
	_, _, layerId := addNLSLayerSimple(e, sId)

	// Update NLSLayer
	_, _ = updateNLSLayer(e, layerId)

	// Remove NLSLayer
	_, _ = removeNLSLayer(e, layerId)
}
