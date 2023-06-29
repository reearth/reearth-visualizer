package dataset

import (
	"bytes"
	"testing"

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
	err := Export(&buf, "csv", ds, func(cb func(*Dataset) error) error {
		return cb(d)
	})
	assert.NoError(t, err)

	assert.Equal(t, "a,b,c\n1,2,\"2.000000, 1.000000\"\n", buf.String())
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
	err := Export(&buf, "json", ds, func(cb func(*Dataset) error) error {
		return cb(d)
	})
	assert.NoError(t, err)

	assert.Equal(t, "[{\"a\":1,\"b\":\"2\",\"c\":{\"lat\":1,\"lng\":2}}]\n", buf.String())
}
