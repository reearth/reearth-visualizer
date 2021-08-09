package graphql

import (
	"context"
	"errors"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

func (r *Resolver) Property() PropertyResolver {
	return &propertyResolver{r}
}

func (r *Resolver) PropertyField() PropertyFieldResolver {
	return &propertyFieldResolver{r}
}

func (r *Resolver) PropertyFieldLink() PropertyFieldLinkResolver {
	return &propertyFieldLinkResolver{r}
}

func (r *Resolver) MergedProperty() MergedPropertyResolver {
	return &mergedPropertyResolver{r}
}

func (r *Resolver) MergedPropertyGroup() MergedPropertyGroupResolver {
	return &mergedPropertyGroupResolver{r}
}

func (r *Resolver) MergedPropertyField() MergedPropertyFieldResolver {
	return &mergedPropertyFieldResolver{r}
}

func (r *Resolver) PropertyGroupList() PropertyGroupListResolver {
	return &propertyGroupListResolver{r}
}

func (r *Resolver) PropertyGroup() PropertyGroupResolver {
	return &propertyGroupResolver{r}
}

type propertyResolver struct{ *Resolver }

func (r *propertyResolver) Schema(ctx context.Context, obj *graphql1.Property) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *propertyResolver) Layer(ctx context.Context, obj *graphql1.Property) (graphql1.Layer, error) {
	exit := trace(ctx)
	defer exit()

	l, err := r.config.Controllers.LayerController.FetchByProperty(ctx, id.PropertyID(obj.ID), getOperator(ctx))
	if err != nil || errors.Is(err, rerror.ErrNotFound) {
		return nil, nil
	}
	return l, err
}

func (r *propertyResolver) Merged(ctx context.Context, obj *graphql1.Property) (*graphql1.MergedProperty, error) {
	exit := trace(ctx)
	defer exit()

	l, err := r.config.Controllers.LayerController.FetchByProperty(ctx, id.PropertyID(obj.ID), getOperator(ctx))
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil
		}
		return nil, err
	}
	li, ok := l.(*graphql1.LayerItem)
	if !ok {
		return nil, nil
	}
	merged, err := r.LayerItem().Merged(ctx, li)
	if err != nil {
		return nil, err
	}
	if merged == nil {
		return nil, nil
	}
	if merged.Property != nil && merged.Property.OriginalID != nil && *merged.Property.OriginalID == obj.ID {
		return merged.Property, nil
	} else if merged.Infobox != nil && merged.Infobox.Property != nil && merged.Infobox.Property.OriginalID != nil && *merged.Infobox.Property.OriginalID == obj.ID {
		return merged.Infobox.Property, nil
	}
	return nil, nil
}

type propertyFieldResolver struct{ *Resolver }

func (r *propertyFieldResolver) Parent(ctx context.Context, obj *graphql1.PropertyField) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(obj.ParentID))
}

func (r *propertyFieldResolver) Schema(ctx context.Context, obj *graphql1.PropertyField) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *propertyFieldResolver) Field(ctx context.Context, obj *graphql1.PropertyField) (*graphql1.PropertySchemaField, error) {
	exit := trace(ctx)
	defer exit()

	schema, err := dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
	if err != nil {
		return nil, err
	}
	return schema.Field(obj.FieldID), nil
}

func (r *propertyFieldResolver) ActualValue(ctx context.Context, obj *graphql1.PropertyField) (interface{}, error) {
	exit := trace(ctx)
	defer exit()

	datasetLoader := dataloader.DataLoadersFromContext(ctx).Dataset
	return actualValue(datasetLoader, obj.Value, obj.Links, false)
}

type propertyFieldLinkResolver struct{ *Resolver }

func (r *propertyFieldLinkResolver) Dataset(ctx context.Context, obj *graphql1.PropertyFieldLink) (*graphql1.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.DatasetID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.DatasetID))
}

func (r *propertyFieldLinkResolver) DatasetField(ctx context.Context, obj *graphql1.PropertyFieldLink) (*graphql1.DatasetField, error) {
	exit := trace(ctx)
	defer exit()

	if obj.DatasetID == nil {
		return nil, nil
	}
	d, err := dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.DatasetID))
	if err != nil {
		return nil, err
	}
	return d.Field(obj.DatasetSchemaFieldID), nil
}

func (r *propertyFieldLinkResolver) DatasetSchema(ctx context.Context, obj *graphql1.PropertyFieldLink) (*graphql1.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.DatasetSchemaID))
}

func (r *propertyFieldLinkResolver) DatasetSchemaField(ctx context.Context, obj *graphql1.PropertyFieldLink) (*graphql1.DatasetSchemaField, error) {
	exit := trace(ctx)
	defer exit()

	ds, err := dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.DatasetSchemaID))
	return ds.Field(obj.DatasetSchemaFieldID), err
}

type mergedPropertyResolver struct{ *Resolver }

func (r *mergedPropertyResolver) Original(ctx context.Context, obj *graphql1.MergedProperty) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.OriginalID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.OriginalID))
}

func (r *mergedPropertyResolver) Parent(ctx context.Context, obj *graphql1.MergedProperty) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.ParentID))
}

func (r *mergedPropertyResolver) Schema(ctx context.Context, obj *graphql1.MergedProperty) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	if obj.SchemaID == nil {
		if propertyID := obj.PropertyID(); propertyID != nil {
			property, err := dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*propertyID))
			if err != nil {
				return nil, err
			}
			if property == nil {
				return nil, nil
			}
			return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(property.SchemaID)
		}
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(*obj.SchemaID)
}

