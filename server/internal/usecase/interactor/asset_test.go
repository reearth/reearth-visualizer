package interactor

import (
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
