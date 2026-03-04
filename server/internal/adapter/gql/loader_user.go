package gql

import (
	"context"
	"strings"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	"github.com/reearth/reearthx/util"
)

type UserLoader struct {
	client *gqlclient.Client
}

func NewUserLoader(client *gqlclient.Client) *UserLoader {
	return &UserLoader{client: client}
}

func (c *UserLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.User, []error) {
	uids, err := util.TryMap(ids, gqlmodel.ToID[accountsID.User])
	if err != nil {
		return nil, []error{err}
	}

	users := make([]*gqlmodel.User, 0, len(uids))
	for _, uid := range uids {
		u, err := c.client.UserRepo.FindByID(ctx, uid.String())
		if err != nil {
			return nil, []error{err}
		}
		users = append(users, gqlmodel.ToUser(u))
	}

	return users, nil
}

func (c *UserLoader) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.User, error) {
	trimmed := strings.TrimSpace(nameOrEmail)

	u, err := c.client.UserRepo.FindByAlias(ctx, trimmed)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, nil
	}

	return gqlmodel.ToUser(u), nil
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
