package e2e

import (
	"net/http"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
)

func addStyle(e *httpexpect.Expect, sId, name string) (GraphQLRequest, *httpexpect.Value, string) {
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

	res := e.POST("/api/graphql").
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	styleId := res.Path("$.data.addStyle.style.id").String().Raw()
	return requestBody, res, styleId
}

func updateStyleName(e *httpexpect.Expect, styleId, newName string) (GraphQLRequest, *httpexpect.Value) {
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

	res := e.POST("/api/graphql").
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return requestBody, res
}

func removeStyle(e *httpexpect.Expect, styleId string) (GraphQLRequest, *httpexpect.Value) {
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

	res := e.POST("/api/graphql").
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return requestBody, res
}

func duplicateStyle(e *httpexpect.Expect, styleId string) (GraphQLRequest, *httpexpect.Value) {
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

	res := e.POST("/api/graphql").
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return requestBody, res
}

func fetchSceneForStyles(e *httpexpect.Expect, sID string) (GraphQLRequest, *httpexpect.Value) {
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

func styleCRUD(t *testing.T, isUseRedis bool) {
	redisAddress := ""
	if isUseRedis {
		mr, err := miniredis.Run()
		if err != nil {
			t.Fatal(err)
		}
		defer mr.Close()
		redisAddress = mr.Addr()
	}

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
		RedisHost: redisAddress,
	}, true, baseSeeder)

	pId := createProject(e)
	_, _, sId := createScene(e, pId)

	// fetch scene
	_, res := fetchSceneForStyles(e, sId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().Equal(0)

	// Add Style
	_, _, styleId := addStyle(e, sId, "MyStyle")

	_, res2 := fetchSceneForStyles(e, sId)

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().Equal(1)

	// Update Style
	_, _ = updateStyleName(e, styleId, "NewName")

	_, res3 := fetchSceneForStyles(e, sId)

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().First().Object().
		Value("name").Equal("NewName")

	// Duplicate Style
	_, duplicateRes := duplicateStyle(e, styleId)
	duplicatedStyleId := duplicateRes.Path("$.data.duplicateStyle.style.id").Raw().(string)

	_, res4 := fetchSceneForStyles(e, sId)

	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().Equal(2)

	// Remove Style
	_, _ = removeStyle(e, styleId)

	_, res5 := fetchSceneForStyles(e, sId)

	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().Equal(1)

	_, _ = removeStyle(e, duplicatedStyleId)

	_, res6 := fetchSceneForStyles(e, sId)

	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("styles").Array().
		Length().Equal(0)
}

func TestStyleCRUD(t *testing.T) {
	styleCRUD(t, false)
}

func TestStyleCRUDWithRedis(t *testing.T) {
	styleCRUD(t, true)
}
