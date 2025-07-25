package migration

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/idx"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	DefaultSchemaGroup = idx.StringIDFromRef[id.PropertySchemaGroup](lo.ToPtr("default"))
	EnabledField       = idx.StringIDFromRef[id.PropertyField](lo.ToPtr("enabled"))
	// BoolTrue            = gqlmodel.FromPropertyValueAndType(true, gqlmodel.ValueTypeBool)
	BoolFalse           = gqlmodel.FromPropertyValueAndType(false, gqlmodel.ValueTypeBool)
	CameraDurationField = idx.StringIDFromRef[id.PropertyField](lo.ToPtr("cameraDuration"))
	NumberOne           = gqlmodel.FromPropertyValueAndType(1, gqlmodel.ValueTypeNumber)
)

func SetPhotoOverlayDefault(ctx context.Context, c DBClient) error {

	filter := bson.M{
		"schemaplugin": "reearth",
		"schemaname":   "photo-overlay",
	}

	collection := c.WithCollection("property").Client()

	cur, err := collection.Find(ctx, filter)
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	propertyRepo := mongo.NewProperty(c)

	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			continue
		}

		idStr, ok := doc["id"].(string)
		if !ok {
			continue
		}

		pid := id.PropertyIDFromRef(lo.ToPtr(idStr))
		if err := setPhotoOverlayDefault(ctx, propertyRepo, *pid); err != nil {
			continue
		}
	}

	return cur.Err()
}

func setPhotoOverlayDefault(ctx context.Context, propertyRepo *mongo.Property, pid id.PropertyID) error {
	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDPhotoOverlay)

	prop, err := propertyRepo.FindByID(ctx, pid)
	if err != nil {
		return err
	}

	hasEnabled := false
	hasCameraDuration := false

	for _, item := range prop.Items() {
		for _, field := range item.Fields(nil) {
			fieldStr := field.Field().String()
			if fieldStr == EnabledField.String() {
				hasEnabled = true
			}
			if fieldStr == CameraDurationField.String() {
				hasCameraDuration = true
			}
		}
	}

	if !hasEnabled {
		_, _, _, err = prop.UpdateValue(schema, gqlmodel.FromPointer(DefaultSchemaGroup, nil, EnabledField), BoolFalse)
		if err != nil {
			return err
		}
	}

	if !hasCameraDuration {
		_, _, _, err = prop.UpdateValue(schema, gqlmodel.FromPointer(DefaultSchemaGroup, nil, CameraDurationField), NumberOne)
		if err != nil {
			return err
		}
	}

	if !hasEnabled || !hasCameraDuration {
		err = propertyRepo.Save(ctx, prop)
		if err != nil {
			return err
		}
	}

	return nil
}
