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

func createScene(e *httpexpect.Expect, pId string) string {
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
	return sId
}

func TestStoryCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, false, baseSeeder)

	pId := createProject(e)

	sId := createScene(e, pId)

	// create story
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
			"title":   "test",
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
		Value("createStory").Object().
		Value("story").Object().
		ValueEqual("title", "test")

	storyId := res.Path("$.data.createStory.story.id").Raw().(string)

	// update story
	requestBody = GraphQLRequest{
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

	res = e.POST("/api/graphql").
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

	// delete story
	requestBody = GraphQLRequest{
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

	res = e.POST("/api/graphql").
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
}

func TestStoryPageCRUD(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pId := createProject(e)

	sId := createScene(e, pId)

	// create story
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
			"title":   "test",
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

	storyId := res.Path("$.data.createStory.story.id").Raw().(string)

	// create page
	requestBody = GraphQLRequest{
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
			"title":     "test",
			"swipeable": true,
		},
	}

	res = e.POST("/api/graphql").
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
		ValueEqual("title", "test").
		ValueEqual("swipeable", true)

	pageId := res.Path("$.data.createStoryPage.page.id").Raw().(string)

	// update page
	requestBody = GraphQLRequest{
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
			"title":     "test 2",
			"swipeable": false,
		},
	}

	res = e.POST("/api/graphql").
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
		ValueEqual("title", "test 2").
		ValueEqual("swipeable", false)

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

	// delete page
	requestBody = GraphQLRequest{
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

	res = e.POST("/api/graphql").
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
		Value("pages").Array().Empty()

}
