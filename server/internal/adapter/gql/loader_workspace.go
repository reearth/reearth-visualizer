package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/util"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsInterfaces "github.com/reearth/reearth-accounts/server/pkg/interfaces"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

type WorkspaceLoader struct {
	accountsUsecases *accountsInterfaces.Container
}

func NewWorkspaceLoader(accountsUsecases *accountsInterfaces.Container) *WorkspaceLoader {
	return &WorkspaceLoader{
		accountsUsecases: accountsUsecases,
	}
}

func (c *WorkspaceLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
	uids, err := util.TryMap(ids, gqlmodel.ToID[accountsID.Workspace])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.accountsUsecases.Workspace.Fetch(ctx, uids, getAccountsOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	// TODO: Planning to move here
	if c.accountsUsecases != nil && c.accountsUsecases.Workspace != nil {
		_, err = c.accountsUsecases.Workspace.Fetch(ctx, uids, getAccountsOperator(ctx))
		if err != nil {
			return nil, []error{err}
		}
	}

	workspaces := make([]*gqlmodel.Workspace, 0, len(res))
	for _, t := range res {
		workspaces = append(workspaces, gqlmodel.ToWorkspace(t))
	}
	return workspaces, nil
}

func (c *WorkspaceLoader) FindByUser(ctx context.Context, uid gqlmodel.ID) ([]*gqlmodel.Workspace, error) {
	userid, err := gqlmodel.ToID[accountsID.User](uid)
	if err != nil {
		return nil, err
	}

	res, err := c.accountsUsecases.Workspace.FindByUser(ctx, userid, getAccountsOperator(ctx))
	if err != nil {
		return nil, err
	}

	// TODO: Planning to move here
	if c.accountsUsecases != nil {
		acUserId, err := gqlmodel.ToID[accountsID.User](uid)
		if err != nil {
			return nil, err
		}
		_, err = c.accountsUsecases.User.FetchByID(ctx, accountsUser.IDList{acUserId})
		if err != nil {
			return nil, err
		}
	}

	workspaces := make([]*gqlmodel.Workspace, 0, len(res))
	for _, t := range res {
		workspaces = append(workspaces, gqlmodel.ToWorkspace(t))
	}
	return workspaces, nil
}

// data loader

type WorkspaceDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Workspace, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Workspace, []error)
}

func (c *WorkspaceLoader) DataLoader(ctx context.Context) WorkspaceDataLoader {
	return gqldataloader.NewWorkspaceLoader(gqldataloader.WorkspaceLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *WorkspaceLoader) OrdinaryDataLoader(ctx context.Context) WorkspaceDataLoader {
	return &ordinaryWorkspaceLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryWorkspaceLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error)
}

func (l *ordinaryWorkspaceLoader) Load(key gqlmodel.ID) (*gqlmodel.Workspace, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryWorkspaceLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
	return l.fetch(keys)
}
