package fs

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestPlugin(t *testing.T) {
	ctx := context.Background()
	fs := NewPlugin(mockPluginFS())
	p, err := fs.FindByID(ctx, plugin.MustID("testplugin~1.0.0"))
	assert.NoError(t, err)
	assert.Equal(t, plugin.New().ID(plugin.MustID("testplugin~1.0.0")).Name(i18n.String{
		"en":    "testplugin",
		"ja":    "テストプラグイン",
		"zh-CN": "测试插件",
	}).MustBuild(), p)
}

func mockPluginFS() afero.Fs {
	files := map[string]string{
		"plugins/testplugin~1.0.0/reearth.yml":       `{ "id": "testplugin", "version": "1.0.0", "name": "testplugin" }`,
		"plugins/testplugin~1.0.0/reearth_ja.yml":    `{ "name": "テストプラグイン" }`,
		"plugins/testplugin~1.0.0/reearth_zh-CN.yml": `{ "name": "测试插件" }`,
	}

	fs := afero.NewMemMapFs()
	for name, content := range files {
		f, _ := fs.Create(name)
		_, _ = f.WriteString(content)
		_ = f.Close()
	}
	return fs
}
