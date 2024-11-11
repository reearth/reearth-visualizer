package e2e

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost

// go test -v -run TestGetScenePlaceholderEnglish ./e2e/...
func TestGetScenePlaceholderEnglish(t *testing.T) {

	e := StartServer(
		t,
		&config.Config{
			Origins: []string{"https://example.com"},
			AuthSrv: config.AuthSrvConfig{
				Disabled: true,
			},
		},
		true,
		// English user Seeder
		func(ctx context.Context, r *repo.Container) error {
			return baseSeederWithLang(ctx, r, language.English)
		},
	)
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

// go test -v -run TestGetScenePlaceholderJapanese ./e2e/...

func TestGetScenePlaceholderJapanese(t *testing.T) {

	e := StartServer(
		t,
		&config.Config{
			Origins: []string{"https://example.com"},
			AuthSrv: config.AuthSrvConfig{
				Disabled: true,
			},
		},
		true,
		// Japanese user Seeder
		func(ctx context.Context, r *repo.Container) error {
			return baseSeederWithLang(ctx, r, language.Japanese)
		},
	)
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
