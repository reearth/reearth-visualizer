package e2e

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func createProject(e *httpexpect.Expect, name string) string {
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
			"name":        name,
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": true,
		},
	}

	res := Request(e, uID.String(), requestBody)

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

	res := Request(e, uID.String(), requestBody)

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
			  rootLayerId
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

	res := Request(e, uID.String(), fetchSceneRequestBody)

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("createStory").Object().
		Value("story").Object().
		HasValue("title", name)

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("updateStory").Object().
		Value("story").Object().
		HasValue("title", "test2")

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("deleteStory").Object().
		HasValue("storyId", storyID)

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("publishStory").Object().
		Value("story").Object().
		HasValue("id", storyID)

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("createStoryPage").Object().
		Value("page").Object().
		HasValue("title", name).
		HasValue("swipeable", swipeable)

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("updateStoryPage").Object().
		Value("page").Object().
		HasValue("title", name).
		HasValue("swipeable", swipeable)

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

	res := Request(e, uID.String(), requestBody)

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("removeStoryPage").Object().
		HasValue("pageId", pageID).
		Value("story").Object().
		Value("pages").Array().
		Path("$..id").Array().NotContainsAll(pageID)

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

	res := Request(e, uID.String(), requestBody)

	pID := res.Object().
		Value("data").Object().
		Value("duplicateStoryPage").Object().
		Value("page").Object().
		Value("id").Raw()

	return requestBody, res, pID.(string)
}

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Value("data").Object().
		Value("createStoryBlock").Object().
		Value("page").Object().
		Value("blocks").Array().NotEmpty()

	return requestBody, res, res.Path("$.data.createStoryBlock.block.id").Raw().(string)
}

func removeBlock(e *httpexpect.Expect, storyID, pageID, blockID string, last bool) (GraphQLRequest, *httpexpect.Value, string) {
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

	res := Request(e, uID.String(), requestBody)

	if last {
		res.Object().
			Path("$.data.removeStoryBlock.page.blocks[:].id").IsNull()
	} else {
		res.Object().
			Path("$.data.removeStoryBlock.page.blocks[:].id").Array().NotConsistsOf(blockID)
	}

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

	res := Request(e, uID.String(), requestBody)

	res.Object().
		Path("$.data.moveStoryBlock.page.blocks[:].id").Array().ContainsAll(blockID)

	return requestBody, res, res.Path("$.data.moveStoryBlock.blockId").Raw().(string)
}

func TestStoryCRUD(t *testing.T) {
	e := Server(t, baseSeeder)

	pID := createProject(e, "test")

	_, _, sID := createScene(e, pID)

	// fetch scene
	_, res := fetchSceneForStories(e, sID)
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		Length().IsEqual(0)

	_, _, storyID := createStory(e, sID, "test", 0)

	// fetch scene and check story
	_, res = fetchSceneForStories(e, sID)

	storiesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.Length().IsEqual(1)
	storiesRes.Value(0).Object().HasValue("id", storyID)

	// update story
	_, _ = updateStory(e, storyID, sID)

	// fetch scene and check story
	_, res = fetchSceneForStories(e, sID)
	storiesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.Value(0).Object().HasValue("bgColor", "newBG")

	_, _ = deleteStory(e, storyID, sID)
}

func TestStoryPageCRUD(t *testing.T) {
	e := Server(t, baseSeeder)

	pID := createProject(e, "test")

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID1 := createPage(e, sID, storyID, "test", true)

	_, res := fetchSceneForStories(e, sID)
	storiesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array()
	storiesRes.Length().IsEqual(1)
	storiesRes.Value(0).Object().HasValue("id", storyID)

	_, _, dupPageID := duplicatePage(e, sID, storyID, pageID1)

	_, res = fetchSceneForStories(e, sID)
	pagesRes := res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		Value(0).Object().Value("pages").Array()
	pagesRes.Length().IsEqual(2)
	pagesRes.Path("$[:].id").IsEqual([]string{pageID1, dupPageID})
	pagesRes.Path("$[:].title").IsEqual([]string{"test", "test (copy)"})

	_, _ = deletePage(e, sID, storyID, dupPageID)

	requestBody, _ := updatePage(e, sID, storyID, pageID1, "test 1", false)

	// update page with invalid page id
	requestBody.Variables["pageId"] = id.NewPageID().String()
	res = Request(e, uID.String(), requestBody)

	res.Object().
		Value("errors").Array().
		Value(0).Object().
		HasValue("message", "page not found")

	_, _, pageID2 := createPage(e, sID, storyID, "test 2", true)
	_, _, pageID3 := createPage(e, sID, storyID, "test 3", false)
	_, _, pageID4 := createPage(e, sID, storyID, "test 4", true)

	_, res = fetchSceneForStories(e, sID)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		Value(0).Object().Value("pages").Array()
	pagesRes.Length().IsEqual(4)
	pagesRes.Path("$[:].id").IsEqual([]string{pageID1, pageID2, pageID3, pageID4})

	movePage(e, storyID, pageID1, 2)

	_, res = fetchSceneForStories(e, sID)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		Value(0).Object().Value("pages").Array()
	pagesRes.Length().IsEqual(4)
	pagesRes.Path("$[:].title").IsEqual([]string{"test 2", "test 3", "test 1", "test 4"})

	deletePage(e, sID, storyID, pageID2)
	deletePage(e, sID, storyID, pageID3)
	deletePage(e, sID, storyID, pageID4)

	_, res = fetchSceneForStories(e, sID)
	pagesRes = res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("stories").Array().
		Value(0).Object().Value("pages").Array()
	pagesRes.Length().IsEqual(1)
	pagesRes.Path("$[:].title").IsEqual([]string{"test 1"})
}

