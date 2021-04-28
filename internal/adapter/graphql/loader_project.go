package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (c *ProjectController) Fetch(ctx context.Context, ids []id.ProjectID, operator *usecase.Operator) ([]*Project, []error) {
	res, err := c.usecase().Fetch(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	projects := make([]*Project, 0, len(res))
	for _, project := range res {
		projects = append(projects, toProject(project))
	}

	return projects, nil
}

func (c *ProjectController) FindByTeam(ctx context.Context, teamID id.TeamID, first *int, last *int, before *usecase.Cursor, after *usecase.Cursor, operator *usecase.Operator) (*ProjectConnection, error) {
	res, pi, err := c.usecase().FindByTeam(ctx, teamID, usecase.NewPagination(first, last, before, after), operator)
	if err != nil {
		return nil, err
	}

	edges := make([]*ProjectEdge, 0, len(res))
	nodes := make([]*Project, 0, len(res))
	for _, p := range res {
		prj := toProject(p)
		edges = append(edges, &ProjectEdge{
			Node:   prj,
			Cursor: usecase.Cursor(prj.ID.String()),
		})
		nodes = append(nodes, prj)
	}

	return &ProjectConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   toPageInfo(pi),
		TotalCount: pi.TotalCount(),
	}, nil
}
