package dataset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSchema_JSONSchema(t *testing.T) {
	ds := NewSchema().NewID().Scene(NewSceneID()).Name("hoge").Fields([]*SchemaField{
		NewSchemaField().NewID().Name("foo").Type(ValueTypeNumber).MustBuild(),
		NewSchemaField().NewID().Name("bar").Type(ValueTypeLatLng).MustBuild(),
	}).MustBuild()

	want := map[string]any{
		"$schema": "http://json-schema.org/draft-07/schema#",
		"title":   ds.Name(),
		"type":    "object",
		"properties": map[string]any{
			"": map[string]any{
				"title": "ID",
				"type":  "string",
			},
			"foo": map[string]any{
				"type": "number",
			},
			"bar": map[string]any{
				"type":  "object",
				"title": "LatLng",
				"required": []string{
					"lat",
					"lng",
				},
				"properties": map[string]any{
					"lat": map[string]any{
						"type": "number",
					},
					"lng": map[string]any{
						"type": "number",
					},
				},
			},
		},
	}

	assert.Equal(t, want, ds.JSONSchema())
}
