package e2e

import (
	"net/http"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
)

func addGeoJSONFeature(
	e *httpexpect.Expect,
	layerId string,
	geometry map[string]any,
	properties map[string]any,
) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddGeoJSONFeature",
		Query: `mutation AddGeoJSONFeature($input: AddGeoJSONFeatureInput!) {
							addGeoJSONFeature(input: $input) {
								id
								type
								properties
								geometry {
									... on Point {
										type
										pointCoordinates
									}
									... on LineString {
										type
										lineStringCoordinates
									}
									... on Polygon {
										type
										polygonCoordinates
									}
									... on MultiPolygon {
										type
										multiPolygonCoordinates
									}
									... on GeometryCollection {
										type
										geometries {
											... on Point {
												type
												pointCoordinates
											}
											... on LineString {
												type
												lineStringCoordinates
											}
											... on Polygon {
												type
												polygonCoordinates
											}
											... on MultiPolygon {
												type
												multiPolygonCoordinates
											}
										}
									}
								}
							}
						}`,
		Variables: map[string]interface{}{
			"input": map[string]interface{}{
				"layerId":    layerId,
				"type":       "Feature",
				"geometry":   geometry,
				"properties": properties,
			},
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	featureId := res.Path("$.data.addGeoJSONFeature.id").Raw().(string)
	return requestBody, res, featureId
}

func updateGeoJSONFeature(
	e *httpexpect.Expect,
	layerId string,
	featureId string,
	geometry map[string]any,
	properties map[string]any,
) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateGeoJSONFeature",
		Query: `mutation UpdateGeoJSONFeature($input: UpdateGeoJSONFeatureInput!) {
							updateGeoJSONFeature(input: $input) {
								id
								type
								properties
								geometry {
									... on Point {
										type
										pointCoordinates
									}
									... on LineString {
										type
										lineStringCoordinates
									}
									... on Polygon {
										type
										polygonCoordinates
									}
									... on MultiPolygon {
										type
										multiPolygonCoordinates
									}
									... on GeometryCollection {
										type
										geometries {
											... on Point {
												type
												pointCoordinates
											}
											... on LineString {
												type
												lineStringCoordinates
											}
											... on Polygon {
												type
												polygonCoordinates
											}
											... on MultiPolygon {
												type
												multiPolygonCoordinates
											}
										}
									}
								}
							}
						}`,
		Variables: map[string]interface{}{
			"input": map[string]interface{}{
				"layerId":    layerId,
				"featureId":  featureId,
				"geometry":   geometry,
				"properties": properties,
			},
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	fId := res.Path("$.data.updateGeoJSONFeature.id").Raw().(string)
	return requestBody, res, fId
}

