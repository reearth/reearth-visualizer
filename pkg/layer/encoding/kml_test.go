package encoding

import (
	"bytes"
	"io"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
	"github.com/twpayne/go-kml"
)

var _ Encoder = (*KMLEncoder)(nil)

func TestEncodeKMLMarker(t *testing.T) {
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
	v2 := property.ValueTypeNumber
	f2 := property.SealedField{
		ID:            id.PropertySchemaFieldID("imageSize"),
		Type:          "number",
		DatasetValue:  nil,
		PropertyValue: v2.ValueFromUnsafe(4),
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
	v3 := property.ValueTypeURL
	f3 := property.SealedField{
		ID:            id.PropertySchemaFieldID("image"),
		Type:          "url",
		DatasetValue:  nil,
		PropertyValue: v3.ValueFromUnsafe("http://maps.google.com/mapfiles/kml/pal4/icon28.png"),
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
	v4 := property.ValueTypeString
	f4 := property.SealedField{
		ID:            id.PropertySchemaFieldID("pointColor"),
		Type:          "string",
		DatasetValue:  nil,
		PropertyValue: v4.ValueFromUnsafe("#7fff00ff"),
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
	en := NewKMLEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
		assert.NoError(t, err)
	}()

	colorStr, _ := f4.PropertyValue.ValueString()
	sizeFloat, _ := f2.PropertyValue.ValueNumber()
	urlValue, _ := f3.PropertyValue.ValueURL()
	b, _ := getColor(colorStr)
	stid, err := en.generateStyleId(l.Original.String(), l.Name)
	assert.NoError(t, err)
	expected := kml.KML(kml.SharedStyle(stid, kml.IconStyle(
		kml.Scale(sizeFloat),
		kml.Color(b),
		kml.Icon(
			kml.Href(urlValue.String())))))
	expected = expected.Add(kml.Placemark(kml.Name("test"),
		kml.Point(kml.Coordinates(kml.Coordinate{
			Lon: v1.Lng,
			Lat: v1.Lat,
		})),
		kml.StyleURL("#"+stid)))
	reader2, writer2 := io.Pipe()
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		err = expected.WriteIndent(writer2, "", "  ")
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
func TestEncodeKMLPolygon(t *testing.T) {
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
		PropertyValue: v3.ValueFromUnsafe("#ff334353"),
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
	en := NewKMLEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
	}()
	fillColorStr, _ := f3.PropertyValue.ValueString()
	strokeColorStr, _ := f5.PropertyValue.ValueString()
	b1, _ := getColor(fillColorStr)
	b2, _ := getColor(strokeColorStr)
	stid, err := en.generateStyleId(l.Original.String(), l.Name)
	assert.NoError(t, err)
	expected := kml.KML(kml.SharedStyle(stid,
		kml.PolyStyle(
			kml.Fill(true),
			kml.Color(b1),
		),
		kml.LineStyle(
			kml.Outline(true),
			kml.Color(b2),
			kml.Width(3),
		)))
	expected = expected.Add(kml.Placemark(kml.Name("test"),
		kml.Polygon(kml.OuterBoundaryIs(kml.LinearRing(kml.Coordinates([]kml.Coordinate{
			{Lon: 5.34, Lat: 3.4, Alt: 100},
			{Lon: 2.34, Lat: 45.4, Alt: 100},
			{Lon: 654.34, Lat: 34.66, Alt: 100},
		}...)))),
		kml.StyleURL("#"+stid)))
	reader2, writer2 := io.Pipe()
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		err = expected.WriteIndent(writer2, "", "  ")
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
func TestEncodeKMLPolyline(t *testing.T) {
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
	en := NewKMLEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
	}()
	strokeColorStr, _ := f2.PropertyValue.ValueString()
	b1, _ := getColor(strokeColorStr)
	stid, err := en.generateStyleId(l.Original.String(), l.Name)
	assert.NoError(t, err)
	expected := kml.KML(kml.SharedStyle(stid,
		kml.LineStyle(
			kml.Color(b1),
			kml.Width(3),
		)))
	expected = expected.Add(kml.Placemark(kml.Name("test"),
		kml.LineString(kml.Coordinates([]kml.Coordinate{
			{Lon: 5.34, Lat: 3.4, Alt: 100},
			{Lon: 2.34, Lat: 45.4, Alt: 100},
			{Lon: 654.34, Lat: 34.66, Alt: 100},
		}...)),
		kml.StyleURL("#"+stid)))
	reader2, writer2 := io.Pipe()
	go func() {
		defer func() {
			_ = writer2.Close()
		}()
		err = expected.WriteIndent(writer2, "", "  ")
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
