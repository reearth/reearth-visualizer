package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestAddCustomProperties(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	scene, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, nil)

	l, _ := nlslayer.NewNLSLayerSimple().NewID().Scene(scene.ID()).Build()
	_ = db.NLSLayer.Save(ctx, l)

	i, _ := il.AddCustomProperties(
		ctx,
		interfaces.AddCustomPropertiesInput{
			LayerID: l.ID(),
			Schema:  map[string]any{"key": "value"},
		},
		&usecase.Operator{
			WritableScenes: []id.SceneID{scene.ID()},
		},
	)
	assert.NotNil(t, i)

	res, err := db.NLSLayer.FindByID(ctx, l.ID())
	assert.NoError(t, err)
	assert.True(t, res.IsSketch())
	assert.NotNil(t, res.Sketch())
	assert.NotNil(t, res.Sketch().CustomPropertySchema())
	schema := *(res.Sketch().CustomPropertySchema())
	assert.Equal(t, "value", schema["key"])
}

func TestAddGeoJSONFeature(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	scene, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, nil)

	l, _ := nlslayer.NewNLSLayerSimple().NewID().Scene(scene.ID()).Build()
	_ = db.NLSLayer.Save(ctx, l)

	featureType := "Feature"
	geometry := map[string]any{
		"type":        "Point",
		"coordinates": []interface{}{1.0, 2.0},
	}
	properties := &map[string]any{
		"key": "value",
	}
	feature, err := il.AddGeoJSONFeature(
		ctx,
		interfaces.AddNLSLayerGeoJSONFeatureParams{
			LayerID:    l.ID(),
			Type:       featureType,
			Geometry:   geometry,
			Properties: properties,
		},
		&usecase.Operator{
			WritableScenes: []id.SceneID{scene.ID()},
		},
	)

	assert.NoError(t, err)
	assert.NotNil(t, feature)

	res, err := db.NLSLayer.FindByID(ctx, l.ID())
	assert.NoError(t, err)
	assert.True(t, res.IsSketch())
	sketchInfo := res.Sketch()
	assert.NotNil(t, sketchInfo)
	featureCollection := sketchInfo.FeatureCollection()
	assert.NotNil(t, featureCollection)
	assert.Equal(t, 1, len(featureCollection.Features()))
	addedFeature := featureCollection.Features()[0]
	assert.Equal(t, featureType, addedFeature.FeatureType())
	assert.Equal(t, properties, addedFeature.Properties())

	pointGeometry, ok := addedFeature.Geometry().(*nlslayer.Point)
	assert.True(t, ok)
	assert.Equal(t, "Point", pointGeometry.PointType())
	assert.Equal(t, []float64{1.0, 2.0}, pointGeometry.Coordinates())
}

func TestUpdateGeoJSONFeature(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	scene, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, nil)

	l, _ := nlslayer.NewNLSLayerSimple().NewID().Scene(scene.ID()).Build()
	_ = db.NLSLayer.Save(ctx, l)

	featureID := nlslayer.NewFeatureID()
	property := &map[string]any{"key": "value"}
	feature, err := nlslayer.NewFeature(
		featureID,
		"Feature",
		map[string]any{
			"type":        "Point",
			"coordinates": []interface{}{1.0, 2.0},
		},
	)
	assert.NoError(t, err)
	feature.UpdateProperties(property)

	sletchInfo := nlslayer.NewSketchInfo(
		nil,
		nlslayer.NewFeatureCollection(
			"FeatureCollection",
			[]nlslayer.Feature{*feature},
		),
	)

	l.SetSketch(sletchInfo)
	_ = db.NLSLayer.Save(ctx, l)

	newGeometry := &map[string]any{
		"type": "LineString",
		"coordinates": []interface{}{
			[]interface{}{1.0, 2.0},
			[]interface{}{3.0, 4.0},
		},
	}
	newProperties := &map[string]any{"newKey": "newValue"}
	updatedFeature, err := il.UpdateGeoJSONFeature(
		ctx,
		interfaces.UpdateNLSLayerGeoJSONFeatureParams{
			LayerID:    l.ID(),
			FeatureID:  featureID,
			Geometry:   newGeometry,
			Properties: newProperties,
		},
		&usecase.Operator{
			WritableScenes: []id.SceneID{scene.ID()},
		},
	)

	assert.NoError(t, err)
	assert.NotNil(t, updatedFeature)

	res, err := db.NLSLayer.FindByID(ctx, l.ID())
	assert.NoError(t, err)
	sketchInfo := res.Sketch()
	assert.NotNil(t, sketchInfo)
	featureCollection := sketchInfo.FeatureCollection()
	assert.NotNil(t, featureCollection)
	assert.Equal(t, 1, len(featureCollection.Features()))
	addedFeature := featureCollection.Features()[0]
	assert.Equal(t, newProperties, addedFeature.Properties())

	lineStringGeometry, ok := addedFeature.Geometry().(*nlslayer.LineString)
	assert.True(t, ok)
	assert.Equal(t, "LineString", lineStringGeometry.LineStringType())
	assert.Equal(t, [][]float64{{1.0, 2.0}, {3.0, 4.0}}, lineStringGeometry.Coordinates())
}

func TestDeleteGeoJSONFeature(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	scene, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, nil)

	l, _ := nlslayer.NewNLSLayerSimple().NewID().Scene(scene.ID()).Build()
	_ = db.NLSLayer.Save(ctx, l)

	featureID := nlslayer.NewFeatureID()
	property := &map[string]any{"key": "value"}
	feature, err := nlslayer.NewFeature(
		featureID,
		"Feature",
		map[string]any{
			"type":        "Point",
			"coordinates": []interface{}{1.0, 2.0},
		},
	)
	assert.NoError(t, err)
	feature.UpdateProperties(property)

	sletchInfo := nlslayer.NewSketchInfo(
		nil,
		nlslayer.NewFeatureCollection(
			"FeatureCollection",
			[]nlslayer.Feature{*feature},
		),
	)

	l.SetSketch(sletchInfo)
	_ = db.NLSLayer.Save(ctx, l)

	deletedFeatureId, err := il.DeleteGeoJSONFeature(
		ctx,
		interfaces.DeleteNLSLayerGeoJSONFeatureParams{
			LayerID:   l.ID(),
			FeatureID: featureID,
		},
		&usecase.Operator{
			WritableScenes: []id.SceneID{scene.ID()},
		},
	)

	assert.NoError(t, err)
	assert.NotNil(t, deletedFeatureId)

	res, err := db.NLSLayer.FindByID(ctx, l.ID())
	assert.NoError(t, err)
	sketchInfo := res.Sketch()
	assert.NotNil(t, sketchInfo)
	featureCollection := sketchInfo.FeatureCollection()
	assert.NotNil(t, featureCollection)
	assert.Equal(t, 0, len(featureCollection.Features()))
}
