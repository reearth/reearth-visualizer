package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type DatasetControllerConfig struct {
	DatasetInput func() interfaces.Dataset
}

type DatasetController struct {
	config DatasetControllerConfig
}

func NewDatasetController(config DatasetControllerConfig) *DatasetController {
	return &DatasetController{config: config}
}

func (c *DatasetController) usecase() interfaces.Dataset {
	if c == nil {
		return nil
	}
	return c.config.DatasetInput()
}

func (c *DatasetController) UpdateDatasetSchema(ctx context.Context, i *UpdateDatasetSchemaInput, operator *usecase.Operator) (*UpdateDatasetSchemaPayload, error) {
	res, err := c.usecase().UpdateDatasetSchema(ctx, interfaces.UpdateDatasetSchemaParam{
		SchemaId: id.DatasetSchemaID(i.SchemaID),
		Name:     i.Name,
	}, operator)
	if err != nil {
		return nil, err
	}
	return &UpdateDatasetSchemaPayload{DatasetSchema: toDatasetSchema(res)}, nil
}

func (c *DatasetController) AddDynamicDatasetSchema(ctx context.Context, i *AddDynamicDatasetSchemaInput) (*AddDynamicDatasetSchemaPayload, error) {
	res, err := c.usecase().AddDynamicDatasetSchema(ctx, interfaces.AddDynamicDatasetSchemaParam{
		SceneId: id.SceneID(i.SceneID),
	})
	if err != nil {
		return nil, err
	}

	return &AddDynamicDatasetSchemaPayload{DatasetSchema: toDatasetSchema(res)}, nil
}

func (c *DatasetController) AddDynamicDataset(ctx context.Context, i *AddDynamicDatasetInput) (*AddDynamicDatasetPayload, error) {
	dss, ds, err := c.usecase().AddDynamicDataset(ctx, interfaces.AddDynamicDatasetParam{
		SchemaId: id.DatasetSchemaID(i.DatasetSchemaID),
		Author:   i.Author,
		Content:  i.Content,
		Lat:      i.Lat,
		Lng:      i.Lng,
		Target:   i.Target,
	})
	if err != nil {
		return nil, err
	}

	return &AddDynamicDatasetPayload{DatasetSchema: toDatasetSchema(dss), Dataset: toDataset(ds)}, nil
}

func (c *DatasetController) ImportDataset(ctx context.Context, i *ImportDatasetInput, o *usecase.Operator) (*ImportDatasetPayload, error) {
	res, err := c.usecase().ImportDataset(ctx, interfaces.ImportDatasetParam{
		SceneId:  id.SceneID(i.SceneID),
		SchemaId: id.DatasetSchemaIDFromRefID(i.DatasetSchemaID),
		File:     fromFile(&i.File),
	}, o)
	if err != nil {
		return nil, err
	}

	return &ImportDatasetPayload{DatasetSchema: toDatasetSchema(res)}, nil
}

func (c *DatasetController) ImportDatasetFromGoogleSheet(ctx context.Context, i *ImportDatasetFromGoogleSheetInput, o *usecase.Operator) (*ImportDatasetPayload, error) {
	res, err := c.usecase().ImportDatasetFromGoogleSheet(ctx, interfaces.ImportDatasetFromGoogleSheetParam{
		Token:     i.AccessToken,
		FileID:    i.FileID,
		SheetName: i.SheetName,
		SceneId:   id.SceneID(i.SceneID),
		SchemaId:  id.DatasetSchemaIDFromRefID(i.DatasetSchemaID),
	}, o)
	if err != nil {
		return nil, err
	}

	return &ImportDatasetPayload{DatasetSchema: toDatasetSchema(res)}, nil
}

func (c *DatasetController) GraphFetchSchema(ctx context.Context, i id.ID, depth int, operator *usecase.Operator) ([]*DatasetSchema, []error) {
	res, err := c.usecase().GraphFetchSchema(ctx, id.DatasetSchemaID(i), depth, operator)
	if err != nil {
		return nil, []error{err}
	}

	schemas := make([]*DatasetSchema, 0, len(res))
	for _, d := range res {
		schemas = append(schemas, toDatasetSchema(d))
	}

	return schemas, nil
}

