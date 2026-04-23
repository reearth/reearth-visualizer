package gql

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	workspaceMock "github.com/reearth/reearth-accounts/server/pkg/gqlclient/workspace/mockrepo"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"go.uber.org/mock/gomock"
)

// TestWorkspaceLoader_Fetch_BatchesWithClient verifies that Fetch makes a single
// FindByIDs call rather than one FindByID call per workspace when the gqlclient is set.
func TestWorkspaceLoader_Fetch_BatchesWithClient(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	wid1 := accountsID.NewWorkspaceID()
	wid2 := accountsID.NewWorkspaceID()

	uid := accountsID.NewUserID()
	w1, _ := accountsWorkspace.New().ID(wid1).Name("WS1").Build()
	w2, _ := accountsWorkspace.New().ID(wid2).Name("WS2").Build()
	_ = uid

	mockWorkspaceRepo := workspaceMock.NewMockWorkspaceRepo(ctrl)

	// FindByIDs must be called exactly once with all IDs — never FindByID.
	mockWorkspaceRepo.EXPECT().
		FindByIDs(gomock.Any(), gomock.InAnyOrder([]string{wid1.String(), wid2.String()})).
		Return(accountsWorkspace.List{w1, w2}, nil).
		Times(1)

	client := &gqlclient.Client{WorkspaceRepo: mockWorkspaceRepo}
	loader := NewWorkspaceLoader(client, nil)

	ids := []gqlmodel.ID{
		gqlmodel.ID(wid1.String()),
		gqlmodel.ID(wid2.String()),
	}

	workspaces, errs := loader.Fetch(context.Background(), ids)
	if len(errs) > 0 {
		t.Fatalf("unexpected errors: %v", errs)
	}
	if len(workspaces) != 2 {
		t.Errorf("expected 2 workspaces, got %d", len(workspaces))
	}
}
