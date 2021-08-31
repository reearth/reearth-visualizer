package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type UserLoader struct {
	usecase interfaces.User
}

func NewUserLoader(usecase interfaces.User) *UserLoader {
	return &UserLoader{usecase: usecase}
}

func (c *UserLoader) Fetch(ctx context.Context, ids []id.UserID) ([]*gqlmodel.User, []error) {
	res, err := c.usecase.Fetch(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	users := make([]*gqlmodel.User, 0, len(res))
	for _, u := range res {
		users = append(users, gqlmodel.ToUser(u))
	}

	return users, nil
}

func (c *UserLoader) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.SearchedUser, error) {
	res, err := c.usecase.SearchUser(ctx, nameOrEmail, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToSearchedUser(res), nil
}

// data loader

type UserDataLoader interface {
	Load(id.UserID) (*gqlmodel.User, error)
	LoadAll([]id.UserID) ([]*gqlmodel.User, []error)
}

func (c *UserLoader) DataLoader(ctx context.Context) UserDataLoader {
	return gqldataloader.NewUserLoader(gqldataloader.UserLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []id.UserID) ([]*gqlmodel.User, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *UserLoader) OrdinaryDataLoader(ctx context.Context) UserDataLoader {
	return &ordinaryUserLoader{
		fetch: func(keys []id.UserID) ([]*gqlmodel.User, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryUserLoader struct {
	fetch func(keys []id.UserID) ([]*gqlmodel.User, []error)
}

func (l *ordinaryUserLoader) Load(key id.UserID) (*gqlmodel.User, error) {
	res, errs := l.fetch([]id.UserID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryUserLoader) LoadAll(keys []id.UserID) ([]*gqlmodel.User, []error) {
	return l.fetch(keys)
}
