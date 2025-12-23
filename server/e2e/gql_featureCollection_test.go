//go:build e2e

package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
)

func addGeoJSONFeature(
	e *httpexpect.Expect,
	layerId string,
	geometry map[string]any,
	properties map[string]any,
	userID string,
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

	res := Request(e, userID, requestBody)

	featureId := res.Path("$.data.addGeoJSONFeature.id").Raw().(string)
	return requestBody, res, featureId
}

func updateGeoJSONFeature(
	e *httpexpect.Expect,
	layerId string,
	featureId string,
	geometry map[string]any,
	properties map[string]any,
	userID string,
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

	res := Request(e, userID, requestBody)

	fId := res.Path("$.data.updateGeoJSONFeature.id").Raw().(string)
	return requestBody, res, fId
}

func deleteGeoJSONFeature(
	e *httpexpect.Expect,
	layerId string,
	featureId string,
	userID string,
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

	res := Request(e, userID, requestBody)

	fId := res.Path("$.data.deleteGeoJSONFeature.deletedFeatureId").Raw().(string)
	return requestBody, res, fId
}

func TestFeatureCollectionCRUD(t *testing.T) {
	e, result := Server(t, baseSeeder)

	pId := createProject(e, result.UID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, result.UID, pId)

	_, res := fetchSceneForNewLayers(e, sId, result.UID.String())
	res.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(0)

	_, _, layerId := addNLSLayerSimple(e, sId, "someTitle", 1, result.UID.String())

	_, res2 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res2.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().
		Length().IsEqual(1)

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
	_, _, fid1 := addGeoJSONFeature(e, layerId, geometry1, properties1, result.UID.String())

	_, res3 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("isSketch").Boolean().IsTrue()

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(1)

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(0).Object().
		Value("type").IsEqual("Feature")

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(0).Object().
		Value("geometry").Object().
		Value("type").IsEqual("Point")

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(0).Object().
		Value("properties").Object().
		Value("type").IsEqual("marker")

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
	_, _, fid2 := addGeoJSONFeature(e, layerId, geometry2, properties2, result.UID.String())

	_, res4 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(2)

	res4.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(1).Object().
		Value("geometry").Object().
		Value("type").IsEqual("LineString")

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
	_, _, fid3 := addGeoJSONFeature(e, layerId, geometry3, properties3, result.UID.String())

	_, res5 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(3)

	res5.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(2).Object().
		Value("geometry").Object().
		Value("type").IsEqual("Polygon")

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
	_, _, fid4 := addGeoJSONFeature(e, layerId, geometry4, properties4, result.UID.String())

	_, res6 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(4)

	res6.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(3).Object().
		Value("geometry").Object().
		Value("type").IsEqual("MultiPolygon")

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
	_, _, fid5 := addGeoJSONFeature(e, layerId, geometry5, properties5, result.UID.String())

	_, res7 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(5)

	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(4).Object().
		Value("geometry").Object().
		Value("type").IsEqual("GeometryCollection")

	res7.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(4).Object().
		Value("geometry").Object().
		Value("geometries").Array().
		Length().IsEqual(4)

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
	_, _, fid6 := updateGeoJSONFeature(e, layerId, fid1, geometry6, properties6, result.UID.String())

	_, res8 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(5)

	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(0).Object().
		Value("id").IsEqual(fid6)

	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(0).Object().
		Value("geometry").Object().
		Value("type").IsEqual("LineString")

	res8.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(0).Object().
		Value("properties").Object().
		Value("extrudedHeight").IsEqual(10)

	deleteGeoJSONFeature(e, layerId, fid6, result.UID.String())

	_, res9 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res9.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(4)

	res9.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().Value(0).Object().
		Value("id").IsEqual(fid2)

	deleteGeoJSONFeature(e, layerId, fid2, result.UID.String())
	deleteGeoJSONFeature(e, layerId, fid3, result.UID.String())
	deleteGeoJSONFeature(e, layerId, fid4, result.UID.String())
	deleteGeoJSONFeature(e, layerId, fid5, result.UID.String())

	_, res10 := fetchSceneForNewLayers(e, sId, result.UID.String())
	res10.Object().
		Value("data").Object().
		Value("node").Object().
		Value("newLayers").Array().Value(0).Object().
		Value("sketch").Object().
		Value("featureCollection").Object().
		Value("features").Array().
		Length().IsEqual(0)
}
