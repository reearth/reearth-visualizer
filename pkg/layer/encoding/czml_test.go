package encoding

import (
	"bytes"
	"encoding/json"
	"io"
	"testing"

	"github.com/reearth/reearth-backend/pkg/czml"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Encoder = (*GeoJSONEncoder)(nil)

func TestEncodeCZMLPoint(t *testing.T) {
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
		SchemaGroup:   id.PropertySchemaGroupID("default"),
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
		SchemaGroup:   id.PropertySchemaGroupID("default"),
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
		SchemaGroup:   id.PropertySchemaGroupID("default"),
		LinkedDataset: nil,
		Fields:        fl3,
		Groups:        nil,
	}
	il = append(il, &item3)
	v4 := property.ValueTypeNumber
	f4 := property.SealedField{
		ID:            id.PropertySchemaFieldID("pointSize"),
		Type:          "number",
		DatasetValue:  nil,
		PropertyValue: v4.ValueFromUnsafe(2.4),
	}
	fl4 := []*property.SealedField{}
	fl4 = append(fl4, &f4)
	item4 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaGroupID("default"),
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
	en := NewCZMLEncoder(writer)
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
	size, _ := f4.PropertyValue.ValueNumber()
	expected := []*czml.Feature{}
	exPos := czml.Position{CartographicDegrees: []float64{v1.Lng, v1.Lat, height}}
	exPoint := czml.Point{
		Color:     colorStr,
		PixelSize: size,
	}
	exValue := czml.Feature{
		Id:       "",
		Name:     "test",
		Position: &exPos,
		Point:    &exPoint,
	}
	expected = append(expected, &exValue)
	reader2, writer2 := io.Pipe()
	exEn := json.NewEncoder(writer2)
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		err = exEn.Encode(expected)
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

func TestEncodeCZMLPolygon(t *testing.T) {
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
		SchemaGroup:   id.PropertySchemaGroupID("default"),
		LinkedDataset: nil,
		Fields:        fl1,
		Groups:        nil,
	}
	il := []*property.SealedItem{}
	il = append(il, &item1)
	v2 := property.ValueTypeBool
	f2 := property.SealedField{
		ID:            id.PropertySchemaFieldID("fill"),
		Type:          "bool",
		DatasetValue:  nil,
		PropertyValue: v2.ValueFromUnsafe(true),
	}
	fl2 := []*property.SealedField{}
	fl2 = append(fl2, &f2)
	item2 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaGroupID("default"),
		LinkedDataset: nil,
		Fields:        fl2,
		Groups:        nil,
	}
	il = append(il, &item2)
	v3 := property.ValueTypeString
	f3 := property.SealedField{
		ID:            id.PropertySchemaFieldID("fillColor"),
		Type:          "string",
		DatasetValue:  nil,
		PropertyValue: v3.ValueFromUnsafe("#ff000000"),
	}
	fl3 := []*property.SealedField{}
	fl3 = append(fl3, &f3)
	item3 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaGroupID("default"),
		LinkedDataset: nil,
		Fields:        fl3,
		Groups:        nil,
	}
	il = append(il, &item3)
	v4 := property.ValueTypeBool
	f4 := property.SealedField{
		ID:            id.PropertySchemaFieldID("stroke"),
		Type:          "bool",
		DatasetValue:  nil,
		PropertyValue: v4.ValueFromUnsafe(true),
	}
	fl4 := []*property.SealedField{}
	fl4 = append(fl4, &f4)
	item4 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaGroupID("default"),
		LinkedDataset: nil,
		Fields:        fl4,
		Groups:        nil,
	}
	il = append(il, &item4)
	v5 := property.ValueTypeString
	f5 := property.SealedField{
		ID:            id.PropertySchemaFieldID("strokeColor"),
		Type:          "string",
		DatasetValue:  nil,
		PropertyValue: v5.ValueFromUnsafe("#ff554555"),
	}
	fl5 := []*property.SealedField{}
	fl5 = append(fl5, &f5)
	item5 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaGroupID("default"),
		LinkedDataset: nil,
		Fields:        fl5,
		Groups:        nil,
	}
	il = append(il, &item5)
	v6 := property.ValueTypeNumber
	f6 := property.SealedField{
		ID:            id.PropertySchemaFieldID("strokeWidth"),
		Type:          "number",
		DatasetValue:  nil,
		PropertyValue: v6.ValueFromUnsafe(3),
	}
	fl6 := []*property.SealedField{}
	fl6 = append(fl6, &f6)
	item6 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaGroupID("default"),
		LinkedDataset: nil,
		Fields:        fl6,
		Groups:        nil,
	}
	il = append(il, &item6)
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
	en := NewCZMLEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
		assert.NoError(t, err)
	}()

	expected := []*czml.Feature{}
	exPos := czml.Position{CartographicDegrees: []float64{5.34, 3.4, 100, 2.34, 45.4, 100, 654.34, 34.66, 100}}
	exPoint := czml.Polygon{
		Positions: exPos,
		Fill:      true,
		Material: &czml.Material{SolidColor: &czml.SolidColor{Color: &czml.Color{
			RGBA: []int64{255, 0, 0, 0},
		}}},
		Stroke: true,
		StrokeColor: &czml.Color{
			RGBA: []int64{255, 85, 69, 85},
		},
		StrokeWidth: 3,
	}
	exValue := czml.Feature{
		Id:      "",
		Name:    "test",
		Polygon: &exPoint,
	}
	expected = append(expected, &exValue)
	reader2, writer2 := io.Pipe()
	exEn := json.NewEncoder(writer2)
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		err = exEn.Encode(expected)
		assert.NoError(t, err)
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

func TestEncodeCZMLPolyline(t *testing.T) {
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
		SchemaGroup:   id.PropertySchemaGroupID("default"),
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
		PropertyValue: v2.ValueFromUnsafe("#ff224222"),
	}
	fl2 := []*property.SealedField{}
	fl2 = append(fl2, &f2)
	item2 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   id.PropertySchemaGroupID("default"),
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
		SchemaGroup:   id.PropertySchemaGroupID("default"),
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
	en := NewCZMLEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
		assert.NoError(t, err)
	}()

	expected := []*czml.Feature{}
	exPos := czml.Position{CartographicDegrees: []float64{5.34, 3.4, 100, 2.34, 45.4, 100, 654.34, 34.66, 100}}
	exPolyline := czml.Polyline{
		Positions: exPos,
		Material: &czml.Material{PolylineOutline: &czml.PolylineOutline{Color: &czml.Color{
			RGBA: []int64{255, 34, 66, 34},
		}}},
		Width: 3,
	}
	exValue := czml.Feature{
		Id:       "",
		Name:     "test",
		Polyline: &exPolyline,
	}
	expected = append(expected, &exValue)
	reader2, writer2 := io.Pipe()
	exEn := json.NewEncoder(writer2)
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		err = exEn.Encode(expected)
		assert.NoError(t, err)
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
