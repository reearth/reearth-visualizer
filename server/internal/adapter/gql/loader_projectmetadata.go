package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
)

type ProjectMetadataLoader struct {
	usecase interfaces.ProjectMetadata
}

func NewProjectMetadataLoader(usecase interfaces.ProjectMetadata) *ProjectMetadataLoader {
	return &ProjectMetadataLoader{usecase: usecase}
}

func (c *ProjectMetadataLoader) Fetch(ctx context.Context, ids []id.ProjectID) ([]*gqlmodel.ProjectMetadata, []error) {

	res, err := c.usecase.Fetch(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	projectmetadatas := make([]*gqlmodel.ProjectMetadata, 0, len(res))
	for _, projectmetadata := range res {
		projectmetadatas = append(projectmetadatas, gqlmodel.ToProjectMetadata(projectmetadata))
	}

	return projectmetadatas, nil
}
