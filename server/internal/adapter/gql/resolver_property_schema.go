package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"golang.org/x/text/language"
)

func (r *Resolver) PropertySchemaField() PropertySchemaFieldResolver {
	return &propertySchemaFieldResolver{r}
}

func (r *Resolver) PropertySchemaFieldChoice() PropertySchemaFieldChoiceResolver {
	return &propertySchemaFieldChoiceResolver{r}
}

func (r *Resolver) PropertyLinkableFields() PropertyLinkableFieldsResolver {
	return &propertyLinkableFieldsResolver{r}
}

func (r *Resolver) PropertySchemaGroup() PropertySchemaGroupResolver {
	return &propertySchemaGroupResolver{r}
}

type propertySchemaFieldResolver struct{ *Resolver }

func (r *propertySchemaFieldResolver) TranslatedTitle(ctx context.Context, obj *gqlmodel.PropertySchemaField, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedTitle[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Title, nil
}

func (r *propertySchemaFieldResolver) TranslatedDescription(ctx context.Context, obj *gqlmodel.PropertySchemaField, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedDescription[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Description, nil
}

type propertyLinkableFieldsResolver struct{ *Resolver }

func (r *propertyLinkableFieldsResolver) Schema(ctx context.Context, obj *gqlmodel.PropertyLinkableFields) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *propertyLinkableFieldsResolver) LatlngField(ctx context.Context, obj *gqlmodel.PropertyLinkableFields) (*gqlmodel.PropertySchemaField, error) {
	if obj.Latlng == nil {
		return nil, nil
	}
	ps, err := dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
	return ps.Field(*obj.Latlng), err
}

func (r *propertyLinkableFieldsResolver) URLField(ctx context.Context, obj *gqlmodel.PropertyLinkableFields) (*gqlmodel.PropertySchemaField, error) {
	if obj.URL == nil {
		return nil, nil
	}
	ps, err := dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
	return ps.Field(*obj.URL), err
}

type propertySchemaGroupResolver struct{ *Resolver }

func (r *propertySchemaGroupResolver) Schema(ctx context.Context, obj *gqlmodel.PropertySchemaGroup) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.SchemaID)
}

func (r *propertySchemaGroupResolver) TranslatedTitle(ctx context.Context, obj *gqlmodel.PropertySchemaGroup, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedTitle[getLang(ctx, lang)]; ok {
		return s, nil
	}

	if obj.Title == nil {
		return "", nil
	}
	return *obj.Title, nil
}

type propertySchemaFieldChoiceResolver struct{ *Resolver }

func (r *propertySchemaFieldChoiceResolver) TranslatedTitle(ctx context.Context, obj *gqlmodel.PropertySchemaFieldChoice, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedTitle[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Title, nil
}
