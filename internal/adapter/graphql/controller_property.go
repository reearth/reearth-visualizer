package graphql

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

type PropertyControllerConfig struct {
	PropertyInput func() interfaces.Property
}

type PropertyController struct {
	config PropertyControllerConfig
}

func NewPropertyController(config PropertyControllerConfig) *PropertyController {
	return &PropertyController{config: config}
}

func (c *PropertyController) usecase() interfaces.Property {
	if c == nil {
		return nil
	}
	return c.config.PropertyInput()
}

func (c *PropertyController) UpdateValue(ctx context.Context, p id.ID, si *id.PropertySchemaFieldID, ii *id.ID, f id.PropertySchemaFieldID, val interface{}, t ValueType, operator *usecase.Operator) (*PropertyFieldPayload, error) {
	v, ok := fromPropertyValueAndType(val, t)
	if !ok {
		return nil, errors.New("invalid value")
	}

	pp, pgl, pg, pf, err := c.usecase().UpdateValue(ctx, interfaces.UpdatePropertyValueParam{
		PropertyID: id.PropertyID(p),
		Pointer:    fromPointer(si, ii, &f),
		Value:      v,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &PropertyFieldPayload{
		Property:      toProperty(pp),
		PropertyField: toPropertyField(pf, pp, pgl, pg),
	}, nil
}

func (c *PropertyController) RemoveField(ctx context.Context, ginput *RemovePropertyFieldInput, operator *usecase.Operator) (*PropertyFieldPayload, error) {
	p, err := c.usecase().RemoveField(ctx, interfaces.RemovePropertyFieldParam{
		PropertyID: id.PropertyID(ginput.PropertyID),
		Pointer:    fromPointer(ginput.SchemaItemID, ginput.ItemID, &ginput.FieldID),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &PropertyFieldPayload{
		Property: toProperty(p),
	}, nil
}

func (c *PropertyController) UploadFile(ctx context.Context, ginput *UploadFileToPropertyInput, operator *usecase.Operator) (*PropertyFieldPayload, error) {
	p, pgl, pg, pf, err := c.usecase().UploadFile(ctx, interfaces.UploadFileParam{
		PropertyID: id.PropertyID(ginput.PropertyID),
		Pointer:    fromPointer(ginput.SchemaItemID, ginput.ItemID, &ginput.FieldID),
		File:       fromFile(&ginput.File),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &PropertyFieldPayload{
		Property:      toProperty(p),
		PropertyField: toPropertyField(pf, p, pgl, pg),
	}, nil
}

func (c *PropertyController) LinkValue(ctx context.Context, ginput *LinkDatasetToPropertyValueInput, operator *usecase.Operator) (*PropertyFieldPayload, error) {
	p, pgl, pg, pf, err := c.usecase().LinkValue(ctx, interfaces.LinkPropertyValueParam{
		PropertyID: id.PropertyID(ginput.PropertyID),
		Pointer:    fromPointer(ginput.SchemaItemID, ginput.ItemID, &ginput.FieldID),
		Links: fromPropertyFieldLink(
			ginput.DatasetSchemaIds,
			ginput.DatasetIds,
			ginput.DatasetSchemaFieldIds,
		),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &PropertyFieldPayload{
		Property:      toProperty(p),
		PropertyField: toPropertyField(pf, p, pgl, pg),
	}, nil
}

func (c *PropertyController) UnlinkValue(ctx context.Context, ginput *UnlinkPropertyValueInput, operator *usecase.Operator) (*PropertyFieldPayload, error) {
	p, pgl, pg, pf, err := c.usecase().UnlinkValue(ctx, interfaces.UnlinkPropertyValueParam{
		PropertyID: id.PropertyID(ginput.PropertyID),
		Pointer:    fromPointer(ginput.SchemaItemID, ginput.ItemID, &ginput.FieldID),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &PropertyFieldPayload{
		Property:      toProperty(p),
		PropertyField: toPropertyField(pf, p, pgl, pg),
	}, nil
}

func (c *PropertyController) AddItem(ctx context.Context, ginput *AddPropertyItemInput, operator *usecase.Operator) (*PropertyItemPayload, error) {
	var v *property.Value
	if ginput.NameFieldType != nil {
		v, _ = fromPropertyValueAndType(ginput.NameFieldValue, *ginput.NameFieldType)
	}

	p, pgl, pi, err := c.usecase().AddItem(ctx, interfaces.AddPropertyItemParam{
		PropertyID:     id.PropertyID(ginput.PropertyID),
		Pointer:        fromPointer(&ginput.SchemaItemID, nil, nil),
		Index:          ginput.Index,
		NameFieldValue: v,
	}, operator)

	if err != nil {
		return nil, err
	}

	return &PropertyItemPayload{
		Property:     toProperty(p),
		PropertyItem: toPropertyItem(pi, p, pgl),
	}, nil
}

func (c *PropertyController) MoveItem(ctx context.Context, ginput *MovePropertyItemInput, operator *usecase.Operator) (*PropertyItemPayload, error) {
	p, pgl, pi, err := c.usecase().MoveItem(ctx, interfaces.MovePropertyItemParam{
		PropertyID: id.PropertyID(ginput.PropertyID),
		Pointer:    fromPointer(&ginput.SchemaItemID, &ginput.ItemID, nil),
		Index:      ginput.Index,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &PropertyItemPayload{
		Property:     toProperty(p),
		PropertyItem: toPropertyItem(pi, p, pgl),
	}, nil
}

func (c *PropertyController) RemoveItem(ctx context.Context, ginput *RemovePropertyItemInput, operator *usecase.Operator) (*PropertyItemPayload, error) {
	p, err := c.usecase().RemoveItem(ctx, interfaces.RemovePropertyItemParam{
		PropertyID: id.PropertyID(ginput.PropertyID),
		Pointer:    fromPointer(&ginput.SchemaItemID, &ginput.ItemID, nil),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &PropertyItemPayload{
		Property: toProperty(p),
	}, nil
}

func (c *PropertyController) UpdateItems(ctx context.Context, ginput *UpdatePropertyItemInput, operator *usecase.Operator) (*PropertyItemPayload, error) {
	op := make([]interfaces.UpdatePropertyItemsOperationParam, 0, len(ginput.Operations))
	for _, o := range ginput.Operations {
		var v *property.Value
		if o.NameFieldType != nil {
			v, _ = fromPropertyValueAndType(o.NameFieldValue, *o.NameFieldType)
		}

		op = append(op, interfaces.UpdatePropertyItemsOperationParam{
			Operation:      fromListOperation(o.Operation),
			ItemID:         id.PropertyItemIDFromRefID(o.ItemID),
			Index:          o.Index,
			NameFieldValue: v,
		})
	}

	p, err2 := c.usecase().UpdateItems(ctx, interfaces.UpdatePropertyItemsParam{
		PropertyID: id.PropertyID(ginput.PropertyID),
		Pointer:    fromPointer(&ginput.SchemaItemID, nil, nil),
		Operations: op,
	}, operator)

	if err2 != nil {
		return nil, err2
	}

	return &PropertyItemPayload{
		Property: toProperty(p),
	}, nil
}
