package interactor

import (
	"archive/zip"
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestImportPlugins_MissingSingleOnlyDoesNotPanic(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	prj, _ := project.New().NewID().Build()
	_ = db.Project.Save(ctx, prj)
	sce, _ := scene.New().NewID().Workspace(accountsID.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, sce)

	p := NewPlugin(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	data := []byte(`{
		"plugins": [
			{
				"id": "myplugin~1.0.0",
				"name": "My Plugin",
				"version": "1.0.0",
				"description": "",
				"author": "",
				"repositoryUrl": "",
				"extensions": [
					{
						"extensionId": "ext1",
						"pluginId": "myplugin~1.0.0",
						"type": "PRIMITIVE",
						"name": "Ext",
						"description": "",
						"icon": "",
						"propertySchemaId": "myplugin~1.0.0/schema1"
					}
				]
			}
		],
		"schemas": []
	}`)

	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("ImportPlugins panicked on a plugin extension with no singleOnly field: %v", r)
		}
	}()

	result, err := p.ImportPlugins(ctx, map[string]*zip.File{}, sce.ID().String(), sce, &data)
	require.NoError(t, err)
	assert.Equal(t, i18n.StringFrom("My Plugin"), result["plugin0"])
}
