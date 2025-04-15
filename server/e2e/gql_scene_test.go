package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	"golang.org/x/text/language"
)

func TestGetScenePlaceholderEnglish(t *testing.T) {
	e := ServerLanguage(t, language.English)
	pID := createProjectWithExternalImage(e, "test")
	_, _, sID := createScene(e, pID)
	r := getScene(e, sID, language.English.String())

	for _, group := range r.Object().Value("property").Object().Value("schema").Object().Value("groups").Array().Iter() {
		for _, field := range group.Object().Value("fields").Array().Iter() {
			fieldId := field.Object().Value("fieldId").Raw().(string)

			if fieldId == "tile_type" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile type")
			}
			if fieldId == "tile_url" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile url")
			}
			if fieldId == "tile_zoomLevel" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile zoom level")
			}
			if fieldId == "tile_opacity" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile opacity")
			}
		}
	}
}

func TestGetScenePlaceholderJapanese(t *testing.T) {
	e := ServerLanguage(t, language.Japanese)
	pID := createProjectWithExternalImage(e, "test")
	_, _, sID := createScene(e, pID)
	r := getScene(e, sID, language.Japanese.String())

	for _, group := range r.Object().Value("property").Object().Value("schema").Object().Value("groups").Array().Iter() {
		for _, field := range group.Object().Value("fields").Array().Iter() {
			fieldId := field.Object().Value("fieldId").Raw().(string)

			if fieldId == "tile_type" {
				field.Object().Value("translatedPlaceholder").IsEqual("タイルのタイプを選択")
			}
			if fieldId == "tile_url" {
				field.Object().Value("translatedPlaceholder").IsEqual("タイルのURLを入力")
			}
			if fieldId == "tile_zoomLevel" {
				field.Object().Value("translatedPlaceholder").IsEqual("ズームレベルを入力")
			}
			if fieldId == "tile_opacity" {
				field.Object().Value("translatedPlaceholder").IsEqual("不透明度を入力")
			}
		}
	}
}

// go test -v -run TestGetScene ./e2e/...

func TestGetSceneNLSLayer(t *testing.T) {
	e := Server(t, baseSeeder)
	pId := createProject(e, "test")
	_, _, sId := createScene(e, pId)
	_, _, lId := addNLSLayerSimple(e, sId, "someTitle99", 99)

	r := getScene(e, sId, language.Und.String())
	r.Object().Value("newLayers").Array().Value(0).Object().HasValue("id", lId)
	r.Object().Value("newLayers").Array().Value(0).Object().HasValue("title", "someTitle99")
	r.Object().Value("newLayers").Array().Value(0).Object().HasValue("index", 99)

}

func createProjectWithExternalImage(e *httpexpect.Expect, name string) string {
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query: `mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $coreSupport: Boolean) {
			createProject( input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, coreSupport: $coreSupport} ) { 
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
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": true,
		},
	}
	res := Request(e, uID.String(), requestBody)
	return res.Path("$.data.createProject.project.id").Raw().(string)
}
