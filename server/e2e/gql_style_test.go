package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func addStyle(e *httpexpect.Expect, u accountsID.UserID, sId, name string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddStyle",
		Query: `mutation AddStyle( $sceneId: ID!, $name: String!, $value: JSON!) {
			addStyle(input: { sceneId: $sceneId, name: $name, value: $value}) {
				style {
					id
					sceneId
					name
					value
				}
			}
		}`,
		Variables: map[string]any{
			"sceneId": sId,
			"name":    name,
			"value": map[string]any{
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
		},
	}

	res := Request(e, u.String(), requestBody)

	styleId := res.Path("$.data.addStyle.style.id").String().Raw()
	return requestBody, res, styleId
}

func updateStyleName(e *httpexpect.Expect, u accountsID.UserID, styleId, newName string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateStyle",
		Query: `mutation UpdateStyle($styleId: ID!, $name: String) {
			updateStyle(input: {styleId: $styleId, name: $name}) {
				style {
					id
					name
					value
				}
			}
		}`,
		Variables: map[string]any{
			"styleId": styleId,
			"name":    newName,
		},
	}

	res := Request(e, u.String(), requestBody)

	return requestBody, res
}

func removeStyle(e *httpexpect.Expect, u accountsID.UserID, styleId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "RemoveStyle",
		Query: `mutation RemoveStyle($styleId: ID!) {
			removeStyle(input: {styleId: $styleId}) {
				styleId
			}
		}`,
		Variables: map[string]any{
			"styleId": styleId,
		},
	}

	res := Request(e, u.String(), requestBody)

	return requestBody, res
}

func duplicateStyle(e *httpexpect.Expect, u accountsID.UserID, styleId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "DuplicateStyle",
		Query: `mutation DuplicateStyle($styleId: ID!) {
			duplicateStyle(input: {styleId: $styleId}) {
				style {
					id
					name
					value
				}
			}
		}`,
		Variables: map[string]any{
			"styleId": styleId,
		},
	}

	res := Request(e, u.String(), requestBody)

	return requestBody, res
}

func fetchSceneForStyles(e *httpexpect.Expect, u accountsID.UserID, sID string) (GraphQLRequest, *httpexpect.Value) {
	fetchSceneRequestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query: `query GetScene($sceneId: ID!) {
		  node(id: $sceneId, type: SCENE) {
			id
			... on Scene {
			  styles {
				id
				name
				value
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

	res := Request(e, u.String(), fetchSceneRequestBody)
	return fetchSceneRequestBody, res
}

func TestStyleCRUD(t *testing.T) {
	e, result := Server(t, baseSeeder)

	pId := createProject(e, result.UID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, result.UID, pId)

	// fetch scene
	_, res := fetchSceneForStyles(e, result.UID, sId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().IsEqual(0)

	// Add Style
	_, _, styleId := addStyle(e, result.UID, sId, "MyStyle")

	_, res2 := fetchSceneForStyles(e, result.UID, sId)

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().IsEqual(1)

	// Update Style
	_, _ = updateStyleName(e, result.UID, styleId, "NewName")

	_, res3 := fetchSceneForStyles(e, result.UID, sId)

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().Value(0).Object().
		Value("name").IsEqual("NewName")

	// Duplicate Style
	_, duplicateRes := duplicateStyle(e, result.UID, styleId)
	duplicatedStyleId := duplicateRes.Path("$.data.duplicateStyle.style.id").Raw().(string)

	_, res4 := fetchSceneForStyles(e, result.UID, sId)

	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().IsEqual(2)

	// Remove Style
	_, _ = removeStyle(e, result.UID, styleId)

	_, res5 := fetchSceneForStyles(e, result.UID, sId)

	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().IsEqual(1)

	_, _ = removeStyle(e, result.UID, duplicatedStyleId)

	_, res6 := fetchSceneForStyles(e, result.UID, sId)

	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().IsEqual(0)
}
