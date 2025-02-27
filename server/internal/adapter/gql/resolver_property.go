package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Property() PropertyResolver {
	return &propertyResolver{r}
}

func (r *Resolver) PropertyField() PropertyFieldResolver {
	return &propertyFieldResolver{r}
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

func (r *propertyResolver) Schema(ctx context.Context, obj *gqlmodel.Property) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *propertyResolver) Merged(ctx context.Context, obj *gqlmodel.Property) (*gqlmodel.MergedProperty, error) {
	return nil, nil
}

type propertyFieldResolver struct{ *Resolver }

func (r *propertyFieldResolver) Parent(ctx context.Context, obj *gqlmodel.PropertyField) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.ParentID)
}

func (r *propertyFieldResolver) Schema(ctx context.Context, obj *gqlmodel.PropertyField) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *propertyFieldResolver) Field(ctx context.Context, obj *gqlmodel.PropertyField) (*gqlmodel.PropertySchemaField, error) {
	schema, err := dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
	if err != nil {
		return nil, err
	}
	return schema.Field(obj.FieldID), nil
}

type mergedPropertyResolver struct{ *Resolver }

func (r *mergedPropertyResolver) Original(ctx context.Context, obj *gqlmodel.MergedProperty) (*gqlmodel.Property, error) {
	if obj.OriginalID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Property.Load(*obj.OriginalID)
}

func (r *mergedPropertyResolver) Parent(ctx context.Context, obj *gqlmodel.MergedProperty) (*gqlmodel.Property, error) {
	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Property.Load(*obj.ParentID)
}

func (r *mergedPropertyResolver) Schema(ctx context.Context, obj *gqlmodel.MergedProperty) (*gqlmodel.PropertySchema, error) {
	if obj.SchemaID == nil {
		if propertyID := obj.PropertyID(); propertyID != nil {
			property, err := dataloaders(ctx).Property.Load(*propertyID)
			if err != nil {
				return nil, err
			}
			if property == nil {
				return nil, nil
			}
			return dataloaders(ctx).PropertySchema.Load(property.SchemaID)
		}
		return nil, nil
	}
	return dataloaders(ctx).PropertySchema.Load(*obj.SchemaID)
}

func (r *mergedPropertyResolver) Groups(ctx context.Context, obj *gqlmodel.MergedProperty) ([]*gqlmodel.MergedPropertyGroup, error) {
	if obj.Groups != nil {
		return obj.Groups, nil
	}
	m, err := loaders(ctx).Property.FetchMerged(ctx, obj.OriginalID, obj.ParentID, obj.LinkedDatasetID)
	if err != nil || m == nil {
		return nil, err
	}
	return m.Groups, nil
}

type mergedPropertyGroupResolver struct{ *Resolver }

func (r *mergedPropertyGroupResolver) Original(ctx context.Context, obj *gqlmodel.MergedPropertyGroup) (*gqlmodel.PropertyGroup, error) {
	if obj.OriginalID == nil || obj.OriginalPropertyID == nil {
		return nil, nil
	}
	p, err := dataloaders(ctx).Property.Load(*obj.OriginalID)
	if err != nil {
		return nil, err
	}
	if i, ok := p.Item(*obj.OriginalID).(*gqlmodel.PropertyGroup); ok {
		return i, nil
	}
	return nil, nil
}

func (r *mergedPropertyGroupResolver) Parent(ctx context.Context, obj *gqlmodel.MergedPropertyGroup) (*gqlmodel.PropertyGroup, error) {
	if obj.ParentID == nil || obj.ParentPropertyID == nil {
		return nil, nil
	}
	p, err := dataloaders(ctx).Property.Load(*obj.ParentID)
	if err != nil {
		return nil, err
	}
	if i, ok := p.Item(*obj.ParentID).(*gqlmodel.PropertyGroup); ok {
		return i, nil
	}
	return nil, nil
}

func (r *mergedPropertyGroupResolver) OriginalProperty(ctx context.Context, obj *gqlmodel.MergedPropertyGroup) (*gqlmodel.Property, error) {
	if obj.OriginalID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Property.Load(*obj.OriginalID)
}

func (r *mergedPropertyGroupResolver) ParentProperty(ctx context.Context, obj *gqlmodel.MergedPropertyGroup) (*gqlmodel.Property, error) {
	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Property.Load(*obj.ParentID)
}

func (r *mergedPropertyGroupResolver) Schema(ctx context.Context, obj *gqlmodel.MergedPropertyGroup) (*gqlmodel.PropertySchema, error) {
	if obj.SchemaID == nil {
		if propertyID := obj.PropertyID(); propertyID != nil {
			property, err := dataloaders(ctx).Property.Load(*propertyID)
			if err != nil {
				return nil, err
			}
			if property == nil {
				return nil, nil
			}
			return dataloaders(ctx).PropertySchema.Load(property.SchemaID)
		}
		return nil, nil
	}
	return dataloaders(ctx).PropertySchema.Load(*obj.SchemaID)
}

type mergedPropertyFieldResolver struct{ *Resolver }

func (r *mergedPropertyFieldResolver) Schema(ctx context.Context, obj *gqlmodel.MergedPropertyField) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *mergedPropertyFieldResolver) Field(ctx context.Context, obj *gqlmodel.MergedPropertyField) (*gqlmodel.PropertySchemaField, error) {
	s, err := dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
	return s.Field(obj.FieldID), err
}

type propertyGroupListResolver struct{ *Resolver }

func (*propertyGroupListResolver) Schema(ctx context.Context, obj *gqlmodel.PropertyGroupList) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
}

func (*propertyGroupListResolver) SchemaGroup(ctx context.Context, obj *gqlmodel.PropertyGroupList) (*gqlmodel.PropertySchemaGroup, error) {
	s, err := dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
	if err != nil {
		return nil, err
	}
	return s.Group(obj.SchemaGroupID), nil
}

type propertyGroupResolver struct{ *Resolver }

func (*propertyGroupResolver) Schema(ctx context.Context, obj *gqlmodel.PropertyGroup) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
}

func (*propertyGroupResolver) SchemaGroup(ctx context.Context, obj *gqlmodel.PropertyGroup) (*gqlmodel.PropertySchemaGroup, error) {
	s, err := dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
	if err != nil {
		return nil, err
	}
	return s.Group(obj.SchemaGroupID), nil
}
