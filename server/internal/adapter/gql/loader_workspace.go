package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

type WorkspaceLoader struct {
	usecase interfaces.Workspace
}

func NewWorkspaceLoader(usecase interfaces.Workspace) *WorkspaceLoader {
	return &WorkspaceLoader{usecase: usecase}
}

func (c *WorkspaceLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
	uids, err := util.TryMap(ids, gqlmodel.ToID[id.Workspace])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, uids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	workspaces := make([]*gqlmodel.Team, 0, len(res))
	for _, t := range res {
		workspaces = append(workspaces, gqlmodel.ToWorkspace(t))
	}
	return workspaces, nil
}

func (c *WorkspaceLoader) FindByUser(ctx context.Context, uid gqlmodel.ID) ([]*gqlmodel.Team, error) {
	userid, err := gqlmodel.ToID[id.User](uid)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindByUser(ctx, userid, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	workspaces := make([]*gqlmodel.Team, 0, len(res))
	for _, t := range res {
		workspaces = append(workspaces, gqlmodel.ToWorkspace(t))
	}
	return workspaces, nil
}

// data loader

type WorkspaceDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Team, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Team, []error)
}

func (c *WorkspaceLoader) DataLoader(ctx context.Context) WorkspaceDataLoader {
	return gqldataloader.NewWorkspaceLoader(gqldataloader.WorkspaceLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *WorkspaceLoader) OrdinaryDataLoader(ctx context.Context) WorkspaceDataLoader {
	return &ordinaryWorkspaceLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryWorkspaceLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error)
}

func (l *ordinaryWorkspaceLoader) Load(key gqlmodel.ID) (*gqlmodel.Team, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryWorkspaceLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
	return l.fetch(keys)
}
