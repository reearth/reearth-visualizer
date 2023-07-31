package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/id"
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

func createScene(e *httpexpect.Expect, pId string) (GraphQLRequest, *httpexpect.Value, string) {
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
			"projectId": pId,
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

	sId := res.Path("$.data.createScene.scene.id").Raw().(string)
	return requestBody, res, sId
}

func fetchSceneForStories(e *httpexpect.Expect, sId string) (GraphQLRequest, *httpexpect.Value) {
	fetchSceneRequestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query: `query GetScene($sceneId: ID!) {
		  node(id: $sceneId, type: SCENE) {
			id
			... on Scene {
			  rootLayerId
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
				}
		 	  }
			  __typename
			}
			__typename
		  }
		}`,
		Variables: map[string]any{
			"sceneId": sId,
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

func createStory(e *httpexpect.Expect, sId, name string, index int) (GraphQLRequest, *httpexpect.Value, string) {
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
			"sceneId": sId,
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

func updateStory(e *httpexpect.Expect, storyId, sId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateStory",
		Query: `mutation UpdateStory($sceneId: ID!, $storyId: ID!, $title: String!, $index: Int) {
			updateStory( input: {sceneId: $sceneId, storyId: $storyId, title: $title, index: $index} ) { 
				story { 
					id
					title
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"storyId": storyId,
			"sceneId": sId,
			"title":   "test2",
			"index":   0,
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

func deleteStory(e *httpexpect.Expect, storyId, sId string) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "DeleteStory",
		Query: `mutation DeleteStory($sceneId: ID!, $storyId: ID!) {
			deleteStory( input: {sceneId: $sceneId, storyId: $storyId} ) { 
				storyId
			}
		}`,
		Variables: map[string]any{
			"storyId": storyId,
			"sceneId": sId,
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
		ValueEqual("storyId", storyId)

	return requestBody, res
}

func createPage(e *httpexpect.Expect, sId, storyId, name string, swipeable bool) (GraphQLRequest, *httpexpect.Value, string) {
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
			"sceneId":   sId,
			"storyId":   storyId,
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

func updatePage(e *httpexpect.Expect, sId, storyId, pageId, name string, swipeable bool) (GraphQLRequest, *httpexpect.Value) {
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
			"sceneId":   sId,
			"storyId":   storyId,
			"pageId":    pageId,
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

func movePage(e *httpexpect.Expect, storyId, pageId string, idx int) (GraphQLRequest, *httpexpect.Value) {
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
			"storyId": storyId,
			"pageId":  pageId,
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

func deletePage(e *httpexpect.Expect, sId, storyId, pageId string) (GraphQLRequest, *httpexpect.Value) {
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
			"sceneId": sId,
			"storyId": storyId,
			"pageId":  pageId,
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
		ValueEqual("pageId", pageId).
		Value("story").Object().
		Value("pages").Array().
		Path("$..id").Array().NotContains(pageId)

	return requestBody, res
}

func duplicatePage(e *httpexpect.Expect, sId, storyId, pageId string) (GraphQLRequest, *httpexpect.Value, string) {
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
			"sceneId": sId,
			"storyId": storyId,
			"pageId":  pageId,
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

	pId := res.Object().
		Value("data").Object().
		Value("duplicateStoryPage").Object().
		Value("page").Object().
		Value("id").Raw()

	return requestBody, res, pId.(string)
}

func addLayerToPage(e *httpexpect.Expect, sId, storyId, pageId, layerId string, swipeable *bool) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddPageLayer",
		Query: `mutation AddPageLayer($sceneId: ID!, $storyId: ID!, $pageId: ID!, $layerId: ID!, $swipeable: Boolean) { 
			addPageLayer( input: {sceneId: $sceneId, storyId: $storyId, pageId: $pageId, swipeable: $swipeable, layerId: $layerId} ) { 
				story {
				 	id
					pages{
						id
					}
				}
				page{
					id
					layers{
						id
					}
					swipeableLayers{
						id
					}
				}
			}
		}`,
		Variables: map[string]any{
			"sceneId":   sId,
			"storyId":   storyId,
			"pageId":    pageId,
			"layerId":   layerId,
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

	pageRes := res.Object().
		Value("data").Object().
		Value("addPageLayer").Object().
		Value("page").Object()

	if swipeable != nil && *swipeable {
		pageRes.Value("swipeableLayers").Array().
			Path("$..id").Array().Contains(layerId)
	} else {
		pageRes.Value("layers").Array().
			Path("$..id").Array().Contains(layerId)
	}

	return requestBody, res, layerId
}

func removeLayerToPage(e *httpexpect.Expect, sId, storyId, pageId, layerId string, swipeable *bool) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "RemovePageLayer",
		Query: `mutation RemovePageLayer($sceneId: ID!, $storyId: ID!, $pageId: ID!, $layerId: ID!, $swipeable: Boolean) { 
			removePageLayer( input: {sceneId: $sceneId, storyId: $storyId, pageId: $pageId, swipeable: $swipeable, layerId: $layerId} ) { 
				story {
				 	id
					pages{
						id
					}
				}
				page{
					id
					layers{
						id
					}
					swipeableLayers{
						id
					}
				}
			}
		}`,
		Variables: map[string]any{
			"sceneId":   sId,
			"storyId":   storyId,
			"pageId":    pageId,
			"layerId":   layerId,
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

	pageRes := res.Object().
		Value("data").Object().
		Value("removePageLayer").Object().
		Value("page").Object()

	if swipeable != nil && *swipeable {
		pageRes.Value("swipeableLayers").Array().
			Path("$..id").Array().NotContains(layerId)
	} else {
		pageRes.Value("layers").Array().
			Path("$..id").Array().NotContains(layerId)
	}

	return requestBody, res, layerId
}

func TestStoryCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pId := createProject(e)

	_, _, sId := createScene(e, pId)

	// fetch scene
	_, res := fetchSceneForStories(e, sId)
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		Length().Equal(0)

	_, _, storyId := createStory(e, sId, "test", 0)

	// fetch scene and check story
	_, res = fetchSceneForStories(e, sId)

	storiesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.Length().Equal(1)
	storiesRes.First().Object().ValueEqual("id", storyId)

	// update story
	_, _ = updateStory(e, storyId, sId)

	_, _ = deleteStory(e, storyId, sId)
}

func TestStoryPageCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pId := createProject(e)

	_, _, sId := createScene(e, pId)

	_, _, storyId := createStory(e, sId, "test", 0)

	_, _, pageId1 := createPage(e, sId, storyId, "test", true)

	_, res := fetchSceneForStories(e, sId)
	storiesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.Length().Equal(1)
	storiesRes.First().Object().ValueEqual("id", storyId)

	_, _, dupPageId := duplicatePage(e, sId, storyId, pageId1)

	_, res = fetchSceneForStories(e, sId)
	pagesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		First().Object().Value("pages").Array()
	pagesRes.Length().Equal(2)
	pagesRes.Path("$[:].id").Equal([]string{pageId1, dupPageId})
	pagesRes.Path("$[:].title").Equal([]string{"test", "test (copy)"})

	_, _ = deletePage(e, sId, storyId, dupPageId)

	requestBody, _ := updatePage(e, sId, storyId, pageId1, "test 1", false)

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

	_, _, pageId2 := createPage(e, sId, storyId, "test 2", true)
	_, _, pageId3 := createPage(e, sId, storyId, "test 3", false)
	_, _, pageId4 := createPage(e, sId, storyId, "test 4", true)

	_, res = fetchSceneForStories(e, sId)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		First().Object().Value("pages").Array()
	pagesRes.Length().Equal(4)
	pagesRes.Path("$[:].id").Equal([]string{pageId1, pageId2, pageId3, pageId4})

	movePage(e, storyId, pageId1, 2)

	_, res = fetchSceneForStories(e, sId)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		First().Object().Value("pages").Array()
	pagesRes.Length().Equal(4)
	pagesRes.Path("$[:].title").Equal([]string{"test 2", "test 3", "test 1", "test 4"})

	deletePage(e, sId, storyId, pageId2)
	deletePage(e, sId, storyId, pageId3)
	deletePage(e, sId, storyId, pageId4)

	_, res = fetchSceneForStories(e, sId)
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

	pId := createProject(e)

	_, _, sId := createScene(e, pId)

	_, _, storyId := createStory(e, sId, "test", 0)

	_, _, pageId := createPage(e, sId, storyId, "test", true)

	_, res := fetchSceneForStories(e, sId)
	res.Object().
		Path("$.data.node.stories[0].pages[0].layers").Equal([]any{})

	rootLayerId := res.Path("$.data.node.rootLayerId").Raw().(string)

	_, _, layerId := addLayerItemFromPrimitive(e, rootLayerId)

	_, _, _ = addLayerToPage(e, sId, storyId, pageId, layerId, nil)

	_, res = fetchSceneForStories(e, sId)
	res.Object().
		Path("$.data.node.stories[0].pages[0].layers[:].id").Equal([]string{layerId})

	_, _, _ = removeLayerToPage(e, sId, storyId, pageId, layerId, nil)

	_, res = fetchSceneForStories(e, sId)
	res.Object().
		Path("$.data.node.stories[0].pages[0].layers").Equal([]any{})
}
