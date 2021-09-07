package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type ProjectLoader struct {
	usecase interfaces.Project
}

func NewProjectLoader(usecase interfaces.Project) *ProjectLoader {
	return &ProjectLoader{usecase: usecase}
}

func (c *ProjectLoader) Fetch(ctx context.Context, ids []id.ProjectID) ([]*gqlmodel.Project, []error) {
	res, err := c.usecase.Fetch(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	projects := make([]*gqlmodel.Project, 0, len(res))
	for _, project := range res {
		projects = append(projects, gqlmodel.ToProject(project))
	}

	return projects, nil
}

func (c *ProjectLoader) FindByTeam(ctx context.Context, teamID id.TeamID, first *int, last *int, before *usecase.Cursor, after *usecase.Cursor) (*gqlmodel.ProjectConnection, error) {
	res, pi, err := c.usecase.FindByTeam(ctx, teamID, usecase.NewPagination(first, last, before, after), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ProjectEdge, 0, len(res))
	nodes := make([]*gqlmodel.Project, 0, len(res))
	for _, p := range res {
		prj := gqlmodel.ToProject(p)
		edges = append(edges, &gqlmodel.ProjectEdge{
			Node:   prj,
			Cursor: usecase.Cursor(prj.ID.String()),
		})
		nodes = append(nodes, prj)
	}

	return &gqlmodel.ProjectConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: pi.TotalCount(),
	}, nil
}

func (c *ProjectLoader) CheckAlias(ctx context.Context, alias string) (*gqlmodel.ProjectAliasAvailability, error) {
	ok, err := c.usecase.CheckAlias(ctx, alias)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectAliasAvailability{Alias: alias, Available: ok}, nil
}

// data loaders

type ProjectDataLoader interface {
	Load(id.ProjectID) (*gqlmodel.Project, error)
	LoadAll([]id.ProjectID) ([]*gqlmodel.Project, []error)
}

func (c *ProjectLoader) DataLoader(ctx context.Context) ProjectDataLoader {
	return gqldataloader.NewProjectLoader(gqldataloader.ProjectLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []id.ProjectID) ([]*gqlmodel.Project, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ProjectLoader) OrdinaryDataLoader(ctx context.Context) ProjectDataLoader {
	return &ordinaryProjectLoader{
		fetch: func(keys []id.ProjectID) ([]*gqlmodel.Project, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryProjectLoader struct {
	fetch func(keys []id.ProjectID) ([]*gqlmodel.Project, []error)
}

func (l *ordinaryProjectLoader) Load(key id.ProjectID) (*gqlmodel.Project, error) {
	res, errs := l.fetch([]id.ProjectID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryProjectLoader) LoadAll(keys []id.ProjectID) ([]*gqlmodel.Project, []error) {
	return l.fetch(keys)
}
