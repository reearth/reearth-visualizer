package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"image"
	"image/color"
	"image/png"
	"io"
	"strings"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	pkgimage "github.com/reearth/reearth/server/pkg/image"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAsset_Create(t *testing.T) {
	ctx := context.Background()

	ws := accountsWorkspace.New().NewID().MustBuild()
	pid := id.NewProjectID()

	gFile, err := fs.NewFile(afero.NewMemMapFs(), "")
	assert.NoError(t, err)

	wsRepo := accountsInfra.NewMemoryWorkspace()
	_ = wsRepo.Save(ctx, ws)

	uContainer := &Asset{
		repos: &repo.Container{
			Asset:     memory.NewAsset(),
			Workspace: wsRepo,
		},
		gateways: &gateway.Container{
			File: gFile,
		},
	}

	buf := bytes.NewBufferString("Hello")
	buflen := int64(buf.Len())

	res, err := uContainer.Create(ctx, interfaces.CreateAssetParam{
		WorkspaceID: ws.ID(),
		CoreSupport: true,
		ProjectID:   &pid,
		File: &file.File{
			Content:     io.NopCloser(buf),
			Path:        "hoge.txt",
			ContentType: "",
			Size:        buflen,
		},
	}, &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
		},
	})
	assert.NoError(t, err)

	want := asset.New().
		ID(res.ID()).
		Workspace(ws.ID()).
		Project(&pid).
		URL(res.URL()).
		CreatedAt(res.ID().Timestamp()).
		Name("hoge.txt").
		Size(buflen).
		ContentType("").
		CoreSupport(true).
		MustBuild()

	assert.NoError(t, err)
	assert.Equal(t, want, res)
	_, err = uContainer.repos.Asset.FindByID(ctx, res.ID())
	assert.Nil(t, err)
	assert.Equal(t, want, res)
}

func TestAsset_CreateIconAsset(t *testing.T) {
	ctx := context.Background()

	ws := accountsWorkspace.New().NewID().MustBuild()
	pid := id.NewProjectID()

	gFile, err := fs.NewFile(afero.NewMemMapFs(), "")
	require.NoError(t, err)

	wsRepo := accountsInfra.NewMemoryWorkspace()
	_ = wsRepo.Save(ctx, ws)

	uContainer := &Asset{
		repos: &repo.Container{
			Asset:     memory.NewAsset(),
			Workspace: wsRepo,
		},
		gateways: &gateway.Container{
			File: gFile,
		},
	}

	operator := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	t.Run("success with valid PNG image", func(t *testing.T) {
		imgBuf := createTestPNGImage(100, 100)

		res, err := uContainer.CreateIconAsset(ctx, interfaces.CreateIconAssetParam{
			WorkspaceID: ws.ID(),
			ProjectID:   &pid,
			File: &file.File{
				Content:     io.NopCloser(bytes.NewReader(imgBuf)),
				Path:        "test-icon.png",
				ContentType: "image/png",
				Size:        int64(len(imgBuf)),
			},
		}, operator)

		require.NoError(t, err)
		assert.NotNil(t, res)
		assert.True(t, strings.HasSuffix(res.Name(), ".png"))
		assert.Equal(t, "image/png", res.ContentType())
		assert.True(t, res.CoreSupport())
		assert.Equal(t, ws.ID(), res.Workspace())
		assert.Equal(t, &pid, res.Project())
	})

	t.Run("success with JPEG image converted to PNG", func(t *testing.T) {
		imgBuf := createTestPNGImage(200, 150)

		res, err := uContainer.CreateIconAsset(ctx, interfaces.CreateIconAssetParam{
			WorkspaceID: ws.ID(),
			ProjectID:   &pid,
			File: &file.File{
				Content:     io.NopCloser(bytes.NewReader(imgBuf)),
				Path:        "test-icon.jpg",
				ContentType: "image/jpeg",
				Size:        int64(len(imgBuf)),
			},
		}, operator)

		require.NoError(t, err)
		assert.NotNil(t, res)
		assert.True(t, strings.HasSuffix(res.Name(), ".png"))
	})

	t.Run("error when file is nil", func(t *testing.T) {
		_, err := uContainer.CreateIconAsset(ctx, interfaces.CreateIconAssetParam{
			WorkspaceID: ws.ID(),
			ProjectID:   &pid,
			File:        nil,
		}, operator)

		assert.ErrorIs(t, err, interfaces.ErrFileNotIncluded)
	})

	t.Run("error when operator has no permission", func(t *testing.T) {
		imgBuf := createTestPNGImage(100, 100)
		noPermOperator := &usecase.Operator{
			AcOperator: &accountsWorkspace.Operator{
				WritableWorkspaces: accountsID.WorkspaceIDList{},
			},
		}

		_, err := uContainer.CreateIconAsset(ctx, interfaces.CreateIconAssetParam{
			WorkspaceID: ws.ID(),
			ProjectID:   &pid,
			File: &file.File{
				Content:     io.NopCloser(bytes.NewReader(imgBuf)),
				Path:        "test-icon.png",
				ContentType: "image/png",
				Size:        int64(len(imgBuf)),
			},
		}, noPermOperator)

		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
	})

	t.Run("error when image format is invalid", func(t *testing.T) {
		invalidData := []byte("not an image")

		_, err := uContainer.CreateIconAsset(ctx, interfaces.CreateIconAssetParam{
			WorkspaceID: ws.ID(),
			ProjectID:   &pid,
			File: &file.File{
				Content:     io.NopCloser(bytes.NewReader(invalidData)),
				Path:        "invalid.png",
				ContentType: "image/png",
				Size:        int64(len(invalidData)),
			},
		}, operator)

		assert.ErrorContains(t, err, "invalid icon image")
	})

	t.Run("error when file size exceeds limit", func(t *testing.T) {
		imgBuf := createTestPNGImage(100, 100)

		_, err := uContainer.CreateIconAsset(ctx, interfaces.CreateIconAssetParam{
			WorkspaceID: ws.ID(),
			ProjectID:   &pid,
			File: &file.File{
				Content:     io.NopCloser(bytes.NewReader(imgBuf)),
				Path:        "large.png",
				ContentType: "image/png",
				Size:        pkgimage.MaxUploadSize + 1,
			},
		}, operator)

		assert.ErrorIs(t, err, interfaces.ErrIconImageTooLarge)
	})
}

