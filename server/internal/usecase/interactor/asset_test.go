package interactor

import (
	"bytes"
	"context"
	"io"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestAsset_Create(t *testing.T) {
	ctx := context.Background()
	aid := asset.NewID()
	defer asset.MockNewID(aid)()

	ws := workspace.New().NewID().MustBuild()

	mfs := afero.NewMemMapFs()
	f, _ := fs.NewFile(mfs, "")

	transaction := memory.NewTransaction()
	uc := &Asset{
		repos: &repo.Container{
			Asset:       memory.NewAsset(),
			Workspace:   memory.NewWorkspaceWith(ws),
			Transaction: transaction,
		},
		gateways: &gateway.Container{
			File: f,
		},
	}

	buf := bytes.NewBufferString("Hello")
	buflen := int64(buf.Len())
	res, err := uc.Create(ctx, interfaces.CreateAssetParam{
		WorkspaceID: ws.ID(),
		File: &file.File{
			Content:     io.NopCloser(buf),
			Path:        "hoge.txt",
			ContentType: "",
			Size:        buflen,
		},
	}, &usecase.Operator{
		WritableWorkspaces: id.WorkspaceIDList{ws.ID()},
	})
	assert.NoError(t, err)

	want := asset.New().
		ID(aid).
		Workspace(ws.ID()).
		URL(res.URL()).
		CreatedAt(aid.Timestamp()).
		Name("hoge.txt").
		Size(buflen).
		ContentType("").
		MustBuild()

	assert.NoError(t, err)
	assert.Equal(t, want, res)
	assert.Equal(t, 1, transaction.Committed())
	a, _ := uc.repos.Asset.FindByID(ctx, aid)
	assert.Equal(t, want, a)
}
