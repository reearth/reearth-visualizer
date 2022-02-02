package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

func (r *mutationResolver) UpdatePropertyValue(ctx context.Context, input gqlmodel.UpdatePropertyValueInput) (*gqlmodel.PropertyFieldPayload, error) {
	var v *property.Value
	if input.Value != nil {
		v = gqlmodel.FromPropertyValueAndType(input.Value, input.Type)
		if v == nil {
			return nil, errors.New("invalid value")
		}
	}

	pp, pgl, pg, pf, err := usecases(ctx).Property.UpdateValue(ctx, interfaces.UpdatePropertyValueParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaGroupID, input.ItemID, &input.FieldID),
		Value:      v,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyFieldPayload{
		Property:      gqlmodel.ToProperty(pp),
		PropertyField: gqlmodel.ToPropertyField(pf, pp, pgl, pg),
	}, nil
}

func (r *mutationResolver) RemovePropertyField(ctx context.Context, input gqlmodel.RemovePropertyFieldInput) (*gqlmodel.PropertyFieldPayload, error) {
	p, err := usecases(ctx).Property.RemoveField(ctx, interfaces.RemovePropertyFieldParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaGroupID, input.ItemID, &input.FieldID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyFieldPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}

func (r *mutationResolver) UploadFileToProperty(ctx context.Context, input gqlmodel.UploadFileToPropertyInput) (*gqlmodel.PropertyFieldPayload, error) {
	p, pgl, pg, pf, err := usecases(ctx).Property.UploadFile(ctx, interfaces.UploadFileParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaGroupID, input.ItemID, &input.FieldID),
		File:       gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyFieldPayload{
		Property:      gqlmodel.ToProperty(p),
		PropertyField: gqlmodel.ToPropertyField(pf, p, pgl, pg),
	}, nil
}

func (r *mutationResolver) LinkDatasetToPropertyValue(ctx context.Context, input gqlmodel.LinkDatasetToPropertyValueInput) (*gqlmodel.PropertyFieldPayload, error) {
	p, pgl, pg, pf, err := usecases(ctx).Property.LinkValue(ctx, interfaces.LinkPropertyValueParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaGroupID, input.ItemID, &input.FieldID),
		Links: gqlmodel.FromPropertyFieldLink(
			input.DatasetSchemaIds,
			input.DatasetIds,
			input.DatasetSchemaFieldIds,
		),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyFieldPayload{
		Property:      gqlmodel.ToProperty(p),
		PropertyField: gqlmodel.ToPropertyField(pf, p, pgl, pg),
	}, nil
}

func (r *mutationResolver) UnlinkPropertyValue(ctx context.Context, input gqlmodel.UnlinkPropertyValueInput) (*gqlmodel.PropertyFieldPayload, error) {
	p, pgl, pg, pf, err := usecases(ctx).Property.UnlinkValue(ctx, interfaces.UnlinkPropertyValueParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaGroupID, input.ItemID, &input.FieldID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyFieldPayload{
		Property:      gqlmodel.ToProperty(p),
		PropertyField: gqlmodel.ToPropertyField(pf, p, pgl, pg),
	}, nil
}

func (r *mutationResolver) AddPropertyItem(ctx context.Context, input gqlmodel.AddPropertyItemInput) (*gqlmodel.PropertyItemPayload, error) {
	var v *property.Value
	if input.NameFieldType != nil {
		v = gqlmodel.FromPropertyValueAndType(input.NameFieldValue, *input.NameFieldType)
		if v == nil {
			return nil, errors.New("invalid name field value")
		}
	}

	p, pgl, pi, err := usecases(ctx).Property.AddItem(ctx, interfaces.AddPropertyItemParam{
		PropertyID:     id.PropertyID(input.PropertyID),
		Pointer:        gqlmodel.FromPointer(&input.SchemaGroupID, nil, nil),
		Index:          input.Index,
		NameFieldValue: v,
	}, getOperator(ctx))

	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyItemPayload{
		Property:     gqlmodel.ToProperty(p),
		PropertyItem: gqlmodel.ToPropertyItem(pi, p, pgl),
	}, nil
}

func (r *mutationResolver) MovePropertyItem(ctx context.Context, input gqlmodel.MovePropertyItemInput) (*gqlmodel.PropertyItemPayload, error) {
	p, pgl, pi, err := usecases(ctx).Property.MoveItem(ctx, interfaces.MovePropertyItemParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(&input.SchemaGroupID, &input.ItemID, nil),
		Index:      input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyItemPayload{
		Property:     gqlmodel.ToProperty(p),
		PropertyItem: gqlmodel.ToPropertyItem(pi, p, pgl),
	}, nil
}

func (r *mutationResolver) RemovePropertyItem(ctx context.Context, input gqlmodel.RemovePropertyItemInput) (*gqlmodel.PropertyItemPayload, error) {
	p, err := usecases(ctx).Property.RemoveItem(ctx, interfaces.RemovePropertyItemParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(&input.SchemaGroupID, &input.ItemID, nil),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyItemPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}

func (r *mutationResolver) UpdatePropertyItems(ctx context.Context, input gqlmodel.UpdatePropertyItemInput) (*gqlmodel.PropertyItemPayload, error) {
	op := make([]interfaces.UpdatePropertyItemsOperationParam, 0, len(input.Operations))
	for _, o := range input.Operations {
		var v *property.Value
		if o.NameFieldType != nil {
			v = gqlmodel.FromPropertyValueAndType(o.NameFieldValue, *o.NameFieldType)
			if v == nil {
				return nil, errors.New("invalid name field value")
			}
		}

		op = append(op, interfaces.UpdatePropertyItemsOperationParam{
			Operation:      gqlmodel.FromListOperation(o.Operation),
			ItemID:         id.PropertyItemIDFromRefID(o.ItemID),
			Index:          o.Index,
			NameFieldValue: v,
		})
	}

	p, err2 := usecases(ctx).Property.UpdateItems(ctx, interfaces.UpdatePropertyItemsParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(&input.SchemaGroupID, nil, nil),
		Operations: op,
	}, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.PropertyItemPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}
