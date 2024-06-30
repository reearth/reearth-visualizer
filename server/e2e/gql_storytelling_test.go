package e2e

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"regexp"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func createProject(e *httpexpect.Expect) string {
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query: `mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL, $coreSupport: Boolean) {
			createProject( input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl, coreSupport: $coreSupport} ) { 
				project { 
					id
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"name":        "test",
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": true,
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

	return res.Path("$.data.createProject.project.id").Raw().(string)
}

func createScene(e *httpexpect.Expect, pID string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "CreateScene",
		Query: `mutation CreateScene($projectId: ID!) {
			createScene( input: {projectId: $projectId} ) { 
				scene { 
					id
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"projectId": pID,
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

	sID := res.Path("$.data.createScene.scene.id").Raw().(string)
	return requestBody, res, sID
}

func fetchSceneForStories(e *httpexpect.Expect, sID string) (GraphQLRequest, *httpexpect.Value) {
	fetchSceneRequestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query: `query GetScene($sceneId: ID!) {
		  node(id: $sceneId, type: SCENE) {
			id
			... on Scene {
			  propertyId
		      stories {
				id
				pages {
				  id
				  title
				  layers {
					id
				  }
				  swipeableLayers {
					id
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
				bgColor
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

func createStory(e *httpexpect.Expect, sID, name string, index int) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "CreateStory",
		Query: `mutation CreateStory($sceneId: ID!, $title: String!, $index: Int) {
			createStory( input: {sceneId: $sceneId, title: $title, index: $index} ) { 
				story { 
					id
					title
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"sceneId": sID,
			"title":   name,
			"index":   index,
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
		Value("createStory").Object().
		Value("story").Object().
		ValueEqual("title", name)

	return requestBody, res, res.Path("$.data.createStory.story.id").Raw().(string)
}

func updateStory(e *httpexpect.Expect, storyID, sID string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateStory",
		Query: `mutation UpdateStory($sceneId: ID!, $storyId: ID!, $title: String!, $index: Int, $bgColor: String) {
			updateStory( input: {sceneId: $sceneId, storyId: $storyId, title: $title, index: $index, bgColor: $bgColor} ) { 
				story { 
					id
					title
					bgColor
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"storyId": storyID,
			"sceneId": sID,
			"title":   "test2",
			"index":   0,
			"bgColor": "newBG",
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
		Value("updateStory").Object().
		Value("story").Object().
		ValueEqual("title", "test2")

	return requestBody, res
}

func deleteStory(e *httpexpect.Expect, storyID, sID string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "DeleteStory",
		Query: `mutation DeleteStory($sceneId: ID!, $storyId: ID!) {
			deleteStory( input: {sceneId: $sceneId, storyId: $storyId} ) { 
				storyId
			}
		}`,
		Variables: map[string]any{
			"storyId": storyID,
			"sceneId": sID,
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
		Value("deleteStory").Object().
		ValueEqual("storyId", storyID)

	return requestBody, res
}

func publishStory(e *httpexpect.Expect, storyID, alias string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "PublishStory",
		Query: `mutation PublishStory($storyId: ID!, $alias: String, $status: PublishmentStatus!) {
			publishStory( input: {storyId: $storyId, alias: $alias, status: $status} ) { 
				story{
					id
					publishedAt
				}
			}
		}`,
		Variables: map[string]any{
			"storyId": storyID,
			"alias":   alias,
			"status":  "PUBLIC",
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
		Value("publishStory").Object().
		Value("story").Object().
		ValueEqual("id", storyID)

	return requestBody, res
}

func createPage(e *httpexpect.Expect, sID, storyID, name string, swipeable bool) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "CreateStoryPage",
		Query: `mutation CreateStoryPage($sceneId: ID!, $storyId: ID!, $title: String, $swipeable: Boolean) {
			createStoryPage( input: {sceneId: $sceneId, storyId: $storyId, title: $title, swipeable: $swipeable} ) { 
				story {
					id
					pages {
						id
					}
				}
				page {
					id
					title
					swipeable
				}
			}
		}`,
		Variables: map[string]any{
			"sceneId":   sID,
			"storyId":   storyID,
			"title":     name,
			"swipeable": swipeable,
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
		Value("createStoryPage").Object().
		Value("page").Object().
		ValueEqual("title", name).
		ValueEqual("swipeable", swipeable)

	return requestBody, res, res.Path("$.data.createStoryPage.page.id").Raw().(string)
}

func updatePage(e *httpexpect.Expect, sID, storyID, pageID, name string, swipeable bool) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateStoryPage",
		Query: `mutation UpdateStoryPage($sceneId: ID!, $storyId: ID!, $pageId: ID!, $title: String, $swipeable: Boolean) {
			updateStoryPage( input: {sceneId: $sceneId, storyId: $storyId, pageId: $pageId, title: $title, swipeable: $swipeable} ) { 
				story {
				 id
				}
				page {
					id
					title
					swipeable
				}
			}
		}`,
		Variables: map[string]any{
			"sceneId":   sID,
			"storyId":   storyID,
			"pageId":    pageID,
			"title":     name,
			"swipeable": swipeable,
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
		Value("updateStoryPage").Object().
		Value("page").Object().
		ValueEqual("title", name).
		ValueEqual("swipeable", swipeable)

	return requestBody, res
}

func movePage(e *httpexpect.Expect, storyID, pageID string, idx int) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "MoveStoryPage",
		Query: `mutation MoveStoryPage($storyId: ID!, $pageId: ID!, $index: Int!) {
			moveStoryPage( input: {storyId: $storyId, pageId: $pageId, index: $index} ) { 
				story {
				 id
				}
				page {
					id
					title
					swipeable
				}
			}
		}`,
		Variables: map[string]any{
			"storyId": storyID,
			"pageId":  pageID,
			"index":   idx,
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
		Value("moveStoryPage").Object().
		Value("page").Object()

	return requestBody, res
}

func deletePage(e *httpexpect.Expect, sID, storyID, pageID string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "RemoveStoryPage",
		Query: `mutation RemoveStoryPage($sceneId: ID!, $storyId: ID!, $pageId: ID!) {
			removeStoryPage( input: {sceneId: $sceneId, storyId: $storyId, pageId: $pageId} ) { 
				story {
				 	id
					pages{
						id
					}
				}
				pageId
			}
		}`,
		Variables: map[string]any{
			"sceneId": sID,
			"storyId": storyID,
			"pageId":  pageID,
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
		Value("removeStoryPage").Object().
		ValueEqual("pageId", pageID).
		Value("story").Object().
		Value("pages").Array().
		Path("$..id").Array().NotContains(pageID)

	return requestBody, res
}

func duplicatePage(e *httpexpect.Expect, sID, storyID, pageID string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "DuplicateStoryPage",
		Query: `mutation DuplicateStoryPage($sceneId: ID!, $storyId: ID!, $pageId: ID!) {
			duplicateStoryPage( input: {sceneId: $sceneId, storyId: $storyId, pageId: $pageId} ) { 
				story {
				 	id
					pages{
						id
					}
				}
				page{
					id
				}
			}
		}`,
		Variables: map[string]any{
			"sceneId": sID,
			"storyId": storyID,
			"pageId":  pageID,
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

	pID := res.Object().
		Value("data").Object().
		Value("duplicateStoryPage").Object().
		Value("page").Object().
		Value("id").Raw()

	return requestBody, res, pID.(string)
}

// func addLayerToPage(e *httpexpect.Expect, sId, storyId, pageId, layerId string, swipeable *bool) (GraphQLRequest, *httpexpect.Value, string) {
// 	requestBody := GraphQLRequest{
// 		OperationName: "AddPageLayer",
// 		Query: `mutation AddPageLayer($sceneId: ID!, $storyId: ID!, $pageId: ID!, $layerId: ID!, $swipeable: Boolean) {
// 			addPageLayer( input: {sceneId: $sceneId, storyId: $storyId, pageId: $pageId, swipeable: $swipeable, layerId: $layerId} ) {
// 				story {
// 				 	id
// 					pages{
// 						id
// 					}
// 				}
// 				page{
// 					id
// 					layers{
// 						id
// 					}
// 					swipeableLayers{
// 						id
// 					}
// 				}
// 			}
// 		}`,
// 		Variables: map[string]any{
// 			"sceneId":   sId,
// 			"storyId":   storyId,
// 			"pageId":    pageId,
// 			"layerId":   layerId,
// 			"swipeable": swipeable,
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

// 	pageRes := res.Object().
// 		Value("data").Object().
// 		Value("addPageLayer").Object().
// 		Value("page").Object()

// 	if swipeable != nil && *swipeable {
// 		pageRes.Value("swipeableLayers").Array().
// 			Path("$..id").Array().Contains(layerId)
// 	} else {
// 		pageRes.Value("layers").Array().
// 			Path("$..id").Array().Contains(layerId)
// 	}

// 	return requestBody, res, layerId
// }

// func removeLayerToPage(e *httpexpect.Expect, sId, storyId, pageId, layerId string, swipeable *bool) (GraphQLRequest, *httpexpect.Value, string) {
// 	requestBody := GraphQLRequest{
// 		OperationName: "RemovePageLayer",
// 		Query: `mutation RemovePageLayer($sceneId: ID!, $storyId: ID!, $pageId: ID!, $layerId: ID!, $swipeable: Boolean) {
// 			removePageLayer( input: {sceneId: $sceneId, storyId: $storyId, pageId: $pageId, swipeable: $swipeable, layerId: $layerId} ) {
// 				story {
// 				 	id
// 					pages{
// 						id
// 					}
// 				}
// 				page{
// 					id
// 					layers{
// 						id
// 					}
// 					swipeableLayers{
// 						id
// 					}
// 				}
// 			}
// 		}`,
// 		Variables: map[string]any{
// 			"sceneId":   sId,
// 			"storyId":   storyId,
// 			"pageId":    pageId,
// 			"layerId":   layerId,
// 			"swipeable": swipeable,
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

// 	pageRes := res.Object().
// 		Value("data").Object().
// 		Value("removePageLayer").Object().
// 		Value("page").Object()

// 	if swipeable != nil && *swipeable {
// 		pageRes.Value("swipeableLayers").Array().
// 			Path("$..id").Array().NotContains(layerId)
// 	} else {
// 		pageRes.Value("layers").Array().
// 			Path("$..id").Array().NotContains(layerId)
// 	}

// 	return requestBody, res, layerId
// }

func createBlock(e *httpexpect.Expect, sID, storyID, pageID, pluginId, extensionId string, idx *int) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "CreateStoryBlock",
		Query: `mutation CreateStoryBlock($storyId: ID!, $pageId: ID!, $pluginId: ID!, $extensionId: ID!, $index: Int) {
			createStoryBlock( input: {storyId: $storyId, pageId: $pageId, pluginId: $pluginId, extensionId: $extensionId, index: $index} ) { 
				story {
					id
					pages {
						id
					}
				}
				page {
					id
					title
					swipeable
					blocks {
						id
					}
				}
				block {
					id
				}
			}
		}`,
		Variables: map[string]any{
			"sceneId":     sID,
			"storyId":     storyID,
			"pageId":      pageID,
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
		Value("createStoryBlock").Object().
		Value("page").Object().
		Value("blocks").Array().NotEmpty()

	return requestBody, res, res.Path("$.data.createStoryBlock.block.id").Raw().(string)
}

func removeBlock(e *httpexpect.Expect, storyID, pageID, blockID string) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "RemoveStoryBlock",
		Query: `mutation RemoveStoryBlock($storyId: ID!, $pageId: ID!, $blockId: ID!) {
			removeStoryBlock( input: {storyId: $storyId, pageId: $pageId, blockId: $blockId} ) { 
				story {
					id
					pages {
						id
					}
				}
				page {
					id
					title
					swipeable
					blocks {
						id
					}
				}
				blockId
			}
		}`,
		Variables: map[string]any{
			"storyId": storyID,
			"pageId":  pageID,
			"blockId": blockID,
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
		Path("$.data.removeStoryBlock.page.blocks[:].id").Array().NotContains(blockID)

	return requestBody, res, res.Path("$.data.removeStoryBlock.blockId").Raw().(string)
}

func moveBlock(e *httpexpect.Expect, storyID, pageID, blockID string, index int) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "MoveStoryBlock",
		Query: `mutation MoveStoryBlock($storyId: ID!, $pageId: ID!, $blockId: ID!, $index: Int!) {
			moveStoryBlock( input: {storyId: $storyId, pageId: $pageId, blockId: $blockId, index: $index} ) { 
				story {
					id
					pages {
						id
					}
				}
				page {
					id
					title
					swipeable
					blocks {
						id
					}
				}
				blockId
			}
		}`,
		Variables: map[string]any{
			"storyId": storyID,
			"pageId":  pageID,
			"blockId": blockID,
			"index":   index,
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
		Path("$.data.moveStoryBlock.page.blocks[:].id").Array().Contains(blockID)

	return requestBody, res, res.Path("$.data.moveStoryBlock.blockId").Raw().(string)
}

func TestStoryCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e)

	_, _, sID := createScene(e, pID)

	// fetch scene
	_, res := fetchSceneForStories(e, sID)
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		Length().Equal(0)

	_, _, storyID := createStory(e, sID, "test", 0)

	// fetch scene and check story
	_, res = fetchSceneForStories(e, sID)

	storiesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.Length().Equal(1)
	storiesRes.First().Object().ValueEqual("id", storyID)

	// update story
	_, _ = updateStory(e, storyID, sID)

	// fetch scene and check story
	_, res = fetchSceneForStories(e, sID)
	storiesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.First().Object().ValueEqual("bgColor", "newBG")

	_, _ = deleteStory(e, storyID, sID)
}

func TestStoryPageCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e)

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID1 := createPage(e, sID, storyID, "test", true)

	_, res := fetchSceneForStories(e, sID)
	storiesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.Length().Equal(1)
	storiesRes.First().Object().ValueEqual("id", storyID)

	_, _, dupPageID := duplicatePage(e, sID, storyID, pageID1)

	_, res = fetchSceneForStories(e, sID)
	pagesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		First().Object().Value("pages").Array()
	pagesRes.Length().Equal(2)
	pagesRes.Path("$[:].id").Equal([]string{pageID1, dupPageID})
	pagesRes.Path("$[:].title").Equal([]string{"test", "test (copy)"})

	_, _ = deletePage(e, sID, storyID, dupPageID)

	requestBody, _ := updatePage(e, sID, storyID, pageID1, "test 1", false)

	// update page with invalid page id
	requestBody.Variables["pageId"] = id.NewPageID().String()
	res = e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	res.Object().
		Value("errors").Array().
		Element(0).Object().
		ValueEqual("message", "input: updateStoryPage page not found")

	_, _, pageID2 := createPage(e, sID, storyID, "test 2", true)
	_, _, pageID3 := createPage(e, sID, storyID, "test 3", false)
	_, _, pageID4 := createPage(e, sID, storyID, "test 4", true)

	_, res = fetchSceneForStories(e, sID)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		First().Object().Value("pages").Array()
	pagesRes.Length().Equal(4)
	pagesRes.Path("$[:].id").Equal([]string{pageID1, pageID2, pageID3, pageID4})

	movePage(e, storyID, pageID1, 2)

	_, res = fetchSceneForStories(e, sID)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		First().Object().Value("pages").Array()
	pagesRes.Length().Equal(4)
	pagesRes.Path("$[:].title").Equal([]string{"test 2", "test 3", "test 1", "test 4"})

	deletePage(e, sID, storyID, pageID2)
	deletePage(e, sID, storyID, pageID3)
	deletePage(e, sID, storyID, pageID4)

	_, res = fetchSceneForStories(e, sID)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		First().Object().Value("pages").Array()
	pagesRes.Length().Equal(1)
	pagesRes.Path("$[:].title").Equal([]string{"test 1"})
}

func TestStoryPageLayersCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e)

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, _ = createPage(e, sID, storyID, "test", true)

	_, res := fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].layers").Equal([]any{})

	// rootLayerID := res.Path("$.data.node.rootLayerId").Raw().(string)

	// _, _, layerID := addLayerItemFromPrimitive(e, rootLayerID)

	// _, _, _ = addLayerToPage(e, sID, storyID, pageID, layerID, nil)

	// _, res = fetchSceneForStories(e, sID)
	// res.Object().
	// 	Path("$.data.node.stories[0].pages[0].layers[:].id").Equal([]string{layerID})

	// _, _, _ = removeLayerToPage(e, sID, storyID, pageID, layerID, nil)

	// _, res = fetchSceneForStories(e, sID)
	// res.Object().
	// 	Path("$.data.node.stories[0].pages[0].layers").Equal([]any{})
}

func TestStoryPageBlocksCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e)

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID := createPage(e, sID, storyID, "test", true)

	_, res := fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks").Equal([]any{})

	_, _, blockID1 := createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", nil)
	_, _, blockID2 := createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", nil)

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks[:].id").Equal([]string{blockID1, blockID2})

	_, _, _ = moveBlock(e, storyID, pageID, blockID1, 1)

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks[:].id").Equal([]string{blockID2, blockID1})

	_, _, blockID3 := createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", lo.ToPtr(1))

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks[:].id").Equal([]string{blockID2, blockID3, blockID1})

	removeBlock(e, storyID, pageID, blockID1)
	removeBlock(e, storyID, pageID, blockID2)
	removeBlock(e, storyID, pageID, blockID3)

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks").Equal([]any{})
}

