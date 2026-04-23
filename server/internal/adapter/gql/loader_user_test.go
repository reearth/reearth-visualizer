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
// FindByIDs call rather than one FindByID call per user when the gqlclient is set.
func TestUserLoader_Fetch_BatchesWithClient(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	uid1 := accountsID.NewUserID()
	uid2 := accountsID.NewUserID()
	uid3 := accountsID.NewUserID()

	u1, _ := accountsUser.New().ID(uid1).Name("Alice").Email("alice@example.com").Workspace(accountsID.NewWorkspaceID()).Build()
	u2, _ := accountsUser.New().ID(uid2).Name("Bob").Email("bob@example.com").Workspace(accountsID.NewWorkspaceID()).Build()
	u3, _ := accountsUser.New().ID(uid3).Name("Carol").Email("carol@example.com").Workspace(accountsID.NewWorkspaceID()).Build()

	mockUserRepo := userMock.NewMockRepo(ctrl)

	// FindByIDs must be called exactly once with all 3 IDs — never FindByID.
	mockUserRepo.EXPECT().
		FindByIDs(gomock.Any(), gomock.InAnyOrder([]string{uid1.String(), uid2.String(), uid3.String()})).
		Return([]*accountsUser.User{u1, u2, u3}, nil).
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
	if len(users) != 3 {
		t.Errorf("expected 3 users, got %d", len(users))
	}
}
