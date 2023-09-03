package e2e

import (
	"net/http"

	"github.com/gavv/httpexpect/v2"
)

func updatePropertyValue(e *httpexpect.Expect, propertyID, schemaGroupID, itemID, fieldID string, value any, valueType any) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdatePropertyValue",
		Query: `mutation UpdatePropertyValue($propertyId: ID!, $schemaGroupId: ID, $itemId: ID, $fieldId: ID!, $value: Any, $type: ValueType!) {
					updatePropertyValue( input: { propertyId: $propertyId, schemaGroupId: $schemaGroupId, itemId: $itemId, fieldId: $fieldId, value: $value, type: $type } ) {
					  property {
						id
						schema{
							id
							groups{
								fields{
									fieldId
									type
									title
									description
									prefix
									suffix
									defaultValue
									ui
									min
									max
								}
							}
						}
					  }
					  propertyField {	
						id
						type
						value
					  }
					}
			  	}`,
		Variables: map[string]any{
			"propertyId":    propertyID,
			"schemaGroupId": schemaGroupID,
			"itemId":        itemID,
			"fieldId":       fieldID,
			"value":         value,
			"type":          valueType,
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

	return requestBody, res
}
