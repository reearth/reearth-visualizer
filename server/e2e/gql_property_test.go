package e2e

import (
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
									placeholder
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

	res := Request(e, uID.String(), requestBody)

	return requestBody, res
}
