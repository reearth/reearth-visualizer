package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (r *mutationResolver) UpdatePropertyValue(ctx context.Context, input gqlmodel.UpdatePropertyValueInput) (*gqlmodel.PropertyFieldPayload, error) {
	var v *property.Value
	if input.Value != nil {
		v = gqlmodel.FromPropertyValueAndType(input.Value, input.Type)
		if v == nil {
			return nil, errors.New("invalid value")
		}
	}

	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	pp, pgl, pg, pf, err := usecases(ctx).Property.UpdateValue(ctx, interfaces.UpdatePropertyValueParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			gqlmodel.ToStringIDRef[id.PropertySchemaGroup](input.SchemaGroupID),
			input.ItemID,
			gqlmodel.ToStringIDRef[id.PropertyField](&input.FieldID),
		),
		Value: v,
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
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	p, err := usecases(ctx).Property.RemoveField(ctx, interfaces.RemovePropertyFieldParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			gqlmodel.ToStringIDRef[id.PropertySchemaGroup](input.SchemaGroupID),
			input.ItemID,
			gqlmodel.ToStringIDRef[id.PropertyField](&input.FieldID),
		),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyFieldPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}

func (r *mutationResolver) UploadFileToProperty(ctx context.Context, input gqlmodel.UploadFileToPropertyInput) (*gqlmodel.PropertyFieldPayload, error) {
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	uc := usecases(ctx)
	pr, err := uc.Property.Fetch(ctx, []id.PropertyID{pid}, getOperator(ctx))
	if err != nil || len(pr) == 0 {
		if err == nil {
			err = rerror.ErrNotFound
		}
		return nil, err
	}
	ws, err := uc.Scene.Fetch(ctx, []id.SceneID{pr[0].Scene()}, getOperator(ctx))
	if err != nil || len(ws) == 0 {
		if err == nil {
			err = rerror.ErrNotFound
		}
		return nil, err
	}
	prj, err := uc.Project.Fetch(ctx, []id.ProjectID{ws[0].Project()}, getOperator(ctx))
	if err != nil || len(prj) == 0 {
		if err == nil {
			err = rerror.ErrNotFound
		}
		return nil, err
	}

	a, err := uc.Asset.Create(ctx, interfaces.CreateAssetParam{
		WorkspaceID: prj[0].Workspace(),
		File:        gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	p, pgl, pg, pf, err := uc.Property.UpdateValue(ctx, interfaces.UpdatePropertyValueParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			gqlmodel.ToStringIDRef[id.PropertySchemaGroup](input.SchemaGroupID),
			input.ItemID,
			gqlmodel.ToStringIDRef[id.PropertyField](&input.FieldID),
		),
		Value: property.ValueTypeURL.ValueFrom(a.URL()),
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
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	links, err := gqlmodel.FromPropertyFieldLink(input.DatasetSchemaIds, input.DatasetIds, input.DatasetSchemaFieldIds)
	if err != nil {
		return nil, err
	}

	p, pgl, pg, pf, err := usecases(ctx).Property.LinkValue(ctx, interfaces.LinkPropertyValueParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			gqlmodel.ToStringIDRef[id.PropertySchemaGroup](input.SchemaGroupID),
			input.ItemID,
			lo.ToPtr(id.PropertyFieldID(input.FieldID)),
		),
		Links: links,
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
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	p, pgl, pg, pf, err := usecases(ctx).Property.UnlinkValue(ctx, interfaces.UnlinkPropertyValueParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			gqlmodel.ToStringIDRef[id.PropertySchemaGroup](input.SchemaGroupID),
			input.ItemID,
			lo.ToPtr(id.PropertyFieldID(input.FieldID)),
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

func (r *mutationResolver) AddPropertyItem(ctx context.Context, input gqlmodel.AddPropertyItemInput) (*gqlmodel.PropertyItemPayload, error) {
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	var v *property.Value
	if input.NameFieldType != nil {
		v = gqlmodel.FromPropertyValueAndType(input.NameFieldValue, *input.NameFieldType)
		if v == nil {
			return nil, errors.New("invalid name field value")
		}
	}

	p, pgl, pi, err := usecases(ctx).Property.AddItem(ctx, interfaces.AddPropertyItemParam{
		PropertyID:     pid,
		Pointer:        gqlmodel.FromPointer(gqlmodel.ToStringIDRef[id.PropertySchemaGroup](&input.SchemaGroupID), nil, nil),
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
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	p, pgl, pi, err := usecases(ctx).Property.MoveItem(ctx, interfaces.MovePropertyItemParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			lo.ToPtr(id.PropertySchemaGroupID(input.SchemaGroupID)),
			&input.ItemID,
			nil,
		),
		Index: input.Index,
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
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	p, err := usecases(ctx).Property.RemoveItem(ctx, interfaces.RemovePropertyItemParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			lo.ToPtr(id.PropertySchemaGroupID(input.SchemaGroupID)),
			&input.ItemID,
			nil,
		),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PropertyItemPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}

func (r *mutationResolver) UpdatePropertyItems(ctx context.Context, input gqlmodel.UpdatePropertyItemInput) (*gqlmodel.PropertyItemPayload, error) {
	pid, err := gqlmodel.ToID[id.Property](input.PropertyID)
	if err != nil {
		return nil, err
	}

	operations, err := util.TryMap(input.Operations, func(o *gqlmodel.UpdatePropertyItemOperationInput) (interfaces.UpdatePropertyItemsOperationParam, error) {
		var v *property.Value
		if o.NameFieldType != nil {
			v = gqlmodel.FromPropertyValueAndType(o.NameFieldValue, *o.NameFieldType)
			if v == nil {
				return interfaces.UpdatePropertyItemsOperationParam{}, errors.New("invalid name field value")
			}
		}

		return interfaces.UpdatePropertyItemsOperationParam{
			Operation:      gqlmodel.FromListOperation(o.Operation),
			ItemID:         gqlmodel.ToIDRef[id.PropertyItem](o.ItemID),
			Index:          o.Index,
			NameFieldValue: v,
		}, nil
	})
	if err != nil {
		return nil, err
	}

	p, err2 := usecases(ctx).Property.UpdateItems(ctx, interfaces.UpdatePropertyItemsParam{
		PropertyID: pid,
		Pointer: gqlmodel.FromPointer(
			lo.ToPtr(id.PropertySchemaGroupID(input.SchemaGroupID)),
			nil,
			nil,
		),
		Operations: operations,
	}, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.PropertyItemPayload{
		Property: gqlmodel.ToProperty(p),
	}, nil
}
