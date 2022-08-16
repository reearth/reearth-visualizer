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
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestAsset_Create(t *testing.T) {
	ctx := context.Background()
	tid := asset.NewTeamID()
	aid := asset.NewID()
	newID := asset.NewID
	asset.NewID = func() asset.ID { return aid }
	t.Cleanup(func() { asset.NewID = newID })

	mfs := afero.NewMemMapFs()
	f, _ := fs.NewFile(mfs, "")
	repos := memory.New()
	transaction := memory.NewTransaction()
	repos.Transaction = transaction
	uc := &Asset{
		repos: repos,
		gateways: &gateway.Container{
			File: f,
		},
	}
	buf := bytes.NewBufferString("Hello")
	buflen := int64(buf.Len())
	res, err := uc.Create(ctx, interfaces.CreateAssetParam{
		TeamID: tid,
		File: &file.File{
			Content:     io.NopCloser(buf),
			Path:        "hoge.txt",
			ContentType: "",
			Size:        buflen,
		},
	}, &usecase.Operator{
		WritableTeams: id.TeamIDList{tid},
	})

	want := asset.New().
		ID(aid).
		Team(tid).
		URL(res.URL()).
		CreatedAt(aid.Timestamp()).
		Name("hoge.txt").
		Size(buflen).
		ContentType("").
		MustBuild()

	assert.NoError(t, err)
	assert.Equal(t, want, res)
	assert.Equal(t, 1, transaction.Committed())
	a, _ := repos.Asset.FindByID(ctx, aid)
	assert.Equal(t, want, a)
}
