package gql

import (
	"context"

	accountsGqlUser "github.com/reearth/reearth-accounts/server/pkg/gqlclient/user"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/log"
)

func (r *mutationResolver) UpdateMe(ctx context.Context, input gqlmodel.UpdateMeInput) (*gqlmodel.UpdateMePayload, error) {
	// Call reearth-accounts API
	updateInput := accountsGqlUser.UpdateMeInput{
		Name:                 input.Name,
		Email:                input.Email,
		Password:             input.Password,
		PasswordConfirmation: input.PasswordConfirmation,
	}

	// Convert Lang if provided
	if input.Lang != nil {
		langStr := input.Lang.String()
		updateInput.Lang = &langStr
	}

	// Convert Theme if provided
	if input.Theme != nil {
		themeStr := string(*input.Theme)
		updateInput.Theme = &themeStr
	}

	userModel, err := r.AccountsAPIClient.UserRepo.UpdateMe(ctx, updateInput)
	if err != nil {
		return nil, err
	}

	// Convert the accounts user model to visualizer user domain model
	u, err := buildAccountDomainUserFromAccountsUserModel(ctx, userModel)
	if err != nil {
		log.Errorfc(ctx, "failed to build user from accounts model: %v", err)
		return nil, err
	}

	return &gqlmodel.UpdateMePayload{Me: gqlmodel.ToMe(u)}, nil
}

func buildAccountDomainUserFromAccountsUserModel(ctx context.Context, userModel *accountsUser.User) (*user.User, error) {
	uId, _ := user.IDFrom(userModel.ID().String())
	wid, _ := workspace.IDFrom(userModel.Workspace().String())

	usermetadata := user.MetadataFrom(
		userModel.Metadata().PhotoURL(),
		userModel.Metadata().Description(),
		userModel.Metadata().Website(),
		userModel.Metadata().Lang(),
		user.Theme(userModel.Metadata().Theme()),
	)

	// Convert auths to user.Auth slice
	auths := make([]user.Auth, 0, len(userModel.Auths()))
	for _, authStr := range userModel.Auths() {
		auths = append(auths, user.AuthFrom(authStr.String()))
	}

	u, err := user.New().
		ID(uId).
		Name(userModel.Name()).
		Alias(userModel.Alias()).
		Email(userModel.Email()).
		Metadata(usermetadata).
		Workspace(wid).
		Auths(auths).
		Build()

	if err != nil {
		log.Errorfc(ctx, "failed to build user: %v", err)
		return nil, err
	}

	return u, nil
}
