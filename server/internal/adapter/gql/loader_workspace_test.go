package gql

import (
	"context"
	"testing"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	workspaceMock "github.com/reearth/reearth-accounts/server/pkg/gqlclient/workspace/mockrepo"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"go.uber.org/mock/gomock"
)

// TestWorkspaceLoader_Fetch_BatchesWithClient verifies that Fetch makes a single
// FindByIDs call and returns results aligned to the input ID order.
func TestWorkspaceLoader_Fetch_BatchesWithClient(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	wid1 := accountsID.NewWorkspaceID()
	wid2 := accountsID.NewWorkspaceID()

	w1, err := accountsWorkspace.New().ID(wid1).Name("WS1").Build()
	if err != nil {
		t.Fatalf("failed to build workspace fixture w1: %v", err)
	}
	w2, err := accountsWorkspace.New().ID(wid2).Name("WS2").Build()
	if err != nil {
		t.Fatalf("failed to build workspace fixture w2: %v", err)
	}

	mockWorkspaceRepo := workspaceMock.NewMockWorkspaceRepo(ctrl)

	// FindByIDs must be called exactly once — never FindByID.
	// Repo returns workspaces in reverse order to verify the caller reorders correctly.
	mockWorkspaceRepo.EXPECT().
		FindByIDs(gomock.Any(), gomock.InAnyOrder([]string{wid1.String(), wid2.String()})).
		Return(accountsWorkspace.List{w2, w1}, nil).
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
	if len(workspaces) != len(ids) {
		t.Fatalf("expected %d workspaces, got %d", len(ids), len(workspaces))
	}
	// Results must be aligned to input ID order regardless of repo return order.
	for i, id := range ids {
		if workspaces[i] == nil {
			t.Fatalf("expected workspace at index %d for id %s, got nil", i, id)
		}
		if workspaces[i].ID != id {
			t.Errorf("expected workspace at index %d to have ID %s, got %s", i, id, workspaces[i].ID)
		}
	}
}
