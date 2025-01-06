package e2e

import (
	"testing"

	"golang.org/x/text/language"
)

func TestGetScenePlaceholderEnglish(t *testing.T) {
	e := ServerLanguage(t, language.English)
	pID := createProjectWithExternalImage(e, "test")
	_, _, sID := createScene(e, pID)
	r := getScene(e, sID, language.English.String())

	for _, group := range r.Value("property").Object().Value("schema").Object().Value("groups").Array().Iter() {
		for _, field := range group.Object().Value("fields").Array().Iter() {
			fieldId := field.Object().Value("fieldId").Raw().(string)

			if fieldId == "tile_type" {
				field.Object().Value("translatedPlaceholder").Equal("please enter tile type")
			}
			if fieldId == "tile_url" {
				field.Object().Value("translatedPlaceholder").Equal("please enter tile url")
			}
			if fieldId == "tile_zoomLevel" {
				field.Object().Value("translatedPlaceholder").Equal("please enter tile zoomLevel")
			}
			if fieldId == "tile_opacity" {
				field.Object().Value("translatedPlaceholder").Equal("please enter tile opacity")
			}
		}
	}
}

func TestGetScenePlaceholderJapanese(t *testing.T) {
	e := ServerLanguage(t, language.Japanese)
	pID := createProjectWithExternalImage(e, "test")
	_, _, sID := createScene(e, pID)
	r := getScene(e, sID, language.Japanese.String())

	for _, group := range r.Value("property").Object().Value("schema").Object().Value("groups").Array().Iter() {
		for _, field := range group.Object().Value("fields").Array().Iter() {
			fieldId := field.Object().Value("fieldId").Raw().(string)

			if fieldId == "tile_type" {
				field.Object().Value("translatedPlaceholder").Equal("タイルのタイプを選択")
			}
			if fieldId == "tile_url" {
				field.Object().Value("translatedPlaceholder").Equal("タイルのURLを入力")
			}
			if fieldId == "tile_zoomLevel" {
				field.Object().Value("translatedPlaceholder").Equal("ズームレベルを入力")
			}
			if fieldId == "tile_opacity" {
				field.Object().Value("translatedPlaceholder").Equal("不透明度を入力")
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
	r.Value("newLayers").Array().First().Object().ValueEqual("id", lId)
	r.Value("newLayers").Array().First().Object().ValueEqual("title", "someTitle99")
	r.Value("newLayers").Array().First().Object().ValueEqual("index", 99)

}
