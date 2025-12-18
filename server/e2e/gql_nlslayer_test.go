package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/samber/lo"
)

func addNLSLayerSimple(e *httpexpect.Expect, sId string, title string, index int, userID string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddNLSLayerSimple",
		Query: `mutation AddNLSLayerSimple($layerType: String!, $sceneId: ID!, $config: JSON, $index: Int, $title: String!, $schema: JSON) {
            addNLSLayerSimple(input: { layerType: $layerType, sceneId: $sceneId, config: $config, index: $index, title: $title, schema: $schema}) {
                layers {
                    id
					index
					title
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
			"title":     title,
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
			"index": index,
			"schema": map[string]any{
				"id":             "schemaId1",
				"type":           "marker",
				"extrudedHeight": 1,
				"positions":      []float64{1, 2, 3},
			},
		},
	}

	res := Request(e, userID, requestBody)

	layerId := res.Path("$.data.addNLSLayerSimple.layers.id").Raw().(string)
	res.Path("$.data.addNLSLayerSimple.layers").Object().HasValue("title", title)
	res.Path("$.data.addNLSLayerSimple.layers").Object().HasValue("index", index)

	return requestBody, res, layerId
}

func addNLSLayerSimpleByGeojson(e *httpexpect.Expect, sId string, url string, title string, index int, userID string) *httpexpect.Value {
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
						"url":   url,
						"type":  "geojson",
						"value": nil,
						"geojson": map[string]any{
							"useAsResource": false,
						},
					},
				},
				"visible":   true,
				"layerType": "simple",
				"title":     title,
				"index":     index,
			},
		},
	}

	return Request(e, userID, requestBody)
}

func removeNLSLayer(e *httpexpect.Expect, layerId string, userID string) (GraphQLRequest, *httpexpect.Value) {
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

	res := Request(e, userID, requestBody)

	return requestBody, res
}

func updateNLSLayer(e *httpexpect.Expect, layerId string, userID string) (GraphQLRequest, *httpexpect.Value) {
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

	res := Request(e, userID, requestBody)

	return requestBody, res
}

func duplicateNLSLayer(e *httpexpect.Expect, layerId string, userID string) (GraphQLRequest, *httpexpect.Value) {
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

	res := Request(e, userID, requestBody)

	return requestBody, res
}

func fetchProjectForNewLayers(e *httpexpect.Expect, pID string, userID string) (GraphQLRequest, *httpexpect.Value) {
	fetchProjectRequestBody := GraphQLRequest{
		OperationName: "GetProject",
		Query: `query GetProject($projectId: ID!) {
			node(id: $projectId, type: PROJECT) {
				id
				... on Project {
					...ProjectFragment
					scene {
						id
						__typename
					}
					__typename
				}
				__typename
			}
		}

		fragment ProjectFragment on Project {
			id
			name
			description
			imageUrl
			isArchived
			isBasicAuthActive
			basicAuthUsername
			basicAuthPassword
			publicTitle
			publicDescription
			publicImage
			alias
			enableGa
			trackingId
			publishmentStatus
			updatedAt
			createdAt
			coreSupport
			starred
			__typename
		}`,
		Variables: map[string]any{
			"projectId": pID,
		},
	}

	res := Request(e, userID, fetchProjectRequestBody)

	return fetchProjectRequestBody, res
}

func fetchSceneForNewLayers(e *httpexpect.Expect, sID string, userID string) (GraphQLRequest, *httpexpect.Value) {
	fetchSceneRequestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query: `query GetScene($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      newLayers {
        id
        index
        title
        layerType
        config
        infobox {
          id
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
        photoOverlay {
          id
          property {
            id
            items {
              ... on PropertyGroup {
			  schemaGroupId
                fields {
                  id
                  value
                  type
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

	res := Request(e, userID, fetchSceneRequestBody)

	return fetchSceneRequestBody, res
}

func TestNLSLayerCRUD(t *testing.T) {
	e, result := Server(t, baseSeeder)

	pId := createProject(e, result.UID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	_, notUpdatedProject := fetchProjectForNewLayers(e, pId, result.UID.String())
	notUpdatedProjectUpdatedAt := notUpdatedProject.Object().
		Value("data").Object().
		Value("node").Object().
		Value("updatedAt").Raw().(string)

	sId := createScene(e, result.UID, pId)

	_, res := fetchSceneForNewLayers(e, sId, result.UID.String())

	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(0)

	// Add NLSLayer
	_, _, layerId := addNLSLayerSimple(e, sId, "someTitle1", 1, result.UID.String())
	_, _, layerId2 := addNLSLayerSimple(e, sId, "someTitle2", 2, result.UID.String())
	_, _, layerId3 := addNLSLayerSimple(e, sId, "someTitle3", 3, result.UID.String())

	_, res2 := fetchSceneForNewLayers(e, sId, result.UID.String())

	orderCheck1(res2)

	// Update NLSLayers
	_, _ = updateNLSLayers(e, []map[string]interface{}{
		{
			"layerId": layerId,
			"index":   2,
		},
		{
			"layerId": layerId2,
			"index":   3,
		},
		{
			"layerId": layerId3,
			"index":   1,
		},
	}, result.UID.String())

	// refetch res2
	_, res2 = fetchSceneForNewLayers(e, sId, result.UID.String())

	orderCheck2(res2)

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(3)

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").IsEqual(1)

	// Update NLSLayer
	_, _ = updateNLSLayer(e, layerId, result.UID.String())

	_, res3 := fetchSceneForNewLayers(e, sId, result.UID.String())

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("config").Object().
		Value("data").Object().
		Value("value").IsEqual("secondSampleValue")

	// Additional check to ensure 'properties' and 'events' are present
	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("config").Object().
		ContainsKey("properties").
		ContainsKey("events").
		ContainsKey("defines")

	// Save current config before update
	savedConfig := res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("config").Raw()

	// Perform update with nil config
	updateReq, _ := updateNLSLayer(e, layerId, result.UID.String())
	updateReq.Variables["config"] = nil
	Request(e, result.UID.String(), updateReq)

	// Fetch the layer again and compare the config with the saved config
	_, res4 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("config").IsEqual(savedConfig)

	// Duplicate NLSLayer
	_, duplicateRes := duplicateNLSLayer(e, layerId, result.UID.String())
	duplicatedLayerId := duplicateRes.Path("$.data.duplicateNLSLayer.layer.id").Raw().(string)

	_, res5 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(4)

	// Remove NLSLayer
	_, _ = removeNLSLayer(e, layerId, result.UID.String())

	_, res6 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(3)

	_, _ = removeNLSLayer(e, duplicatedLayerId, result.UID.String())

	_, res7 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(2)

	_, updatedProject := fetchProjectForNewLayers(e, pId, result.UID.String())
	updatedProject.Object().
		Value("data").Object().
		Value("node").Object().
		Value("updatedAt").NotEqual(notUpdatedProjectUpdatedAt)
}

func createInfobox(e *httpexpect.Expect, layerId string, userID string) (GraphQLRequest, *httpexpect.Value, string, string) {
	requestBody := GraphQLRequest{
		OperationName: "CreateNLSInfobox",
		Query: `mutation CreateNLSInfobox($layerId: ID!) {
			createNLSInfobox( input: {layerId: $layerId} ) { 
				layer {
					id
					infobox {
						id
						layerId
						propertyId
					}
				}
			}
		}`,
		Variables: map[string]any{
			"layerId": layerId,
		},
	}

	res := Request(e, userID, requestBody)

	res.Object().
		Value("data").Object().
		Value("createNLSInfobox").Object().
		Value("layer").Object().
		Value("infobox").Object().
		HasValue("layerId", layerId)

	infobox := res.Path("$.data.createNLSInfobox.layer.infobox")
	lId := infobox.Object().Value("layerId").Raw().(string)
	pId := infobox.Object().Value("propertyId").Raw().(string)
	return requestBody, res, lId, pId
}

func createPhotoOverlay(e *httpexpect.Expect, layerId string, userID string) (GraphQLRequest, *httpexpect.Value, string, string) {
	requestBody := GraphQLRequest{
		OperationName: "CreateNLSPhotoOverlay",
		Query: `mutation CreateNLSPhotoOverlay($layerId: ID!) {
			createNLSPhotoOverlay( input: {layerId: $layerId} ) { 
				layer {
					id
					photoOverlay {
						id
						layerId
						propertyId
					}
				}
			}
		}`,
		Variables: map[string]any{
			"layerId": layerId,
		},
	}

	res := Request(e, userID, requestBody)

	res.Object().
		Value("data").Object().
		Value("createNLSPhotoOverlay").Object().
		Value("layer").Object().
		Value("photoOverlay").Object().
		HasValue("layerId", layerId)

	photooverlay := res.Path("$.data.createNLSPhotoOverlay.layer.photoOverlay")
	lId := photooverlay.Object().Value("layerId").Raw().(string)
	pId := photooverlay.Object().Value("propertyId").Raw().(string)
	return requestBody, res, lId, pId
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

// 	res := Request(e, userID, requestBody)

// 	return requestBody, res
// }

func addInfoboxBlock(e *httpexpect.Expect, layerId, pluginId, extensionId string, idx *int, userID string) (GraphQLRequest, *httpexpect.Value, string) {
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

	res := Request(e, userID, requestBody)

	res.Object().
		Value("data").Object().
		Value("addNLSInfoboxBlock").Object().
		Value("layer").Object().
		Value("infobox").Object().
		Value("blocks").Array().NotEmpty()

	return requestBody, res, res.Path("$.data.addNLSInfoboxBlock.infoboxBlock.id").Raw().(string)
}

func removeInfoboxBlock(e *httpexpect.Expect, layerId, infoboxBlockId string, last bool, userID string) (GraphQLRequest, *httpexpect.Value, string) {
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

	res := Request(e, userID, requestBody)

	if last {
		res.Object().
			Path("$.data.removeNLSInfoboxBlock.layer.infobox.blocks[:].id").IsNull()
	} else {
		res.Object().
			Path("$.data.removeNLSInfoboxBlock.layer.infobox.blocks[:].id").Array().NotConsistsOf(infoboxBlockId)
	}

	return requestBody, res, res.Path("$.data.removeNLSInfoboxBlock.infoboxBlockId").Raw().(string)
}

func moveInfoboxBlock(e *httpexpect.Expect, layerId, infoboxBlockId string, index int, userID string) (GraphQLRequest, *httpexpect.Value, string) {
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

	res := Request(e, userID, requestBody)

	res.Object().
		Path("$.data.moveNLSInfoboxBlock.layer.infobox.blocks[:].id").Array().ContainsAll(infoboxBlockId)

	return requestBody, res, res.Path("$.data.moveNLSInfoboxBlock.infoboxBlockId").Raw().(string)
}

func TestInfoboxBlocksCRUD(t *testing.T) {
	e, result := Server(t, baseSeeder)

	pId := createProject(e, result.UID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	_, notUpdatedProject := fetchProjectForNewLayers(e, pId, result.UID.String())
	notUpdatedProjectUpdatedAt := notUpdatedProject.Object().
		Value("data").Object().
		Value("node").Object().
		Value("updatedAt").Raw().(string)

	sId := createScene(e, result.UID, pId)

	// fetch scene
	_, res := fetchSceneForNewLayers(e, sId, result.UID.String())

	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(0)

	// Add NLSLayer
	_, _, layerId := addNLSLayerSimple(e, sId, "someTitle", 1, result.UID.String())
	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())

	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(1)

	_, _, _, _ = createInfobox(e, layerId, result.UID.String())

	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks").IsEqual([]any{})

	_, _, blockID1 := addInfoboxBlock(e, layerId, "reearth", "textInfoboxBetaBlock", nil, result.UID.String())
	_, _, blockID2 := addInfoboxBlock(e, layerId, "reearth", "propertyInfoboxBetaBlock", nil, result.UID.String())

	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks[:].id").IsEqual([]string{blockID1, blockID2})

	_, _, _ = moveInfoboxBlock(e, layerId, blockID1, 1, result.UID.String())

	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks[:].id").IsEqual([]string{blockID2, blockID1})

	_, _, blockID3 := addInfoboxBlock(e, layerId, "reearth", "imageInfoboxBetaBlock", lo.ToPtr(1), result.UID.String())

	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks[:].id").IsEqual([]string{blockID2, blockID3, blockID1})

	removeInfoboxBlock(e, layerId, blockID1, false, result.UID.String())
	removeInfoboxBlock(e, layerId, blockID2, false, result.UID.String())
	removeInfoboxBlock(e, layerId, blockID3, true, result.UID.String())

	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Path("$.data.node.newLayers[0].infobox.blocks").IsEqual([]any{})

	_, updatedProject := fetchProjectForNewLayers(e, pId, result.UID.String())
	updatedProject.Object().
		Value("data").Object().
		Value("node").Object().
		Value("updatedAt").NotEqual(notUpdatedProjectUpdatedAt)
}

func TestInfoboxProperty(t *testing.T) {
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
	_, res := fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(0)

	// Add NLSLayer
	_, _, layerId := addNLSLayerSimple(e, sId, "someTitle", 1, result.UID.String())
	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(1)

	_, _, _, propertyId := createInfobox(e, layerId, result.UID.String())

	// --- position Property
	_, r := updatePropertyValue(e, result.UID, propertyId, "default", "", "position", "left", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("left")

	// --- padding Property
	_, r = updatePropertyValue(e, result.UID, propertyId, "default", "", "padding", map[string]any{
		"top":    11,
		"bottom": 12,
		"left":   13,
		"right":  14,
	}, "SPACING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(map[string]any{
		"top":    11,
		"bottom": 12,
		"left":   13,
		"right":  14,
	})

	// --- gap Property
	_, r = updatePropertyValue(e, result.UID, propertyId, "default", "", "gap", 10, "NUMBER")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(10)

	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Path("$.data.node.newLayers[0].infobox.property.items[0].fields").
		Array().Length().IsEqual(3)
}

func TestPhotoOverlayProperty(t *testing.T) {
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
	_, res := fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(0)

	// Add NLSLayer
	_, _, layerId := addNLSLayerSimple(e, sId, "someTitle", 1, result.UID.String())
	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(1)

	_, _, _, propertyId := createPhotoOverlay(e, layerId, result.UID.String())

	// --- enabled Property
	_, r := updatePropertyValue(e, result.UID, propertyId, "default", "", "enabled", true, "BOOL")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(true)

	// --- cameraDuration Property
	_, r = updatePropertyValue(e, result.UID, propertyId, "default", "", "cameraDuration", 3, "NUMBER")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(3)

	_, res = fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Path("$.data.node.newLayers[0].photoOverlay.property.items[0].fields").
		Array().Length().IsEqual(2)
}

func updateCustomProperties(
	e *httpexpect.Expect,
	layerId string,
	schema map[string]any,
	userID string,
) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateCustomProperties",
		Query: `mutation UpdateCustomProperties($input: UpdateCustomPropertySchemaInput!) {
			updateCustomProperties(input: $input) {
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

	res := Request(e, userID, requestBody)

	return requestBody, res
}

func TestCustomProperties(t *testing.T) {
	e, result := Server(t, baseSeeder)

	pId := createProject(e, result.UID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	_, notUpdatedProject := fetchProjectForNewLayers(e, pId, result.UID.String())
	notUpdatedProjectUpdatedAt := notUpdatedProject.Object().
		Value("data").Object().
		Value("node").Object().
		Value("updatedAt").Raw().(string)

	sId := createScene(e, result.UID, pId)

	_, res := fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(0)

	_, _, layerId := addNLSLayerSimple(e, sId, "someTitle", 1, result.UID.String())

	_, res2 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(1)

	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").IsEqual(1)

	schema1 := map[string]any{
		"id":             "schemaId1",
		"type":           "marker",
		"extrudedHeight": 0,
		"positions":      []float64{1, 2, 3},
	}
	updateCustomProperties(e, layerId, schema1, result.UID.String())

	_, res3 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("isSketch").Boolean().IsTrue()

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").IsEqual(0)

	schema2 := map[string]any{
		"id":             "schemaId1",
		"type":           "marker",
		"extrudedHeight": 10,
		"positions":      []float64{4, 5, 6},
	}
	updateCustomProperties(e, layerId, schema2, result.UID.String())

	_, res4 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("customPropertySchema").Object().
		Value("extrudedHeight").IsEqual(10)

	_, updatedProject := fetchProjectForNewLayers(e, pId, result.UID.String())
	updatedProject.Object().
		Value("data").Object().
		Value("node").Object().
		Value("updatedAt").NotEqual(notUpdatedProjectUpdatedAt)
}

func updateNLSLayers(e *httpexpect.Expect, layers []map[string]interface{}, userID string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateNLSLayers",
		Query: `mutation UpdateNLSLayers($input: UpdateNLSLayersInput!) {
            updateNLSLayers(input: $input) {
                layers {
                    id
                    __typename
                }
                __typename
            }
        }`,
		Variables: map[string]interface{}{
			"input": map[string]interface{}{
				"layers": layers,
			},
		},
	}
	res := Request(e, userID, requestBody)
	return requestBody, res
}

func orderCheck1(res2 *httpexpect.Value) {
	newLayers := res2.Object().Value("data").Object().Value("node").Object().Value("newLayers").Array()
	expectedLayers := []struct {
		title string
		index int
	}{
		{"someTitle1", 1},
		{"someTitle2", 2},
		{"someTitle3", 3},
	}
	for i, newLayer := range newLayers.Iter() {
		expected := expectedLayers[i]
		newLayer.Object().HasValue("title", expected.title).HasValue("index", expected.index)
	}
}

func orderCheck2(res2 *httpexpect.Value) {
	newLayers := res2.Object().Value("data").Object().Value("node").Object().Value("newLayers").Array()
	expectedLayers := []struct {
		title string
		index int
	}{
		{"someTitle1", 2},
		{"someTitle2", 3},
		{"someTitle3", 1},
	}
	for i, newLayer := range newLayers.Iter() {
		expected := expectedLayers[i]
		newLayer.Object().HasValue("title", expected.title).HasValue("index", expected.index)
	}
}
