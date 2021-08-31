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
	exit := trace(ctx)
	defer exit()

	v, ok := gqlmodel.FromPropertyValueAndType(input.Value, input.Type)
	if !ok {
		return nil, errors.New("invalid value")
	}

	pp, pgl, pg, pf, err := r.usecases.Property.UpdateValue(ctx, interfaces.UpdatePropertyValueParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaItemID, input.ItemID, &input.FieldID),
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
	exit := trace(ctx)
	defer exit()

	p, err := r.usecases.Property.RemoveField(ctx, interfaces.RemovePropertyFieldParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaItemID, input.ItemID, &input.FieldID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyFieldPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}

func (r *mutationResolver) UploadFileToProperty(ctx context.Context, input gqlmodel.UploadFileToPropertyInput) (*gqlmodel.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	p, pgl, pg, pf, err := r.usecases.Property.UploadFile(ctx, interfaces.UploadFileParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaItemID, input.ItemID, &input.FieldID),
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
	exit := trace(ctx)
	defer exit()

	p, pgl, pg, pf, err := r.usecases.Property.LinkValue(ctx, interfaces.LinkPropertyValueParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaItemID, input.ItemID, &input.FieldID),
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
	exit := trace(ctx)
	defer exit()

	p, pgl, pg, pf, err := r.usecases.Property.UnlinkValue(ctx, interfaces.UnlinkPropertyValueParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(input.SchemaItemID, input.ItemID, &input.FieldID),
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
	exit := trace(ctx)
	defer exit()

	var v *property.Value
	if input.NameFieldType != nil {
		v, _ = gqlmodel.FromPropertyValueAndType(input.NameFieldValue, *input.NameFieldType)
	}

	p, pgl, pi, err := r.usecases.Property.AddItem(ctx, interfaces.AddPropertyItemParam{
		PropertyID:     id.PropertyID(input.PropertyID),
		Pointer:        gqlmodel.FromPointer(&input.SchemaItemID, nil, nil),
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
	exit := trace(ctx)
	defer exit()

	p, pgl, pi, err := r.usecases.Property.MoveItem(ctx, interfaces.MovePropertyItemParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(&input.SchemaItemID, &input.ItemID, nil),
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
	exit := trace(ctx)
	defer exit()

	p, err := r.usecases.Property.RemoveItem(ctx, interfaces.RemovePropertyItemParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(&input.SchemaItemID, &input.ItemID, nil),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyItemPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}

func (r *mutationResolver) UpdatePropertyItems(ctx context.Context, input gqlmodel.UpdatePropertyItemInput) (*gqlmodel.PropertyItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	op := make([]interfaces.UpdatePropertyItemsOperationParam, 0, len(input.Operations))
	for _, o := range input.Operations {
		var v *property.Value
		if o.NameFieldType != nil {
			v, _ = gqlmodel.FromPropertyValueAndType(o.NameFieldValue, *o.NameFieldType)
		}

		op = append(op, interfaces.UpdatePropertyItemsOperationParam{
			Operation:      gqlmodel.FromListOperation(o.Operation),
			ItemID:         id.PropertyItemIDFromRefID(o.ItemID),
			Index:          o.Index,
			NameFieldValue: v,
		})
	}

	p, err2 := r.usecases.Property.UpdateItems(ctx, interfaces.UpdatePropertyItemsParam{
		PropertyID: id.PropertyID(input.PropertyID),
		Pointer:    gqlmodel.FromPointer(&input.SchemaItemID, nil, nil),
		Operations: op,
	}, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.PropertyItemPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}