func (c *DatasetController) FindSchemaByScene(ctx context.Context, i id.ID, first *int, last *int, before *usecase.Cursor, after *usecase.Cursor, operator *usecase.Operator) (*DatasetSchemaConnection, error) {
	res, pi, err := c.usecase().FindSchemaByScene(ctx, id.SceneID(i), usecase.NewPagination(first, last, before, after), operator)
	if err != nil {
		return nil, err
	}

	edges := make([]*DatasetSchemaEdge, 0, len(res))
	nodes := make([]*DatasetSchema, 0, len(res))
	for _, dataset := range res {
		ds := toDatasetSchema(dataset)
		edges = append(edges, &DatasetSchemaEdge{
			Node:   ds,
			Cursor: usecase.Cursor(ds.ID.String()),
		})
		nodes = append(nodes, ds)
	}

	return &DatasetSchemaConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   toPageInfo(pi),
		TotalCount: pi.TotalCount(),
	}, nil
}

func (c *DatasetController) FindDynamicSchemasByScene(ctx context.Context, sid id.ID) ([]*DatasetSchema, error) {
	res, err := c.usecase().FindDynamicSchemaByScene(ctx, id.SceneID(sid))
	if err != nil {
		return nil, err
	}

	dss := []*DatasetSchema{}
	for _, dataset := range res {
		dss = append(dss, toDatasetSchema(dataset))
	}

	return dss, nil
}

func (c *DatasetController) FindBySchema(ctx context.Context, dsid id.ID, first *int, last *int, before *usecase.Cursor, after *usecase.Cursor, operator *usecase.Operator) (*DatasetConnection, error) {
	p := usecase.NewPagination(first, last, before, after)
	res, pi, err2 := c.usecase().FindBySchema(ctx, id.DatasetSchemaID(dsid), p, operator)
	if err2 != nil {
		return nil, err2
	}

	edges := make([]*DatasetEdge, 0, len(res))
	nodes := make([]*Dataset, 0, len(res))
	for _, dataset := range res {
		ds := toDataset(dataset)
		edges = append(edges, &DatasetEdge{
			Node:   ds,
			Cursor: usecase.Cursor(ds.ID.String()),
		})
		nodes = append(nodes, ds)
	}

	conn := &DatasetConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   toPageInfo(pi),
		TotalCount: pi.TotalCount(),
	}

	return conn, nil
}

func (c *DatasetController) Sync(ctx context.Context, input *SyncDatasetInput, operator *usecase.Operator) (*SyncDatasetPayload, error) {
	dss, ds, err := c.usecase().Sync(ctx, id.SceneID(input.SceneID), input.URL, operator)
	if err != nil {
		return nil, err
	}

	schemas := make([]*DatasetSchema, 0, len(dss))
	datasets := make([]*Dataset, 0, len(ds))
	for _, d := range dss {
		schemas = append(schemas, toDatasetSchema(d))
	}
	for _, d := range ds {
		datasets = append(datasets, toDataset(d))
	}

	return &SyncDatasetPayload{
		SceneID:       input.SceneID,
		URL:           input.URL,
		DatasetSchema: schemas,
		Dataset:       datasets,
	}, nil
}

func (c *DatasetController) RemoveDatasetSchema(ctx context.Context, i *RemoveDatasetSchemaInput, o *usecase.Operator) (*RemoveDatasetSchemaPayload, error) {
	res, err := c.usecase().RemoveDatasetSchema(ctx, interfaces.RemoveDatasetSchemaParam{
		SchemaId: id.DatasetSchemaID(i.SchemaID),
		Force:    i.Force,
	}, o)
	if err != nil {
		return nil, err
	}

	return &RemoveDatasetSchemaPayload{SchemaID: res.ID()}, nil
}

func (c *DatasetController) AddDatasetSchema(ctx context.Context, i *AddDatasetSchemaInput, o *usecase.Operator) (*AddDatasetSchemaPayload, error) {
	res, err2 := c.usecase().AddDatasetSchema(ctx, interfaces.AddDatasetSchemaParam{
		SceneId:             id.SceneID(i.SceneID),
		Name:                i.Name,
		RepresentativeField: id.DatasetSchemaFieldIDFromRefID(i.Representativefield),
	}, o)
	if err2 != nil {
		return nil, err2
	}

	return &AddDatasetSchemaPayload{DatasetSchema: toDatasetSchema(res)}, nil
}
