package encoding

import (
	"bytes"
	"io"
	"testing"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Encoder = (*GeoJSONEncoder)(nil)

func TestPointEncodeGeoJSON(t *testing.T) {
	lid := id.MustLayerID(id.New().String())
	sid := id.MustSceneID(id.New().String())
	pid := id.MustPropertyID(id.New().String())
	ex := id.PluginExtensionID("marker")
	iid := id.MustPropertyItemID(id.New().String())
	v1 := property.LatLng{
		Lat: 4.4,
		Lng: 53.4,
	}

	f1 := property.SealedField{
		ID:            id.PropertySchemaFieldID("location"),
		Type:          "latlng",
		DatasetValue:  nil,
		PropertyValue: v1.Value(),
	}
	fl1 := []*property.SealedField{}
	fl1 = append(fl1, &f1)
	item1 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl1,
		Groups:        nil,
	}
	il := []*property.SealedItem{}
	il = append(il, &item1)

	v2 := property.ValueTypeString
	f2 := property.SealedField{
		ID:            id.PropertySchemaFieldID("pointColor"),
		Type:          "string",
		DatasetValue:  nil,
		PropertyValue: v2.ValueFromUnsafe("#7fff00ff"),
	}
	fl2 := []*property.SealedField{}
	fl2 = append(fl2, &f2)
	item2 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl2,
		Groups:        nil,
	}
	il = append(il, &item2)
	v3 := property.ValueTypeNumber
	f3 := property.SealedField{
		ID:            id.PropertySchemaFieldID("height"),
		Type:          "number",
		DatasetValue:  nil,
		PropertyValue: v3.ValueFromUnsafe(34),
	}
	fl3 := []*property.SealedField{}
	fl3 = append(fl3, &f3)
	item3 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl3,
		Groups:        nil,
	}
	il = append(il, &item3)
	sp := property.Sealed{
		Original: &pid,
		Items:    il,
	}
	l := merging.SealedLayerItem{
		SealedLayerCommon: merging.SealedLayerCommon{
			Merged: layer.Merged{
				Original:    lid,
				Parent:      nil,
				Name:        "test",
				Scene:       sid,
				Property:    nil,
				Infobox:     nil,
				PluginID:    &id.OfficialPluginID,
				ExtensionID: &ex,
			},
			Property: &sp,
			Infobox:  nil,
		}}

	reader, writer := io.Pipe()
	en := NewGeoJSONEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
		assert.NoError(t, err)
	}()

	colorStr, _ := f2.PropertyValue.ValueString()
	height, _ := f3.PropertyValue.ValueNumber()
	expected := geojson.NewFeature(geojson.NewPointGeometry([]float64{v1.Lng, v1.Lat, height}))
	expected.SetProperty("marker-color", colorStr)
	expected.SetProperty("name", l.Name)
	reader2, writer2 := io.Pipe()
	var data []byte
	data, err = expected.MarshalJSON()
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		_, err = writer2.Write(data)
		assert.NoError(t, err)
	}()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(reader)
	assert.NoError(t, err)
	s := buf.String()
	buf2 := new(bytes.Buffer)
	_, err = buf2.ReadFrom(reader2)
	assert.NoError(t, err)
	s2 := buf2.String()
	assert.Equal(t, s2, s)
}

func TestPolygonEncodeGeoJSON(t *testing.T) {
	lid := id.MustLayerID(id.New().String())
	sid := id.MustSceneID(id.New().String())
	pid := id.MustPropertyID(id.New().String())
	ex := id.PluginExtensionID("polygon")
	iid := id.MustPropertyItemID(id.New().String())
	vc := property.Coordinates{
		property.LatLngHeight{
			Lat:    3.4,
			Lng:    5.34,
			Height: 100,
		}, property.LatLngHeight{
			Lat:    45.4,
			Lng:    2.34,
			Height: 100,
		}, property.LatLngHeight{
			Lat:    34.66,
			Lng:    654.34,
			Height: 100,
		},
	}
	v1 := property.Polygon{vc}
	f1 := property.SealedField{
		ID:            id.PropertySchemaFieldID("polygon"),
		Type:          "polygon",
		DatasetValue:  nil,
		PropertyValue: v1.Value(),
	}
	fl1 := []*property.SealedField{}
	fl1 = append(fl1, &f1)
	item1 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl1,
		Groups:        nil,
	}
	il := []*property.SealedItem{}
	il = append(il, &item1)
	v2 := property.ValueTypeString
	f2 := property.SealedField{
		ID:            id.PropertySchemaFieldID("fillColor"),
		Type:          "string",
		DatasetValue:  nil,
		PropertyValue: v2.ValueFromUnsafe("#7c3b3b"),
	}
	fl2 := []*property.SealedField{}
	fl2 = append(fl2, &f2)
	item2 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl2,
		Groups:        nil,
	}
	il = append(il, &item2)
	v3 := property.ValueTypeString
	f3 := property.SealedField{
		ID:            id.PropertySchemaFieldID("strokeColor"),
		Type:          "string",
		DatasetValue:  nil,
		PropertyValue: v3.ValueFromUnsafe("#ff3343"),
	}
	fl3 := []*property.SealedField{}
	fl3 = append(fl3, &f3)
	item3 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl3,
		Groups:        nil,
	}
	il = append(il, &item3)
	v4 := property.ValueTypeNumber
	f4 := property.SealedField{
		ID:            id.PropertySchemaFieldID("strokeWidth"),
		Type:          "number",
		DatasetValue:  nil,
		PropertyValue: v4.ValueFromUnsafe(3),
	}
	fl4 := []*property.SealedField{}
	fl4 = append(fl4, &f4)
	item4 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl4,
		Groups:        nil,
	}
	il = append(il, &item4)
	sp := property.Sealed{
		Original: &pid,
		Items:    il,
	}
	l := merging.SealedLayerItem{
		SealedLayerCommon: merging.SealedLayerCommon{
			Merged: layer.Merged{
				Original:    lid,
				Parent:      nil,
				Name:        "test",
				Scene:       sid,
				Property:    nil,
				Infobox:     nil,
				PluginID:    &id.OfficialPluginID,
				ExtensionID: &ex,
			},
			Property: &sp,
			Infobox:  nil,
		}}

	reader, writer := io.Pipe()
	en := NewGeoJSONEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
		assert.NoError(t, err)
	}()

	fillStr, _ := f2.PropertyValue.ValueString()
	strokeStr, _ := f3.PropertyValue.ValueString()
	width, _ := f4.PropertyValue.ValueNumber()
	expected := geojson.NewFeature(geojson.NewPolygonGeometry([][][]float64{{{5.34, 3.4, 100}, {2.34, 45.4, 100}, {654.34, 34.66, 100}}}))
	expected.SetProperty("name", l.Name)
	expected.SetProperty("fill", fillStr)
	expected.SetProperty("stroke", strokeStr)
	expected.SetProperty("stroke-width", width)
	reader2, writer2 := io.Pipe()
	var data []byte
	data, err = expected.MarshalJSON()
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		_, err = writer2.Write(data)
	}()
	assert.NoError(t, err)

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(reader)
	assert.NoError(t, err)
	s := buf.String()
	buf2 := new(bytes.Buffer)
	_, err = buf2.ReadFrom(reader2)
	assert.NoError(t, err)
	s2 := buf2.String()
	assert.Equal(t, s2, s)
}

