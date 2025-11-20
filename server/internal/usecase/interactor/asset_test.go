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
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/usecasex"
)

// Mock workspace repo for testing
type mockWorkspaceRepo struct {
	wsID accountsID.WorkspaceID
}

func (m *mockWorkspaceRepo) Filtered(accountsRepo.WorkspaceFilter) accountsRepo.Workspace { return m }
func (m *mockWorkspaceRepo) FindByID(context.Context, accountsID.WorkspaceID) (*accountsWorkspace.Workspace, error) {
	return nil, nil
}
func (m *mockWorkspaceRepo) FindByName(context.Context, string) (*accountsWorkspace.Workspace, error) {
	return nil, nil
}
func (m *mockWorkspaceRepo) FindByAlias(context.Context, string) (*accountsWorkspace.Workspace, error) {
	return nil, nil
}
func (m *mockWorkspaceRepo) FindByIDs(context.Context, accountsID.WorkspaceIDList) ([]*accountsWorkspace.Workspace, error) {
	return nil, nil
}
func (m *mockWorkspaceRepo) FindByUser(context.Context, accountsID.UserID) ([]*accountsWorkspace.Workspace, error) {
	return nil, nil
}
func (m *mockWorkspaceRepo) FindByUserWithPagination(context.Context, accountsID.UserID, *usecasex.Pagination) ([]*accountsWorkspace.Workspace, *usecasex.PageInfo, error) {
	return nil, nil, nil
}
func (m *mockWorkspaceRepo) FindByIntegration(context.Context, accountsID.IntegrationID) ([]*accountsWorkspace.Workspace, error) {
	return nil, nil
}
func (m *mockWorkspaceRepo) FindByIntegrations(context.Context, accountsID.IntegrationIDList) ([]*accountsWorkspace.Workspace, error) {
	return nil, nil
}
func (m *mockWorkspaceRepo) CheckWorkspaceAliasUnique(context.Context, accountsID.WorkspaceID, string) error {
	return nil
}
func (m *mockWorkspaceRepo) Create(context.Context, *accountsWorkspace.Workspace) error     { return nil }
func (m *mockWorkspaceRepo) Save(context.Context, *accountsWorkspace.Workspace) error       { return nil }
func (m *mockWorkspaceRepo) SaveAll(context.Context, []*accountsWorkspace.Workspace) error  { return nil }
func (m *mockWorkspaceRepo) Remove(context.Context, accountsID.WorkspaceID) error           { return nil }
func (m *mockWorkspaceRepo) RemoveAll(context.Context, accountsID.WorkspaceIDList) error    { return nil }

func TestAsset_Create(t *testing.T) {
	ctx := context.Background()

	wsID := accountsID.NewWorkspaceID()
	pid := id.NewProjectID()

	gFile, err := fs.NewFile(afero.NewMemMapFs(), "")
	assert.NoError(t, err)

	// Create a mock workspace repo
	mockWorkspaceRepo := &mockWorkspaceRepo{wsID: wsID}

	uContainer := &Asset{
		repos: &repo.Container{
			Asset:     memory.NewAsset(),
			Workspace: mockWorkspaceRepo,
		},
		gateways: &gateway.Container{
			File: gFile,
		},
	}

	buf := bytes.NewBufferString("Hello")
	buflen := int64(buf.Len())

	res, err := uContainer.Create(ctx, interfaces.CreateAssetParam{
		WorkspaceID: wsID,
		CoreSupport: true,
		ProjectID:   &pid,
		File: &file.File{
			Content:     io.NopCloser(buf),
			Path:        "hoge.txt",
			ContentType: "",
			Size:        buflen,
		},
	}, &usecase.Operator{
		AcOperator: &accountsUsecase.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{wsID},
		},
	})
	assert.NoError(t, err)

	want := asset.New().
		ID(res.ID()).
		Workspace(wsID).
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
