package gql

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	userMock "github.com/reearth/reearth-accounts/server/pkg/gqlclient/user/mockrepo"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"go.uber.org/mock/gomock"
)

// TestUserLoader_Fetch_BatchesWithClient verifies that Fetch makes a single
// FindByIDs call and returns results aligned to the input ID order.
func TestUserLoader_Fetch_BatchesWithClient(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	uid1 := accountsID.NewUserID()
	uid2 := accountsID.NewUserID()
	uid3 := accountsID.NewUserID()

	u1, err := accountsUser.New().ID(uid1).Name("Alice").Email("alice@example.com").Workspace(accountsID.NewWorkspaceID()).Build()
	if err != nil {
		t.Fatalf("failed to build user 1: %v", err)
	}
	u2, err := accountsUser.New().ID(uid2).Name("Bob").Email("bob@example.com").Workspace(accountsID.NewWorkspaceID()).Build()
	if err != nil {
		t.Fatalf("failed to build user 2: %v", err)
	}
	u3, err := accountsUser.New().ID(uid3).Name("Carol").Email("carol@example.com").Workspace(accountsID.NewWorkspaceID()).Build()
	if err != nil {
		t.Fatalf("failed to build user 3: %v", err)
	}

	mockUserRepo := userMock.NewMockRepo(ctrl)

	// FindByIDs must be called exactly once — never FindByID.
	// Repo returns users in reverse order to verify the caller reorders correctly.
	mockUserRepo.EXPECT().
		FindByIDs(gomock.Any(), gomock.InAnyOrder([]string{uid1.String(), uid2.String(), uid3.String()})).
		Return([]*accountsUser.User{u3, u1, u2}, nil).
		Times(1)

	client := &gqlclient.Client{UserRepo: mockUserRepo}
	loader := NewUserLoader(client, nil)

	ids := []gqlmodel.ID{
		gqlmodel.ID(uid1.String()),
		gqlmodel.ID(uid2.String()),
		gqlmodel.ID(uid3.String()),
	}

	users, errs := loader.Fetch(context.Background(), ids)
	if len(errs) > 0 {
		t.Fatalf("unexpected errors: %v", errs)
	}
	if len(users) != len(ids) {
		t.Fatalf("expected %d users, got %d", len(ids), len(users))
	}
	// Results must be aligned to input ID order regardless of repo return order.
	for i, id := range ids {
		if users[i] == nil {
			t.Errorf("expected user for id %s at index %d, got nil", id, i)
			continue
		}
		if users[i].ID != id {
			t.Errorf("expected user id %s at index %d, got %s", id, i, users[i].ID)
		}
	}
}
