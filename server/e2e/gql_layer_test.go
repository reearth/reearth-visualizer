package e2e

// import (
// 	"net/http"

// 	"github.com/gavv/httpexpect/v2"
// )

// func addLayerItemFromPrimitive(e *httpexpect.Expect, rootLayerId string) (GraphQLRequest, *httpexpect.Value, string) {
// 	requestBody := GraphQLRequest{
// 		OperationName: "AddLayerItemFromPrimitive",
// 		Query: `mutation AddLayerItemFromPrimitive($parentLayerId: ID!, $pluginId: ID!, $extensionId: ID!, $name: String, $lat: Float, $lng: Float, $index: Int) {
// 		  addLayerItem( input: {parentLayerId: $parentLayerId, pluginId: $pluginId, extensionId: $extensionId, name: $name, lat: $lat, lng: $lng, index: $index}) {
// 			parentLayer {
// 			  id
// 			}
// 			layer {
// 			  id
// 			}
// 		  }
// 		}`,
// 		Variables: map[string]any{
// 			"parentLayerId": rootLayerId,
// 			"pluginId":      "reearth",
// 			"extensionId":   "marker",
// 			"name":          "Marker",
// 			"lat":           30.00000000000000,
// 			"lng":           40.00000000000000,
// 			"lang":          "en-US",
// 			"index":         0,
// 		},
// 	}

// 	res := e.POST("/api/graphql").
// 		WithHeader("Origin", "https://example.com").
// 		WithHeader("X-Reearth-Debug-User", uID.String()).
// 		WithHeader("Content-Type", "application/json").
// 		WithJSON(requestBody).
// 		Expect().
// 		Status(http.StatusOK).
// 		JSON()

// 	return requestBody, res, res.Path("$.data.addLayerItem.layer.id").Raw().(string)
// }
