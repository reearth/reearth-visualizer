package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"path"
	"strings"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func pluginZipEntries(t *testing.T, files map[string]string) map[string]*zip.File {
	t.Helper()
	buf := &bytes.Buffer{}
	w := zip.NewWriter(buf)
	for name, content := range files {
		f, err := w.Create(name)
		require.NoError(t, err)
		_, err = f.Write([]byte(content))
		require.NoError(t, err)
	}
	require.NoError(t, w.Close())

	r, err := zip.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	require.NoError(t, err)
	entries := map[string]*zip.File{}
	for _, f := range r.File {
		entries[strings.TrimPrefix(f.Name, "plugins/")] = f
	}
	return entries
}

func readMemFile(t *testing.T, mfs afero.Fs, name string) (string, bool) {
	t.Helper()
	b, err := afero.ReadFile(mfs, name)
	if err != nil {
		return "", false
	}
	return string(b), true
}

func TestImportPlugins_PluginFileScope(t *testing.T) {
	oldSceneID := id.NewSceneID()
	newSceneID := id.NewSceneID()
	otherSceneID := id.NewSceneID()

	victimPath := path.Join("plugins", otherSceneID.String()+"~victim~1.0.0", "index.js")

	tests := []struct {
		name      string
		files     map[string]string
		wantErr   string
		wantFiles map[string]string
	}{
		{
			name: "own scene plugin is moved to the new scene",
			files: map[string]string{
				"plugins/" + oldSceneID.String() + "~mine~1.0.0/index.js": "mine",
			},
			wantFiles: map[string]string{
				path.Join("plugins", newSceneID.String()+"~mine~1.0.0", "index.js"): "mine",
			},
		},
		{
			name: "plugin of another scene is rejected",
			files: map[string]string{
				"plugins/" + otherSceneID.String() + "~victim~1.0.0/index.js": "attacker",
			},
			wantErr: "does not belong to the imported scene",
		},
		{
			name: "plugin without a scene is rejected",
			files: map[string]string{
				"plugins/victim~1.0.0/index.js": "attacker",
			},
			wantErr: "does not belong to the imported scene",
		},
		{
			name: "system plugin is rejected",
			files: map[string]string{
				"plugins/reearth/index.js": "attacker",
			},
			wantErr: "does not belong to the imported scene",
		},
		{
			name: "path without a file name is rejected",
			files: map[string]string{
				"plugins/" + oldSceneID.String() + "~mine~1.0.0": "x",
			},
			wantErr: "invalid plugin file path",
		},
		{
			name: "nothing is written when any plugin is rejected",
			files: map[string]string{
				"plugins/" + oldSceneID.String() + "~mine~1.0.0/index.js":     "mine",
				"plugins/" + otherSceneID.String() + "~victim~1.0.0/index.js": "attacker",
			},
			wantErr: "does not belong to the imported scene",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx := context.Background()
			mfs := afero.NewMemMapFs()
			require.NoError(t, afero.WriteFile(mfs, victimPath, []byte("original"), 0o644))

			db := memory.New()
			sce, err := scene.New().ID(newSceneID).Workspace(accountsID.NewWorkspaceID()).Project(id.NewProjectID()).Build()
			require.NoError(t, err)

			p := NewPlugin(db, &gateway.Container{
				File: lo.Must(fs.NewFile(mfs, "https://example.com")),
			})

			data := []byte(`{"plugins": [], "schemas": []}`)
			_, err = p.ImportPlugins(ctx, pluginZipEntries(t, tt.files), oldSceneID.String(), sce, &data)

			if tt.wantErr != "" {
				require.Error(t, err)
				assert.Contains(t, err.Error(), tt.wantErr)
				newScenePlugins, _ := afero.Glob(mfs, path.Join("plugins", newSceneID.String()+"*"))
				assert.Empty(t, newScenePlugins)
				_, scenelessWritten := readMemFile(t, mfs, path.Join("plugins", "victim~1.0.0", "index.js"))
				assert.False(t, scenelessWritten)
				_, systemWritten := readMemFile(t, mfs, path.Join("plugins", "reearth", "index.js"))
				assert.False(t, systemWritten)
			} else {
				require.NoError(t, err)
			}

			for name, want := range tt.wantFiles {
				got, ok := readMemFile(t, mfs, name)
				require.True(t, ok, "missing %s", name)
				assert.Equal(t, want, got)
			}

			victim, ok := readMemFile(t, mfs, victimPath)
			require.True(t, ok)
			assert.Equal(t, "original", victim)
		})
	}
}
