package gql

import (
	"context"

	accountsGqlUser "github.com/reearth/reearth-accounts/server/pkg/gqlclient/user"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
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

	return &gqlmodel.UpdateMePayload{Me: gqlmodel.ToMe(userModel)}, nil
}