// TestAsset_ImportAssetFiles_RewritesAllURLs is a regression test for SCA-03/SCA-08:
// the per-asset bytes.Replace calls in this loop used to run immediately against
// *data, one full-buffer copy per asset; they're now accumulated and applied in a
// single batched pass via replaceIDsInPlace after the loop. This confirms that
// batching didn't drop or mis-order any replacement -- every asset's URL in the
// buffer is rewritten, not just the last one.
func TestAsset_ImportAssetFiles_RewritesAllURLs(t *testing.T) {
	ctx := adapter.AttachCurrentHost(context.Background(), "https://visualizer.example.com")

	ws := accountsWorkspace.New().NewID().MustBuild()
	prj := project.New().NewID().Workspace(ws.ID()).MustBuild()

	gFile, err := fs.NewFile(afero.NewMemMapFs(), "")
	require.NoError(t, err)

	wsRepo := accountsInfra.NewMemoryWorkspace()
	require.NoError(t, wsRepo.Save(ctx, ws))

	uContainer := &Asset{
		repos: &repo.Container{
			Asset:     memory.NewAsset(),
			Workspace: wsRepo,
		},
		gateways: &gateway.Container{
			File: gFile,
		},
	}

	operator := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	// Three assets so a batching bug that only preserves e.g. the first/last
	// replacement would show up clearly, not accidentally pass with two.
	beforeNames := []string{"before1.png", "before2.png", "before3.png"}

	buf := &bytes.Buffer{}
	zipWriter := zip.NewWriter(buf)
	for _, name := range beforeNames {
		w, err := zipWriter.Create(name)
		require.NoError(t, err)
		_, err = w.Write([]byte("asset-bytes-" + name))
		require.NoError(t, err)
	}
	require.NoError(t, zipWriter.Close())

	zr, err := zip.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	require.NoError(t, err)

	assets := make(map[string]*zip.File, len(zr.File))
	assetNamesJSON := make(map[string]string, len(zr.File))
	dataStr := `{"assets":{`
	for i, f := range zr.File {
		assets[f.Name] = f
		assetNamesJSON[f.Name] = f.Name
		if i > 0 {
			dataStr += ","
		}
		dataStr += `"` + f.Name + `":"` + f.Name + `"`
	}
	dataStr += `},"refs":[`
	for i, name := range beforeNames {
		if i > 0 {
			dataStr += ","
		}
		dataStr += `"https://visualizer.example.com/assets/` + name + `"`
	}
	dataStr += `]}`
	data := []byte(dataStr)

	resultData, result, err := uContainer.ImportAssetFiles(ctx, assets, &data, prj, operator)
	require.NoError(t, err)
	require.Len(t, result, len(beforeNames), "every asset should produce a result entry")

	got := string(*resultData)
	for _, name := range beforeNames {
		assert.NotContains(t, got, "https://visualizer.example.com/assets/"+name,
			"the pre-import URL for %s must not survive the batched replacement", name)
	}

	// Every afterName the function actually assigned must appear in the rewritten
	// buffer -- confirms the batched pass applied all three pairs, not just one.
	for afterName := range result {
		assert.Contains(t, got, "https://visualizer.example.com/assets/"+afterName)
	}
}

func createTestPNGImage(width, height int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{R: uint8(x % 256), G: uint8(y % 256), B: 128, A: 255})
		}
	}
	var buf bytes.Buffer
	_ = png.Encode(&buf, img)
	return buf.Bytes()
}
