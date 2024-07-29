package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/samber/lo"
)

func addNLSLayerSimple(e *httpexpect.Expect, sId string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddNLSLayerSimple",
		Query: `mutation AddNLSLayerSimple($layerType: String!, $sceneId: ID!, $config: JSON, $index: Int, $title: String!, $schema: JSON) {
            addNLSLayerSimple(input: { layerType: $layerType, sceneId: $sceneId, config: $config, index: $index, title: $title, schema: $schema}) {
                layers {
                    id
					sceneId
					layerType
					config
					sketch {
						customPropertySchema
					}
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
			"schema": map[string]any{
				"id":             "schemaId1",
				"type":           "marker",
				"extrudedHeight": 1,
				"positions":      []float64{1, 2, 3},
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

func duplicateNLSLayer(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "DuplicateNLSLayer",
		Query: `mutation DuplicateNLSLayer($layerId: ID!) {
			duplicateNLSLayer(input: {layerId: $layerId}) {
				layer {
					id
					__typename
				}
				__typename
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

func fetchSceneForNewLayers(e *httpexpect.Expect, sID string) (GraphQLRequest, *httpexpect.Value) {
	fetchSceneRequestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query: `query GetScene($sceneId: ID!) {
		  node(id: $sceneId, type: SCENE) {
			id
			... on Scene {
			  newLayers {
				id
				layerType
				config
				infobox {
					id
					blocks {
						id
						propertyId
						property {
						  id
						  items {
							  ... on PropertyGroup {
								fields {
								  id	
								  value
								  type
								}
							  }
							}
						}
					}
				}
				isSketch
				sketch {
					customPropertySchema
					featureCollection {
						type
						features {
							id
							type
							properties
							geometry {
								... on Point {
									type
									pointCoordinates
								}
								... on LineString {
									type
									lineStringCoordinates
								}
								... on Polygon {
									type
									polygonCoordinates
								}
								... on MultiPolygon {
									type
									multiPolygonCoordinates
								}
								... on GeometryCollection {
									type
									geometries {
										... on Point {
											type
											pointCoordinates
										}
										... on LineString {
											type
											lineStringCoordinates
										}
										... on Polygon {
											type
											polygonCoordinates
										}
										... on MultiPolygon {
											type
											multiPolygonCoordinates
										}
									}
								}
							}
						}
					}
		 	  }
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

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").Equal(1)

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

	// Duplicate NLSLayer
	_, duplicateRes := duplicateNLSLayer(e, layerId)
	duplicatedLayerId := duplicateRes.Path("$.data.duplicateNLSLayer.layer.id").Raw().(string)

	_, res5 := fetchSceneForNewLayers(e, sId)
	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(2)

	// Remove NLSLayer
	_, _ = removeNLSLayer(e, layerId)

	_, res6 := fetchSceneForNewLayers(e, sId)
	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(1)

	_, _ = removeNLSLayer(e, duplicatedLayerId)

	_, res7 := fetchSceneForNewLayers(e, sId)
	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(0)
}

func createInfobox(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "CreateNLSInfobox",
		Query: `mutation CreateNLSInfobox($layerId: ID!) {
			createNLSInfobox( input: {layerId: $layerId} ) { 
				layer {
					id
					infobox {
						id
						layerId
					}
				}
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

	res.Object().
		Value("data").Object().
		Value("createNLSInfobox").Object().
		Value("layer").Object().
		Value("infobox").Object().
		ValueEqual("layerId", layerId)

	return requestBody, res, res.Path("$.data.createNLSInfobox.layer.infobox.id").Raw().(string)
}

// func removeNLSInfobox(e *httpexpect.Expect, layerId string) (GraphQLRequest, *httpexpect.Value) {
// 	requestBody := GraphQLRequest{
// 		OperationName: "removeNLSInfobox",
// 		Query: `mutation removeNLSInfobox($layerId: ID!) {
// 			removeNLSInfobox( input: { layerId: $layerId} ) {
// 				layer {
// 					id
// 					infobox {
// 						id
// 					}
// 				}
// 			}
// 		}`,
// 		Variables: map[string]any{
// 			"layerId": layerId,
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

func addInfoboxBlock(e *httpexpect.Expect, layerId, pluginId, extensionId string, idx *int) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddNLSInfoboxBlock",
		Query: `mutation AddNLSInfoboxBlock($layerId: ID!, $pluginId: ID!, $extensionId: ID!, $index: Int) {
			addNLSInfoboxBlock( input: {layerId: $layerId, pluginId: $pluginId, extensionId: $extensionId, index: $index} ) {
				infoboxBlock {
					id
				}
				layer {
					id
					infobox {
						id
						layerId
						blocks {
							id
							propertyId
							property {
							  id
							  items {
								  ... on PropertyGroup {
									fields {
									  id	
									  value
									  type
									}
								  }
								}
							}
						}
					}
				}
			}
		}`,
		Variables: map[string]any{
			"layerId":     layerId,
			"pluginId":    pluginId,
			"extensionId": extensionId,
			"index":       idx,
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

	res.Object().
		Value("data").Object().
		Value("addNLSInfoboxBlock").Object().
		Value("layer").Object().
		Value("infobox").Object().
		Value("blocks").Array().NotEmpty()

	return requestBody, res, res.Path("$.data.addNLSInfoboxBlock.infoboxBlock.id").Raw().(string)
}

func removeInfoboxBlock(e *httpexpect.Expect, layerId, infoboxBlockId string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "RemoveNLSInfoboxBlock",
		Query: `mutation RemoveNLSInfoboxBlock($layerId: ID!, $infoboxBlockId: ID!) {
			removeNLSInfoboxBlock( input: {layerId: $layerId , infoboxBlockId: $infoboxBlockId} ) { 
				infoboxBlockId
				layer {
					id
					infobox {
						id
						layerId
						blocks {
							id
							propertyId
							property {
							  id
							  items {
								  ... on PropertyGroup {
									fields {
									  id	
									  value
									  type
									}
								  }
								}
							}
						}
					}
				}
			}
		}`,
		Variables: map[string]any{
			"layerId":        layerId,
			"infoboxBlockId": infoboxBlockId,
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

	res.Object().
		Path("$.data.removeNLSInfoboxBlock.layer.infobox.blocks[:].id").Array().NotContains(infoboxBlockId)

	return requestBody, res, res.Path("$.data.removeNLSInfoboxBlock.infoboxBlockId").Raw().(string)
}

func moveInfoboxBlock(e *httpexpect.Expect, layerId, infoboxBlockId string, index int) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "MoveNLSInfoboxBlock",
		Query: `mutation MoveNLSInfoboxBlock($layerId: ID!, $infoboxBlockId: ID!, $index: Int!) {
			moveNLSInfoboxBlock( input: {layerId: $layerId, infoboxBlockId: $infoboxBlockId, index: $index} ) { 
				infoboxBlockId
				layer {
					id
					infobox {
						id
						layerId
						blocks {
							id
							propertyId
							property {
							  id
							  items {
								  ... on PropertyGroup {
									fields {
									  id	
									  value
									  type
									}
								  }
								}
							}
						}
					}
				}
			}
		}`,
		Variables: map[string]any{
			"layerId":        layerId,
			"infoboxBlockId": infoboxBlockId,
			"index":          index,
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

	res.Object().
		Path("$.data.moveNLSInfoboxBlock.layer.infobox.blocks[:].id").Array().Contains(infoboxBlockId)

	return requestBody, res, res.Path("$.data.moveNLSInfoboxBlock.infoboxBlockId").Raw().(string)
}

func TestInfoboxBlocksCRUD(t *testing.T) {

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
	_, res = fetchSceneForNewLayers(e, sId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(1)

	_, _, _ = createInfobox(e, layerId)

	_, res = fetchSceneForNewLayers(e, sId)
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks").Equal([]any{})

	_, _, blockID1 := addInfoboxBlock(e, layerId, "reearth", "textInfoboxBetaBlock", nil)
	_, _, blockID2 := addInfoboxBlock(e, layerId, "reearth", "propertyInfoboxBetaBlock", nil)

	_, res = fetchSceneForNewLayers(e, sId)
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks[:].id").Equal([]string{blockID1, blockID2})

	_, _, _ = moveInfoboxBlock(e, layerId, blockID1, 1)

	_, res = fetchSceneForNewLayers(e, sId)
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks[:].id").Equal([]string{blockID2, blockID1})

	_, _, blockID3 := addInfoboxBlock(e, layerId, "reearth", "imageInfoboxBetaBlock", lo.ToPtr(1))

	_, res = fetchSceneForNewLayers(e, sId)
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks[:].id").Equal([]string{blockID2, blockID3, blockID1})

	removeInfoboxBlock(e, layerId, blockID1)
	removeInfoboxBlock(e, layerId, blockID2)
	removeInfoboxBlock(e, layerId, blockID3)

	_, res = fetchSceneForNewLayers(e, sId)
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks").Equal([]any{})
}

func addCustomProperties(
	e *httpexpect.Expect,
	layerId string,
	schema map[string]any,
) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "AddCustomProperties",
		Query: `mutation AddCustomProperties($input: AddCustomPropertySchemaInput!) {
							addCustomProperties(input: $input) {
								layer {
									id
									sketch {
										customPropertySchema
									}
								}
							}
						}`,
		Variables: map[string]interface{}{
			"input": map[string]interface{}{
				"layerId": layerId,
				"schema":  schema,
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

func TestCustomProperties(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pId := createProject(e)
	_, _, sId := createScene(e, pId)

	_, res := fetchSceneForNewLayers(e, sId)
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(0)

	_, _, layerId := addNLSLayerSimple(e, sId)

	_, res2 := fetchSceneForNewLayers(e, sId)
	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(1)

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").Equal(1)

	schema1 := map[string]any{
		"id":             "schemaId1",
		"type":           "marker",
		"extrudedHeight": 0,
		"positions":      []float64{1, 2, 3},
	}
	addCustomProperties(e, layerId, schema1)

	_, res3 := fetchSceneForNewLayers(e, sId)
	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("isSketch").Boolean().True()

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").Equal(0)

	schema2 := map[string]any{
		"id":             "schemaId1",
		"type":           "marker",
		"extrudedHeight": 10,
		"positions":      []float64{4, 5, 6},
	}
	addCustomProperties(e, layerId, schema2)

	_, res4 := fetchSceneForNewLayers(e, sId)
	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").Equal(10)
}