func deleteGeoJSONFeature(
	e *httpexpect.Expect,
	layerId string,
	featureId string,
) (GraphQLRequest, *httpexpect.Value, string) {
	requestBody := GraphQLRequest{
		OperationName: "DeleteGeoJSONFeature",
		Query: `mutation DeleteGeoJSONFeature($input: DeleteGeoJSONFeatureInput!) {
							deleteGeoJSONFeature(input: $input) {
								deletedFeatureId
							}
						}`,
		Variables: map[string]interface{}{
			"input": map[string]interface{}{
				"layerId":   layerId,
				"featureId": featureId,
			},
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	fId := res.Path("$.data.deleteGeoJSONFeature.deletedFeatureId").Raw().(string)
	return requestBody, res, fId
}

func featureCollectionCRUD(t *testing.T, isUseRedis bool) {
	redisAddress := ""
	if isUseRedis {
		mr, err := miniredis.Run()
		if err != nil {
			t.Fatal(err)
		}
		defer mr.Close()
		redisAddress = mr.Addr()
	}

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
		RedisHost: redisAddress,
	}, true, baseSeeder)

	pId := createProject(e)
	_, _, sId := createScene(e, pId)

	_, res := fetchSceneForNewLayers(e, sId)
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(0)

	_, _, layerId := addNLSLayerSimple(e, sId)

	_, res2 := fetchSceneForNewLayers(e, sId)
	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().Equal(1)

	geometry1 := map[string]any{
		"type":        "Point",
		"coordinates": []float64{1, 2},
	}
	properties1 := map[string]any{
		"id":             "propertiesId1",
		"type":           "marker",
		"extrudedHeight": 0,
		"positions":      []float64{1, 2, 3},
	}
	_, _, fid1 := addGeoJSONFeature(e, layerId, geometry1, properties1)

	_, res3 := fetchSceneForNewLayers(e, sId)
	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("isSketch").Boolean().True()

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(1)

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().First().Object().
		Value("type").Equal("Feature")

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().First().Object().
		Value("geometry").Object().
		Value("type").Equal("Point")

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().First().Object().
		Value("properties").Object().
		Value("type").Equal("marker")

	geometry2 := map[string]any{
		"type":        "LineString",
		"coordinates": [][]float64{{1, 2}, {3, 4}},
	}
	properties2 := map[string]any{
		"id":             "propertiesId2",
		"type":           "marker",
		"extrudedHeight": 0,
		"positions":      []float64{4, 5, 6},
	}
	_, _, fid2 := addGeoJSONFeature(e, layerId, geometry2, properties2)

	_, res4 := fetchSceneForNewLayers(e, sId)
	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(2)

	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Last().Object().
		Value("geometry").Object().
		Value("type").Equal("LineString")

	geometry3 := map[string]any{
		"type":        "Polygon",
		"coordinates": [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}},
	}
	properties3 := map[string]any{
		"id":             "propertiesId3",
		"type":           "marker",
		"extrudedHeight": 0,
		"positions":      []float64{7, 8, 9},
	}
	_, _, fid3 := addGeoJSONFeature(e, layerId, geometry3, properties3)

	_, res5 := fetchSceneForNewLayers(e, sId)
	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(3)

	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Last().Object().
		Value("geometry").Object().
		Value("type").Equal("Polygon")

	geometry4 := map[string]any{
		"type":        "MultiPolygon",
		"coordinates": [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}},
	}
	properties4 := map[string]any{
		"id":             "propertiesId4",
		"type":           "marker",
		"extrudedHeight": 0,
		"positions":      []float64{10, 11, 12},
	}
	_, _, fid4 := addGeoJSONFeature(e, layerId, geometry4, properties4)

	_, res6 := fetchSceneForNewLayers(e, sId)
	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(4)

	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Last().Object().
		Value("geometry").Object().
		Value("type").Equal("MultiPolygon")

	geometry5 := map[string]any{
		"type":       "GeometryCollection",
		"geometries": []map[string]any{geometry1, geometry2, geometry3, geometry4},
	}
	properties5 := map[string]any{
		"id":             "propertiesId5",
		"type":           "marker",
		"extrudedHeight": 0,
		"positions":      []float64{13, 14, 15},
	}
	_, _, fid5 := addGeoJSONFeature(e, layerId, geometry5, properties5)

	_, res7 := fetchSceneForNewLayers(e, sId)
	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(5)

	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Last().Object().
		Value("geometry").Object().
		Value("type").Equal("GeometryCollection")

	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Last().Object().
		Value("geometry").Object().
		Value("geometries").Array().
		Length().Equal(4)

	geometry6 := map[string]any{
		"type":        "LineString",
		"coordinates": [][]float64{{5, 6}, {7, 8}},
	}
	properties6 := map[string]any{
		"id":             "propertiesId1",
		"type":           "marker",
		"extrudedHeight": 10,
		"positions":      []float64{16, 17, 18},
	}
	_, _, fid6 := updateGeoJSONFeature(e, layerId, fid1, geometry6, properties6)

	_, res8 := fetchSceneForNewLayers(e, sId)
	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(5)

	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().First().Object().
		Value("id").Equal(fid6)

	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().First().Object().
		Value("geometry").Object().
		Value("type").Equal("LineString")

	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().First().Object().
		Value("properties").Object().
		Value("extrudedHeight").Equal(10)

	deleteGeoJSONFeature(e, layerId, fid6)

	_, res9 := fetchSceneForNewLayers(e, sId)
	res9.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(4)

	res9.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().First().Object().
		Value("id").Equal(fid2)

	deleteGeoJSONFeature(e, layerId, fid2)
	deleteGeoJSONFeature(e, layerId, fid3)
	deleteGeoJSONFeature(e, layerId, fid4)
	deleteGeoJSONFeature(e, layerId, fid5)

	_, res10 := fetchSceneForNewLayers(e, sId)
	res10.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().First().Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().Equal(0)
}

func TestFeatureCollectionCRUD(t *testing.T) {
	featureCollectionCRUD(t, false)
}

func TestFeatureCollectionCRUDWithRedis(t *testing.T) {
	featureCollectionCRUD(t, true)
}