func (r *mergedPropertyResolver) LinkedDataset(ctx context.Context, obj *graphql1.MergedProperty) (*graphql1.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (r *mergedPropertyResolver) Groups(ctx context.Context, obj *graphql1.MergedProperty) ([]*graphql1.MergedPropertyGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.Groups != nil {
		return obj.Groups, nil
	}
	m, err := r.config.Controllers.PropertyController.FetchMerged(ctx, obj.OriginalID, obj.ParentID, obj.LinkedDatasetID, getOperator(ctx))
	if err != nil || m == nil {
		return nil, err
	}
	return m.Groups, nil
}

type mergedPropertyGroupResolver struct{ *Resolver }

func (r *mergedPropertyGroupResolver) Original(ctx context.Context, obj *graphql1.MergedPropertyGroup) (*graphql1.PropertyGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.OriginalID == nil || obj.OriginalPropertyID == nil {
		return nil, nil
	}
	p, err := dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.OriginalID))
	if err != nil {
		return nil, err
	}
	if i, ok := p.Item(*obj.OriginalID).(*graphql1.PropertyGroup); ok {
		return i, nil
	}
	return nil, nil
}

func (r *mergedPropertyGroupResolver) Parent(ctx context.Context, obj *graphql1.MergedPropertyGroup) (*graphql1.PropertyGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil || obj.ParentPropertyID == nil {
		return nil, nil
	}
	p, err := dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.ParentID))
	if err != nil {
		return nil, err
	}
	if i, ok := p.Item(*obj.ParentID).(*graphql1.PropertyGroup); ok {
		return i, nil
	}
	return nil, nil
}

func (r *mergedPropertyGroupResolver) OriginalProperty(ctx context.Context, obj *graphql1.MergedPropertyGroup) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.OriginalID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.OriginalID))
}

func (r *mergedPropertyGroupResolver) ParentProperty(ctx context.Context, obj *graphql1.MergedPropertyGroup) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.ParentID))
}

func (r *mergedPropertyGroupResolver) Schema(ctx context.Context, obj *graphql1.MergedPropertyGroup) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	if obj.SchemaID == nil {
		if propertyID := obj.PropertyID(); propertyID != nil {
			property, err := dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*propertyID))
			if err != nil {
				return nil, err
			}
			if property == nil {
				return nil, nil
			}
			return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(property.SchemaID)
		}
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(*obj.SchemaID)
}

func (r *mergedPropertyGroupResolver) LinkedDataset(ctx context.Context, obj *graphql1.MergedPropertyGroup) (*graphql1.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

type mergedPropertyFieldResolver struct{ *Resolver }

func (r *mergedPropertyFieldResolver) Schema(ctx context.Context, obj *graphql1.MergedPropertyField) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *mergedPropertyFieldResolver) Field(ctx context.Context, obj *graphql1.MergedPropertyField) (*graphql1.PropertySchemaField, error) {
	exit := trace(ctx)
	defer exit()

	s, err := dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
	return s.Field(obj.FieldID), err
}

func (r *mergedPropertyFieldResolver) ActualValue(ctx context.Context, obj *graphql1.MergedPropertyField) (interface{}, error) {
	exit := trace(ctx)
	defer exit()

	datasetLoader := dataloader.DataLoadersFromContext(ctx).Dataset
	return actualValue(datasetLoader, obj.Value, obj.Links, obj.Overridden)
}

type propertyGroupListResolver struct{ *Resolver }

func (*propertyGroupListResolver) Schema(ctx context.Context, obj *graphql1.PropertyGroupList) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
}

func (*propertyGroupListResolver) SchemaGroup(ctx context.Context, obj *graphql1.PropertyGroupList) (*graphql1.PropertySchemaGroup, error) {
	exit := trace(ctx)
	defer exit()

	s, err := dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
	if err != nil {
		return nil, err
	}
	return s.Group(obj.SchemaGroupID), nil
}

type propertyGroupResolver struct{ *Resolver }

func (*propertyGroupResolver) Schema(ctx context.Context, obj *graphql1.PropertyGroup) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
}

func (*propertyGroupResolver) SchemaGroup(ctx context.Context, obj *graphql1.PropertyGroup) (*graphql1.PropertySchemaGroup, error) {
	exit := trace(ctx)
	defer exit()

	s, err := dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.SchemaID)
	if err != nil {
		return nil, err
	}
	return s.Group(obj.SchemaGroupID), nil
}

func actualValue(datasetLoader dataloader.DatasetDataLoader, value interface{}, links []*graphql1.PropertyFieldLink, overridden bool) (interface{}, error) {
	if len(links) == 0 || overridden {
		return &value, nil
	}
	// 先頭のリンクにしかDatasetが割り当てられていない→先頭から順々に辿っていく
	if len(links) > 1 && links[0].DatasetID != nil && links[len(links)-1].DatasetID == nil {
		dsid := *links[0].DatasetID
		for i, link := range links {
			ds, err := datasetLoader.Load(id.DatasetID(dsid))
			if err != nil {
				return nil, err
			}
			field := ds.Field(link.DatasetSchemaFieldID)
			if field != nil {
				if i == len(links)-1 {
					return &value, nil
				} else if field.Type != graphql1.ValueTypeRef {
					return nil, nil
				}
				if field.Value != nil {
					val, ok := (field.Value).(id.ID)
					if ok {
						dsid = val
					} else {
						return nil, nil
					}
				} else {
					return nil, nil
				}
			}
		}
	} else if lastLink := links[len(links)-1]; lastLink.DatasetID != nil {
		// 一番最後のリンクを取得
		ds, err := datasetLoader.Load(id.DatasetID(*lastLink.DatasetID))
		if err != nil {
			return nil, err
		}
		if f := ds.Field(lastLink.DatasetSchemaFieldID); f != nil {
			return &f.Value, nil
		}
	}
	return nil, nil
}