func TestStoryPageBlocksProperties(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e)

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID := createPage(e, sID, storyID, "test", true)

	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", nil)

	_, res := fetchSceneForStories(e, sID)
	propID := res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].propertyId").Raw().(string)

	_, res = updatePropertyValue(e, propID, "default", "", "text", "test value", "STRING")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal("test value")

	_, res = fetchSceneForStories(e, sID)
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[0].fields[0].type").Equal("STRING")
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[0].fields[0].value").Equal("test value")

	p := map[string]any{"left": 0, "right": 1, "top": 2, "bottom": 3}
	_, res = updatePropertyValue(e, propID, "panel", "", "padding", p, "SPACING")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal(p)

	_, res = fetchSceneForStories(e, sID)
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[1].fields[0].type").Equal("SPACING")
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[1].fields[0].value").Equal(p)
}

func TestStoryPublishing(t *testing.T) {
	e, _, g := StartServerAndRepos(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e)

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID := createPage(e, sID, storyID, "test", true)

	extensionId := "textStoryBlock"
	pluginId := "reearth"

	_, _, blockID := createBlock(e, sID, storyID, pageID, pluginId, extensionId, nil)

	_, res := fetchSceneForStories(e, sID)
	blockPropID := res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].propertyId").Raw().(string)

	_, _ = updatePropertyValue(e, blockPropID, "default", "", "text", "test value", "STRING")

	p := map[string]any{"left": 0, "right": 1, "top": 2, "bottom": 3}
	_, _ = updatePropertyValue(e, blockPropID, "panel", "", "padding", p, "SPACING")

	_, _ = publishStory(e, storyID, "test-alias")

	rc, err := g.File.ReadStoryFile(context.Background(), "test-alias")
	assert.NoError(t, err)

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(rc)
	assert.NoError(t, err)

	pub := regexp.MustCompile(fmt.Sprintf(`{"schemaVersion":1,"id":"%s","publishedAt":".*","property":{"tiles":\[{"id":".*"}]},"plugins":{},"layers":null,"widgets":\[],"widgetAlignSystem":null,"tags":\[],"clusters":\[],"story":{"id":"%s","property":{},"pages":\[{"id":"%s","property":{},"title":"test","blocks":\[{"id":"%s","property":{"default":{"text":"test value"},"panel":{"padding":{"top":2,"bottom":3,"left":0,"right":1}}},"plugins":null,"extensionId":"%s","pluginId":"%s"}],"swipeable":true,"swipeableLayers":\[],"layers":\[]}],"position":"left","bgColor":""},"nlsLayers":null,"layerStyles":null,"coreSupport":true,"enableGa":false,"trackingId":""}`, sID, storyID, pageID, blockID, extensionId, pluginId))
	assert.Regexp(t, pub, buf.String())

	resString := e.GET("/p/test-alias/data.json").
		WithHeader("Origin", "https://example.com").
		Expect().
		Status(http.StatusOK).
		Body().
		Raw()

	assert.Regexp(t, pub, resString)
}
