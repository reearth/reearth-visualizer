package mongo

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/usecasex"
)

// UserAdapter adapts old reearthx user repo to new interface
type UserAdapter struct {
	inner accountrepo.User
}

func NewUserAdapter(inner accountrepo.User) accountsRepo.User {
	return &UserAdapter{
		inner: inner,
	}
}

func (a *UserAdapter) FindAll(ctx context.Context) ([]*accountsUser.User, error) {
	oldUsers, err := a.inner.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	newUsers := make([]*accountsUser.User, 0, len(oldUsers))
	for _, oldUser := range oldUsers {
		newUsers = append(newUsers, convertOldUserToNew(oldUser))
	}
	return newUsers, nil
}

func (a *UserAdapter) FindByID(ctx context.Context, uid accountsID.UserID) (*accountsUser.User, error) {
	oldID, _ := user.IDFrom(uid.String())
	oldUser, err := a.inner.FindByID(ctx, oldID)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) FindByIDs(ctx context.Context, ids accountsID.UserIDList) ([]*accountsUser.User, error) {
	oldIDs := make(user.IDList, 0, len(ids))
	for _, id := range ids {
		oldID, _ := user.IDFrom(id.String())
		oldIDs = append(oldIDs, oldID)
	}

	oldUsers, err := a.inner.FindByIDs(ctx, oldIDs)
	if err != nil {
		return nil, err
	}

	newUsers := make([]*accountsUser.User, 0, len(oldUsers))
	for _, oldUser := range oldUsers {
		newUsers = append(newUsers, convertOldUserToNew(oldUser))
	}
	return newUsers, nil
}

func (a *UserAdapter) FindByIDsWithPagination(ctx context.Context, ids accountsID.UserIDList, pagination *usecasex.Pagination, nameOrAlias ...string) ([]*accountsUser.User, *usecasex.PageInfo, error) {
	oldIDs := make(user.IDList, 0, len(ids))
	for _, id := range ids {
		oldID, _ := user.IDFrom(id.String())
		oldIDs = append(oldIDs, oldID)
	}

	oldUsers, pageInfo, err := a.inner.FindByIDsWithPagination(ctx, oldIDs, pagination, nameOrAlias...)
	if err != nil {
		return nil, nil, err
	}

	newUsers := make([]*accountsUser.User, 0, len(oldUsers))
	for _, oldUser := range oldUsers {
		newUsers = append(newUsers, convertOldUserToNew(oldUser))
	}
	return newUsers, pageInfo, nil
}

func (a *UserAdapter) FindBySub(ctx context.Context, sub string) (*accountsUser.User, error) {
	oldUser, err := a.inner.FindBySub(ctx, sub)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) FindByEmail(ctx context.Context, email string) (*accountsUser.User, error) {
	oldUser, err := a.inner.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) FindByName(ctx context.Context, name string) (*accountsUser.User, error) {
	oldUser, err := a.inner.FindByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) FindByAlias(ctx context.Context, alias string) (*accountsUser.User, error) {
	oldUser, err := a.inner.FindByAlias(ctx, alias)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*accountsUser.User, error) {
	oldUser, err := a.inner.FindByNameOrEmail(ctx, nameOrEmail)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) SearchByKeyword(ctx context.Context, keyword string, fields ...string) ([]*accountsUser.User, error) {
	oldUsers, err := a.inner.SearchByKeyword(ctx, keyword, fields...)
	if err != nil {
		return nil, err
	}

	newUsers := make([]*accountsUser.User, 0, len(oldUsers))
	for _, oldUser := range oldUsers {
		newUsers = append(newUsers, convertOldUserToNew(oldUser))
	}
	return newUsers, nil
}

func (a *UserAdapter) FindByVerification(ctx context.Context, code string) (*accountsUser.User, error) {
	oldUser, err := a.inner.FindByVerification(ctx, code)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) FindByPasswordResetRequest(ctx context.Context, token string) (*accountsUser.User, error) {
	oldUser, err := a.inner.FindByPasswordResetRequest(ctx, token)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(oldUser), nil
}

