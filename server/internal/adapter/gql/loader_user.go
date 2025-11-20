package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
	"github.com/reearth/reearthx/util"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

type UserLoader struct {
	usecase accountinterfaces.User
}

func NewUserLoader(usecase accountinterfaces.User) *UserLoader {
	return &UserLoader{usecase: usecase}
}

func (c *UserLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.User, []error) {
	uids, err := util.TryMap(ids, gqlmodel.ToID[accountsID.User])
	if err != nil {
		return nil, []error{err}
	}

	// Convert new accountsID.UserID to old user.ID for the usecase call
	oldUIDs := make(user.IDList, 0, len(uids))
	for _, uid := range uids {
		oldID, _ := user.IDFrom(uid.String())
		oldUIDs = append(oldUIDs, oldID)
	}

	res, err := c.usecase.FetchByID(ctx, oldUIDs)
	if err != nil {
		return nil, []error{err}
	}

	// Convert old user.User to new accountsUser.User
	users := make([]*gqlmodel.User, 0, len(res))
	for _, u := range res {
		newUser := convertOldUserToNew(u)
		users = append(users, gqlmodel.ToUser(newUser))
	}

	return users, nil
}

func (c *UserLoader) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.User, error) {
	res, err := c.usecase.SearchUser(ctx, nameOrEmail)
	if err != nil {
		return nil, err
	}

	for _, oldSimpleUser := range res {
		if oldSimpleUser.Name == nameOrEmail || oldSimpleUser.Email == nameOrEmail {
			newSimpleUser := convertOldSimpleUserToNew(oldSimpleUser)
			return gqlmodel.ToUserFromSimple(newSimpleUser), nil
		}
	}

	return nil, nil
}

// data loader

type UserDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.User, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.User, []error)
}

func (c *UserLoader) DataLoader(ctx context.Context) UserDataLoader {
	return gqldataloader.NewUserLoader(gqldataloader.UserLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.User, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *UserLoader) OrdinaryDataLoader(ctx context.Context) UserDataLoader {
	return &ordinaryUserLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.User, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryUserLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.User, []error)
}

func (l *ordinaryUserLoader) Load(key gqlmodel.ID) (*gqlmodel.User, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryUserLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.User, []error) {
	return l.fetch(keys)
}

// Helper functions to convert between old reearthx user types and new reearth-accounts user types
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

func convertOldSimpleUserToNew(oldSimple *user.Simple) *accountsUser.Simple {
	if oldSimple == nil {
		return nil
	}

	newID, _ := accountsID.UserIDFrom(oldSimple.ID.String())
	return &accountsUser.Simple{
		ID:    newID,
		Name:  oldSimple.Name,
		Email: oldSimple.Email,
	}
}
