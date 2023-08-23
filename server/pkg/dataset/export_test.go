package dataset

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestExportCSV(t *testing.T) {
	ds := NewSchema().NewID().Name("aaa").Fields([]*SchemaField{
		NewSchemaField().NewID().Name("a").Type(ValueTypeNumber).MustBuild(),
		NewSchemaField().NewID().Name("b").Type(ValueTypeString).MustBuild(),
		NewSchemaField().NewID().Name("c").Type(ValueTypeLatLng).MustBuild(),
	}).MustBuild()
	dsf := ds.Fields()

	d := New().NewID().Schema(ds.ID()).Fields([]*Field{
		NewField(dsf[0].ID(), ValueTypeNumber.ValueFrom(1), ""),
		NewField(dsf[1].ID(), ValueTypeString.ValueFrom("2"), ""),
		NewField(dsf[2].ID(), ValueTypeLatLng.ValueFrom(LatLng{Lat: 1, Lng: 2}), ""),
	}).MustBuild()

	var buf bytes.Buffer
	err := Export(&buf, "csv", ds, true, func(cb func(*Dataset) error) error {
		return cb(d)
	})
	assert.NoError(t, err)

	assert.Equal(t, ",a,b,c_lng,c_lat\n"+d.ID().String()+",1,2,2.000000,1.000000\n", buf.String())
}

func TestExportJSON(t *testing.T) {
	ds := NewSchema().NewID().Name("aaa").Fields([]*SchemaField{
		NewSchemaField().NewID().Name("a").Type(ValueTypeNumber).MustBuild(),
		NewSchemaField().NewID().Name("b").Type(ValueTypeString).MustBuild(),
		NewSchemaField().NewID().Name("c").Type(ValueTypeLatLng).MustBuild(),
	}).MustBuild()
	dsf := ds.Fields()

	d := New().NewID().Schema(ds.ID()).Fields([]*Field{
		NewField(dsf[0].ID(), ValueTypeNumber.ValueFrom(1), ""),
		NewField(dsf[1].ID(), ValueTypeString.ValueFrom("2"), ""),
		NewField(dsf[2].ID(), ValueTypeLatLng.ValueFrom(LatLng{Lat: 1, Lng: 2}), ""),
	}).MustBuild()

	var buf bytes.Buffer
	err := Export(&buf, "json", ds, true, func(cb func(*Dataset) error) error {
		return cb(d)
	})
	assert.NoError(t, err)

	var res map[string]any
	lo.Must0(json.Unmarshal(buf.Bytes(), &res))

	assert.Equal(t, map[string]any{
		"schema": map[string]any{
			"$schema": "http://json-schema.org/draft-07/schema#",
			"$id":     "#/schemas/" + ds.ID().String(),
			"title":   "aaa",
			"type":    "object",
			"properties": map[string]any{
				"": map[string]any{
					"$id":   "#/properties/id",
					"title": "ID",
					"type":  "string",
				},
				"a": map[string]any{
					"$id":  "#/properties/" + ds.Fields()[0].ID().String(),
					"type": "number",
				},
				"b": map[string]any{
					"$id":  "#/properties/" + ds.Fields()[1].ID().String(),
					"type": "string",
				},
				"c": map[string]any{
					"$id":   "#/properties/" + ds.Fields()[2].ID().String(),
					"type":  "object",
					"title": "LatLng",
					"required": []any{
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
		},
		"datasets": []any{
			map[string]any{
				"":  d.ID().String(),
				"a": float64(1),
				"b": "2",
				"c": map[string]any{
					"lat": 1.0,
					"lng": 2.0,
				},
			},
		},
	}, res)
}
