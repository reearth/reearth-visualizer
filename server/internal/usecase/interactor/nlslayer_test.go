package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/testutil/factory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestAddOrUpdateCustomProperties(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	prj, _ := project.New().NewID().Build()
	_ = db.Project.Save(ctx, prj)
	scene, _ := scene.New().NewID().Workspace(accountsID.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	l, _ := nlslayer.NewNLSLayerSimple().NewID().Scene(scene.ID()).Build()
	_ = db.NLSLayer.Save(ctx, l)

	initialSchema := map[string]any{"initialKey": "initialValue"}
	i, _ := il.AddOrUpdateCustomProperties(
		ctx,
		interfaces.AddOrUpdateCustomPropertiesInput{
			LayerID: l.ID(),
			Schema:  initialSchema,
		},
		&usecase.Operator{
			WritableScenes: []id.SceneID{scene.ID()},
		},
	)
	assert.NotNil(t, i)

	updateSchema := map[string]any{"key": "value"}
	i, _ = il.AddOrUpdateCustomProperties(
		ctx,
		interfaces.AddOrUpdateCustomPropertiesInput{
			LayerID: l.ID(),
			Schema:  updateSchema,
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
	assert.NotEqual(t, "initialValue", schema["key"])
}

func TestAddGeoJSONFeature(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	prj, _ := project.New().NewID().Build()
	_ = db.Project.Save(ctx, prj)
	scene, _ := scene.New().NewID().Workspace(accountsID.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

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
	prj, _ := project.New().NewID().Build()
	_ = db.Project.Save(ctx, prj)
	scene, _ := scene.New().NewID().Workspace(accountsID.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	l, _ := nlslayer.NewNLSLayerSimple().NewID().Scene(scene.ID()).Build()
	_ = db.NLSLayer.Save(ctx, l)

	featureID := id.NewFeatureID()
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

func TestAddLayerSimple(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	workspace := factory.NewWorkspace()
	_ = db.Workspace.Save(ctx, workspace)

	prj, _ := project.New().NewID().Workspace(workspace.ID()).Build()
	_ = db.Project.Save(ctx, prj)
	scene, _ := scene.New().NewID().Workspace(workspace.ID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	operator := &usecase.Operator{
		WritableScenes: []id.SceneID{scene.ID()},
	}

	t.Run("should add layer with GeoJSON value data", func(t *testing.T) {
		layerName := "Test GeoJSON Layer"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "geojson",
				"value": map[string]interface{}{
					"type": "FeatureCollection",
					"features": []interface{}{
						map[string]interface{}{
							"type": "Feature",
							"geometry": map[string]interface{}{
								"type":        "Point",
								"coordinates": []interface{}{139.7, 35.7},
							},
							"properties": map[string]interface{}{
								"name": "Tokyo",
							},
						},
					},
				},
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:   scene.ID(),
			Config:    &config,
			LayerType: "simple",
			Title:     layerName,
		}, operator)

		assert.NoError(t, err)
		assert.NotNil(t, layer)
		assert.Equal(t, layerName, layer.Title())
	})

	t.Run("should add layer with valid GeoJSON URL", func(t *testing.T) {
		layerName := "Test GeoJSON URL Layer"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "geojson",
				"url":  "https://example.com/data.geojson",
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:   scene.ID(),
			Config:    &config,
			LayerType: "simple",
			Title:     layerName,
		}, operator)

		assert.NoError(t, err)
		assert.NotNil(t, layer)
		assert.Equal(t, layerName, layer.Title())
	})

	t.Run("should reject invalid URL format", func(t *testing.T) {
		layerName := "Test Invalid URL"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "geojson",
				"url":  "not-a-url",
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:   scene.ID(),
			Config:    &config,
			LayerType: "simple",
			Title:     layerName,
		}, operator)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid GeoJSON URL format")
		assert.Nil(t, layer)
	})

	t.Run("should reject empty URL", func(t *testing.T) {
		layerName := "Test Empty URL"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "geojson",
				"url":  "",
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:   scene.ID(),
			Config:    &config,
			LayerType: "simple",
			Title:     layerName,
		}, operator)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid GeoJSON URL format")
		assert.Nil(t, layer)
	})

	t.Run("should reject invalid GeoJSON value data", func(t *testing.T) {
		layerName := "Test Invalid GeoJSON"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "geojson",
				"value": map[string]interface{}{
					"type": "FeatureCollection",
					"features": []interface{}{
						map[string]interface{}{
							"type": "Feature",
							"geometry": map[string]interface{}{
								"type":        "InvalidType",
								"coordinates": []interface{}{139.7, 35.7},
							},
						},
					},
				},
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:   scene.ID(),
			Config:    &config,
			LayerType: "simple",
			Title:     layerName,
		}, operator)

		assert.Error(t, err)
		assert.Nil(t, layer)
	})

	t.Run("should add layer with non-GeoJSON data", func(t *testing.T) {
		layerName := "Test CSV Layer"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "csv",
				"url":  "https://example.com/data.csv",
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:   scene.ID(),
			Config:    &config,
			LayerType: "simple",
			Title:     layerName,
		}, operator)

		assert.NoError(t, err)
		assert.NotNil(t, layer)
		assert.Equal(t, layerName, layer.Title())
	})

	t.Run("should add layer with DataSourceName", func(t *testing.T) {
		layerName := "Test Layer with DataSourceName"
		dataSourceName := "test-data-source"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "csv",
				"url":  "https://example.com/data.csv",
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:        scene.ID(),
			Config:         &config,
			LayerType:      "simple",
			Title:          layerName,
			DataSourceName: &dataSourceName,
		}, operator)

		assert.NoError(t, err)
		assert.NotNil(t, layer)
		assert.Equal(t, layerName, layer.Title())
		assert.NotNil(t, layer.DataSourceName())
		assert.Equal(t, dataSourceName, *layer.DataSourceName())
	})

	t.Run("should add layer without DataSourceName", func(t *testing.T) {
		layerName := "Test Layer without DataSourceName"
		config := nlslayer.Config{
			"data": map[string]interface{}{
				"type": "csv",
				"url":  "https://example.com/data.csv",
			},
		}

		layer, err := il.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
			SceneID:        scene.ID(),
			Config:         &config,
			LayerType:      "simple",
			Title:          layerName,
			DataSourceName: nil, // Explicitly nil
		}, operator)

		assert.NoError(t, err)
		assert.NotNil(t, layer)
		assert.Equal(t, layerName, layer.Title())
		assert.Nil(t, layer.DataSourceName())
	})
}

func TestDeleteGeoJSONFeature(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	prj, _ := project.New().NewID().Build()
	_ = db.Project.Save(ctx, prj)
	scene, _ := scene.New().NewID().Workspace(accountsID.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewNLSLayer(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	l, _ := nlslayer.NewNLSLayerSimple().NewID().Scene(scene.ID()).Build()
	_ = db.NLSLayer.Save(ctx, l)

	featureID := id.NewFeatureID()
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