func TestPolylineEncodeGeoJSON(t *testing.T) {
	lid := id.MustLayerID(id.New().String())
	sid := id.MustSceneID(id.New().String())
	pid := id.MustPropertyID(id.New().String())
	ex := id.PluginExtensionID("polyline")
	iid := id.MustPropertyItemID(id.New().String())
	v1 := property.Coordinates{
		property.LatLngHeight{
			Lat:    3.4,
			Lng:    5.34,
			Height: 100,
		}, property.LatLngHeight{
			Lat:    45.4,
			Lng:    2.34,
			Height: 100,
		}, property.LatLngHeight{
			Lat:    34.66,
			Lng:    654.34,
			Height: 100,
		},
	}
	f1 := property.SealedField{
		ID:            id.PropertySchemaFieldID("coordinates"),
		Type:          "coordinates",
		DatasetValue:  nil,
		PropertyValue: v1.Value(),
	}
	fl1 := []*property.SealedField{}
	fl1 = append(fl1, &f1)
	item1 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl1,
		Groups:        nil,
	}
	il := []*property.SealedItem{}
	il = append(il, &item1)

	v2 := property.ValueTypeString
	f2 := property.SealedField{
		ID:            id.PropertySchemaFieldID("strokeColor"),
		Type:          "string",
		DatasetValue:  nil,
		PropertyValue: v2.ValueFromUnsafe("#ff3343"),
	}
	fl2 := []*property.SealedField{}
	fl2 = append(fl2, &f2)
	item2 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl2,
		Groups:        nil,
	}
	il = append(il, &item2)
	v3 := property.ValueTypeNumber
	f3 := property.SealedField{
		ID:            id.PropertySchemaFieldID("strokeWidth"),
		Type:          "number",
		DatasetValue:  nil,
		PropertyValue: v3.ValueFromUnsafe(3),
	}
	fl3 := []*property.SealedField{}
	fl3 = append(fl3, &f3)
	item3 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaFieldID("default"),
		LinkedDataset: nil,
		Fields:        fl3,
		Groups:        nil,
	}
	il = append(il, &item3)
	sp := property.Sealed{
		Original: &pid,
		Items:    il,
	}
	l := merging.SealedLayerItem{
		SealedLayerCommon: merging.SealedLayerCommon{
			Merged: layer.Merged{
				Original:    lid,
				Parent:      nil,
				Name:        "test",
				Scene:       sid,
				Property:    nil,
				Infobox:     nil,
				PluginID:    &id.OfficialPluginID,
				ExtensionID: &ex,
			},
			Property: &sp,
			Infobox:  nil,
		}}

	reader, writer := io.Pipe()
	en := NewGeoJSONEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
		assert.NoError(t, err)
	}()

	strokeStr, _ := f2.PropertyValue.ValueString()
	width, _ := f3.PropertyValue.ValueNumber()
	expected := geojson.NewFeature(geojson.NewLineStringGeometry([][]float64{{5.34, 3.4, 100}, {2.34, 45.4, 100}, {654.34, 34.66, 100}}))
	expected.SetProperty("name", l.Name)
	expected.SetProperty("stroke", strokeStr)
	expected.SetProperty("stroke-width", width)
	reader2, writer2 := io.Pipe()
	var data []byte
	data, err = expected.MarshalJSON()
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		_, err = writer2.Write(data)
		assert.NoError(t, err)
	}()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(reader)
	assert.NoError(t, err)
	s := buf.String()
	buf2 := new(bytes.Buffer)
	_, err = buf2.ReadFrom(reader2)
	assert.NoError(t, err)
	s2 := buf2.String()
	assert.Equal(t, s2, s)
}