func (a *UserAdapter) FindBySubOrCreate(ctx context.Context, u *accountsUser.User, sub string) (*accountsUser.User, error) {
	oldUser := convertNewUserToOld(u)
	result, err := a.inner.FindBySubOrCreate(ctx, oldUser, sub)
	if err != nil {
		return nil, err
	}
	return convertOldUserToNew(result), nil
}

func (a *UserAdapter) Create(ctx context.Context, u *accountsUser.User) error {
	oldUser := convertNewUserToOld(u)
	return a.inner.Create(ctx, oldUser)
}

func (a *UserAdapter) Save(ctx context.Context, u *accountsUser.User) error {
	oldUser := convertNewUserToOld(u)
	return a.inner.Save(ctx, oldUser)
}

func (a *UserAdapter) Remove(ctx context.Context, uid accountsID.UserID) error {
	oldID, _ := user.IDFrom(uid.String())
	return a.inner.Remove(ctx, oldID)
}

// Helper conversion functions
func convertOldUserToNew(oldUser *user.User) *accountsUser.User {
	if oldUser == nil {
		return nil
	}

	// Convert ID
	newID, _ := accountsID.UserIDFrom(oldUser.ID().String())
	newWorkspaceID, _ := accountsID.WorkspaceIDFrom(oldUser.Workspace().String())

	// Convert metadata
	var newMetadata *accountsUser.Metadata
	if oldMetadata := oldUser.Metadata(); oldMetadata != nil {
		md := accountsUser.Metadata{}
		md.SetPhotoURL(oldMetadata.PhotoURL())
		md.SetDescription(oldMetadata.Description())
		md.SetWebsite(oldMetadata.Website())
		md.SetLang(oldMetadata.Lang())
		md.SetTheme(accountsUser.Theme(oldMetadata.Theme()))
		newMetadata = &md
	}

	// Convert auths
	oldAuths := oldUser.Auths()
	newAuths := make([]accountsUser.Auth, 0, len(oldAuths))
	for _, auth := range oldAuths {
		newAuths = append(newAuths, accountsUser.Auth{
			Provider: auth.Provider,
			Sub:      auth.Sub,
		})
	}

	// Build new user
	builder := accountsUser.New().
		ID(newID).
		Name(oldUser.Name()).
		Email(oldUser.Email()).
		Workspace(newWorkspaceID).
		Auths(newAuths)

	if newMetadata != nil {
		builder = builder.Metadata(*newMetadata)
	}

	newUser, _ := builder.Build()

	return newUser
}

func convertNewUserToOld(newUser *accountsUser.User) *user.User {
	if newUser == nil {
		return nil
	}

	oldID, _ := user.IDFrom(newUser.ID().String())
	oldWorkspaceID, _ := user.WorkspaceIDFrom(newUser.Workspace().String())

	// Convert metadata
	var oldMetadata *user.Metadata
	if newMetadata := newUser.Metadata(); newMetadata != nil {
		md := user.Metadata{}
		md.SetPhotoURL(newMetadata.PhotoURL())
		md.SetDescription(newMetadata.Description())
		md.SetWebsite(newMetadata.Website())
		md.SetLang(newMetadata.Lang())
		md.SetTheme(user.Theme(newMetadata.Theme()))
		oldMetadata = &md
	}

	// Convert auths
	newAuths := newUser.Auths()
	oldAuths := make([]user.Auth, 0, len(newAuths))
	for _, auth := range newAuths {
		oldAuths = append(oldAuths, user.Auth{
			Provider: auth.Provider,
			Sub:      auth.Sub,
		})
	}

	// Build old user
	builder := user.New().
		ID(oldID).
		Name(newUser.Name()).
		Email(newUser.Email()).
		Workspace(oldWorkspaceID).
		Auths(oldAuths)

	if oldMetadata != nil {
		builder = builder.Metadata(oldMetadata)
	}

	oldUser, _ := builder.Build()

	return oldUser
}
