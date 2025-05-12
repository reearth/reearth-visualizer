package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type ProjectLoader struct {
	usecase interfaces.Project
}

func NewProjectLoader(usecase interfaces.Project) *ProjectLoader {
	return &ProjectLoader{usecase: usecase}
}

func (c *ProjectLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Project, []error) {
	ids2, err := util.TryMap(ids, gqlmodel.ToID[id.Project])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, ids2, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	projects := make([]*gqlmodel.Project, 0, len(res))
	for _, project := range res {
		projects = append(projects, gqlmodel.ToProject(project))
	}

	return projects, nil
}

func (c *ProjectLoader) FindByWorkspace(ctx context.Context, wsID gqlmodel.ID, keyword *string, sort *project.SortType, pagination *gqlmodel.Pagination) (*gqlmodel.ProjectConnection, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](wsID)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.FindByWorkspace(ctx, tid, keyword, sort, gqlmodel.ToPagination(pagination), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ProjectEdge, 0, len(res))
	nodes := make([]*gqlmodel.Project, 0, len(res))
	for _, p := range res {
		prj := gqlmodel.ToProject(p)
		edges = append(edges, &gqlmodel.ProjectEdge{
			Node:   prj,
			Cursor: usecasex.Cursor(prj.ID),
		})
		nodes = append(nodes, prj)
	}

	return &gqlmodel.ProjectConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *ProjectLoader) CheckAlias(ctx context.Context, alias string, projectID *gqlmodel.ID) (*gqlmodel.ProjectAliasAvailability, error) {
	pid := gqlmodel.ToIDRef[id.Project](projectID)

	ok, err := c.usecase.CheckAlias(ctx, alias, pid)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectAliasAvailability{Alias: alias, Available: ok}, nil
}

func (c *ProjectLoader) FindStarredByWorkspace(ctx context.Context, wsID gqlmodel.ID) (*gqlmodel.ProjectConnection, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](wsID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindStarredByWorkspace(ctx, tid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	nodes := make([]*gqlmodel.Project, 0, len(res))
	for _, p := range res {
		nodes = append(nodes, gqlmodel.ToProject(p))
	}

	return &gqlmodel.ProjectConnection{
		Nodes:      nodes,
		TotalCount: len(nodes),
	}, nil
}

func (c *ProjectLoader) FindDeletedByWorkspace(ctx context.Context, wsID gqlmodel.ID) (*gqlmodel.ProjectConnection, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](wsID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindDeletedByWorkspace(ctx, tid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	nodes := make([]*gqlmodel.Project, 0, len(res))
	for _, p := range res {
		nodes = append(nodes, gqlmodel.ToProject(p))
	}

	return &gqlmodel.ProjectConnection{
		Nodes:      nodes,
		TotalCount: len(nodes),
	}, nil
}

// data loaders

type ProjectDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Project, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Project, []error)
}

func (c *ProjectLoader) DataLoader(ctx context.Context) ProjectDataLoader {
	return gqldataloader.NewProjectLoader(gqldataloader.ProjectLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Project, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ProjectLoader) OrdinaryDataLoader(ctx context.Context) ProjectDataLoader {
	return &ordinaryProjectLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Project, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryProjectLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Project, []error)
}

func (l *ordinaryProjectLoader) Load(key gqlmodel.ID) (*gqlmodel.Project, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryProjectLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Project, []error) {
	return l.fetch(keys)
}