func TestStoryPageBlocksCRUD(t *testing.T) {
	e := Server(t, baseSeeder)

	pID := createProject(e, "test")

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID := createPage(e, sID, storyID, "test", true)

	_, res := fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks").IsEqual([]any{})

	_, _, blockID1 := createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", nil)
	_, _, blockID2 := createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", nil)

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks[:].id").IsEqual([]string{blockID1, blockID2})

	_, _, _ = moveBlock(e, storyID, pageID, blockID1, 1)

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks[:].id").IsEqual([]string{blockID2, blockID1})

	_, _, blockID3 := createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", lo.ToPtr(1))

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks[:].id").IsEqual([]string{blockID2, blockID3, blockID1})

	removeBlock(e, storyID, pageID, blockID1, false)
	removeBlock(e, storyID, pageID, blockID2, false)
	removeBlock(e, storyID, pageID, blockID3, true)

	_, res = fetchSceneForStories(e, sID)
	res.Object().
		Path("$.data.node.stories[0].pages[0].blocks").IsEqual([]any{})
}

func TestStoryPageBlocksProperties(t *testing.T) {
	e := Server(t, baseSeeder)

	pID := createProject(e, "test")

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID := createPage(e, sID, storyID, "test", true)

	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "textStoryBlock", nil)

	_, res := fetchSceneForStories(e, sID)
	propID := res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].propertyId").Raw().(string)

	_, res = updatePropertyValue(e, propID, "default", "", "text", "test value", "STRING")
	res.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("test value")

	_, res = fetchSceneForStories(e, sID)
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[0].fields[0].type").IsEqual("STRING")
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[0].fields[0].value").IsEqual("test value")

	p := map[string]any{"left": 0, "right": 1, "top": 2, "bottom": 3}
	_, res = updatePropertyValue(e, propID, "panel", "", "padding", p, "SPACING")
	res.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(p)

	_, res = fetchSceneForStories(e, sID)
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[1].fields[0].type").IsEqual("SPACING")
	res.Object().Path("$.data.node.stories[0].pages[0].blocks[0].property.items[1].fields[0].value").IsEqual(p)
}

func TestStoryPublishing(t *testing.T) {
	e, _, g := StartServerAndRepos(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e, "test")

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

	expected := fmt.Sprintf(`{
    "clusters": [],
    "coreSupport": true,
    "enableGa": false,
    "id": "%s",
    "layerStyles": null,
    "layers": null,
    "nlsLayers": null,
    "plugins": {},
    "property": {
        "tiles": [
            {
                "id": ".*"
            }
        ]
    },
    "publishedAt": ".*",
    "schemaVersion": 1,
    "story": {
        "bgColor": "",
        "id": "%s",
        "pages": [
            {
                "blocks": [
                    {
                        "extensionId": "%s",
                        "id": "%s",
                        "pluginId": "reearth",
                        "plugins": null,
                        "property": {
                            "default": {
                                "text": "test value"
                            },
                            "panel": {
                                "padding": {
                                    "bottom": 3,
                                    "left": 0,
                                    "right": 1,
                                    "top": 2
                                }
                            }
                        }
                    }
                ],
                "id": "%s",
                "layers": [],
                "property": {},
                "swipeable": true,
                "swipeableLayers": [],
                "title": "test"
            }
        ],
        "position": "left",
        "property": {},
        "title": ""
    },
    "tags": [],
    "trackingId": "",
    "widgetAlignSystem": {
        "inner": null,
        "outer": {
            "center": null,
            "left": {
                "bottom": {
                    "align": "start",
                    "background": null,
                    "centered": false,
                    "gap": null,
                    "padding": null,
                    "widgetIds": [
                        ".*"
                    ]
                },
                "middle": null,
                "top": null
            },
            "right": null
        }
    },
    "widgets": [
        {
            "enabled": true,
            "extended": false,
            "extensionId": "dataAttribution",
            "id": ".*",
            "pluginId": "%s",
            "property": {}
        }
    ]
}`, sID, storyID, extensionId, blockID, pageID, pluginId)

	RegexpJSONEReadCloser(t, rc, expected)

	resString := e.GET("/p/test-alias/data.json").
		WithHeader("Origin", "https://example.com").
		Expect().
		Status(http.StatusOK).
		Body().
		Raw()

	JSONEqRegexp(t, resString, expected)

}
