package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type LayerControllerConfig struct {
	LayerInput func() interfaces.Layer
}

type LayerController struct {
	config LayerControllerConfig
}

func NewLayerController(config LayerControllerConfig) *LayerController {
	return &LayerController{config: config}
}

func (c *LayerController) usecase() interfaces.Layer {
	if c == nil {
		return nil
	}
	return c.config.LayerInput()
}

func (c *LayerController) AddItem(ctx context.Context, ginput *AddLayerItemInput, operator *usecase.Operator) (*AddLayerItemPayload, error) {
	layer, parent, err := c.usecase().AddItem(ctx, interfaces.AddLayerItemInput{
		ParentLayerID: id.LayerID(ginput.ParentLayerID),
		PluginID:      &ginput.PluginID,
		ExtensionID:   &ginput.ExtensionID,
		Index:         ginput.Index,
		Name:          refToString(ginput.Name),
		LatLng:        toPropertyLatLng(ginput.Lat, ginput.Lng),
		// LinkedDatasetID: ginput.LinkedDatasetID,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &AddLayerItemPayload{
		Layer:       toLayerItem(layer, parent.IDRef()),
		ParentLayer: toLayerGroup(parent, nil),
		Index:       ginput.Index,
	}, nil
}

func (c *LayerController) AddGroup(ctx context.Context, ginput *AddLayerGroupInput, operator *usecase.Operator) (*AddLayerGroupPayload, error) {
	layer, parent, err := c.usecase().AddGroup(ctx, interfaces.AddLayerGroupInput{
		ParentLayerID:         id.LayerID(ginput.ParentLayerID),
		PluginID:              ginput.PluginID,
		ExtensionID:           ginput.ExtensionID,
		Index:                 ginput.Index,
		Name:                  refToString(ginput.Name),
		LinkedDatasetSchemaID: id.DatasetSchemaIDFromRefID(ginput.LinkedDatasetSchemaID),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &AddLayerGroupPayload{
		Layer:       toLayerGroup(layer, parent.IDRef()),
		ParentLayer: toLayerGroup(parent, nil),
		Index:       ginput.Index,
	}, nil
}

func (c *LayerController) Remove(ctx context.Context, ginput *RemoveLayerInput, operator *usecase.Operator) (*RemoveLayerPayload, error) {
	id, layer, err := c.usecase().Remove(ctx, id.LayerID(ginput.LayerID), operator)
	if err != nil {
		return nil, err
	}

	return &RemoveLayerPayload{
		LayerID:     id.ID(),
		ParentLayer: toLayerGroup(layer, nil),
	}, nil
}

func (c *LayerController) Update(ctx context.Context, ginput *UpdateLayerInput, operator *usecase.Operator) (*UpdateLayerPayload, error) {
	layer, err := c.usecase().Update(ctx, interfaces.UpdateLayerInput{
		LayerID: id.LayerID(ginput.LayerID),
		Name:    ginput.Name,
		Visible: ginput.Visible,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &UpdateLayerPayload{
		Layer: toLayer(layer, nil),
	}, nil
}

func (c *LayerController) Move(ctx context.Context, ginput *MoveLayerInput, operator *usecase.Operator) (*MoveLayerPayload, error) {
	targetLayerID, layerGroupFrom, layerGroupTo, index, err := c.usecase().Move(ctx, interfaces.MoveLayerInput{
		LayerID:     id.LayerID(ginput.LayerID),
		DestLayerID: id.LayerIDFromRefID(ginput.DestLayerID),
		Index:       refToIndex(ginput.Index),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &MoveLayerPayload{
		LayerID:         targetLayerID.ID(),
		FromParentLayer: toLayerGroup(layerGroupFrom, nil),
		ToParentLayer:   toLayerGroup(layerGroupTo, nil),
		Index:           index,
	}, nil
}

func (c *LayerController) CreateInfobox(ctx context.Context, ginput *CreateInfoboxInput, operator *usecase.Operator) (*CreateInfoboxPayload, error) {
	layer, err := c.usecase().CreateInfobox(ctx, id.LayerID(ginput.LayerID), operator)
	if err != nil {
		return nil, err
	}

	return &CreateInfoboxPayload{
		Layer: toLayer(layer, nil),
	}, nil
}

func (c *LayerController) RemoveInfobox(ctx context.Context, ginput *RemoveInfoboxInput, operator *usecase.Operator) (*RemoveInfoboxPayload, error) {
	layer, err := c.usecase().RemoveInfobox(ctx, id.LayerID(ginput.LayerID), operator)
	if err != nil {
		return nil, err
	}

	return &RemoveInfoboxPayload{
		Layer: toLayer(layer, nil),
	}, nil
}

func (c *LayerController) AddInfoboxField(ctx context.Context, ginput *AddInfoboxFieldInput, operator *usecase.Operator) (*AddInfoboxFieldPayload, error) {
	infoboxField, layer, err := c.usecase().AddInfoboxField(ctx, interfaces.AddInfoboxFieldParam{
		LayerID:     id.LayerID(ginput.LayerID),
		PluginID:    ginput.PluginID,
		ExtensionID: ginput.ExtensionID,
		Index:       ginput.Index,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &AddInfoboxFieldPayload{
		InfoboxField: toInfoboxField(infoboxField, layer.Scene(), nil),
		Layer:        toLayer(layer, nil),
	}, nil
}

func (c *LayerController) MoveInfoboxField(ctx context.Context, ginput *MoveInfoboxFieldInput, operator *usecase.Operator) (*MoveInfoboxFieldPayload, error) {
	infoboxField, layer, index, err := c.usecase().MoveInfoboxField(ctx, interfaces.MoveInfoboxFieldParam{
		LayerID:        id.LayerID(ginput.LayerID),
		InfoboxFieldID: id.InfoboxFieldID(ginput.InfoboxFieldID),
		Index:          ginput.Index,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &MoveInfoboxFieldPayload{
		InfoboxFieldID: infoboxField.ID(),
		Layer:          toLayer(layer, nil),
		Index:          index,
	}, nil
}

func (c *LayerController) RemoveInfoboxField(ctx context.Context, ginput *RemoveInfoboxFieldInput, operator *usecase.Operator) (*RemoveInfoboxFieldPayload, error) {
	infoboxField, layer, err := c.usecase().RemoveInfoboxField(ctx, interfaces.RemoveInfoboxFieldParam{
		LayerID:        id.LayerID(ginput.LayerID),
		InfoboxFieldID: id.InfoboxFieldID(ginput.InfoboxFieldID),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &RemoveInfoboxFieldPayload{
		InfoboxFieldID: infoboxField.ID(),
		Layer:          toLayer(layer, nil),
	}, nil
}

func (c *LayerController) ImportLayer(ctx context.Context, ginput *ImportLayerInput, operator *usecase.Operator) (*ImportLayerPayload, error) {
	l, l2, err := c.usecase().ImportLayer(ctx, interfaces.ImportLayerParam{
		LayerID: id.LayerID(ginput.LayerID),
		File:    fromFile(&ginput.File),
		Format:  fromLayerEncodingFormat(ginput.Format),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &ImportLayerPayload{
		Layers:      toLayers(l, l2.IDRef()),
		ParentLayer: toLayerGroup(l2, nil),
	}, err
}
