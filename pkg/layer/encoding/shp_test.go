package encoding

import (
	"io"
	"os"
	"testing"

	"github.com/jonas-p/go-shp"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Encoder = (*SHPEncoder)(nil)

func TestEncodeSHPMarker(t *testing.T) {
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

	sp := property.Sealed{
		Original: &pid,
		Items:    il,
	}
	l := merging.SealedLayerItem{
		SealedLayerCommon: merging.SealedLayerCommon{
			Merged: layer.Merged{
				Original:    lid,
				Parent:      nil,
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
	en := NewSHPEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
		assert.NoError(t, err)
	}()
	tmpFile, err := os.CreateTemp(os.TempDir(), "*.shp")
	assert.NoError(t, err)
	defer func() {
		err := os.Remove(tmpFile.Name())
		assert.NoError(t, err)
	}()
	b, err := io.ReadAll(reader)
	assert.NoError(t, err)
	_, err = tmpFile.Write(b)
	assert.NoError(t, err)
	err = tmpFile.Close()
	assert.NoError(t, err)
	shape, err := shp.Open(tmpFile.Name())
	assert.NoError(t, err)
	defer func() {
		err := shape.Close()
		assert.NoError(t, err)
	}()
	var expected *shp.Point
	var ok bool
	for shape.Next() {
		_, p := shape.Shape()
		expected, ok = p.(*shp.Point)
	}
	assert.Equal(t, true, ok)
	assert.Equal(t, expected, &shp.Point{
		X: 53.4,
		Y: 4.4,
	})
}
func TestEncodeSHPPolygon(t *testing.T) {
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
	sp := property.Sealed{
		Original: &pid,
		Items:    il,
	}
	l := merging.SealedLayerItem{
		SealedLayerCommon: merging.SealedLayerCommon{
			Merged: layer.Merged{
				Original:    lid,
				Parent:      nil,
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
	en := NewSHPEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
	}()
	tmpFile, err := os.CreateTemp(os.TempDir(), "*.shp")
	assert.NoError(t, err)
	defer func() {
		err := os.Remove(tmpFile.Name())
		assert.NoError(t, err)
	}()
	b, err := io.ReadAll(reader)
	assert.NoError(t, err)
	_, err = tmpFile.Write(b)
	assert.NoError(t, err)
	err = tmpFile.Close()
	assert.NoError(t, err)
	shape, err := shp.Open(tmpFile.Name())
	assert.NoError(t, err)
	defer func() {
		err := shape.Close()
		assert.NoError(t, err)
	}()
	var expected *shp.Polygon
	var ok bool
	for shape.Next() {
		_, p := shape.Shape()
		expected, ok = p.(*shp.Polygon)
	}
	assert.Equal(t, true, ok)
	assert.Equal(t, expected, &shp.Polygon{Box: shp.Box{MinX: 5.34, MinY: 3.4, MaxX: 654.34, MaxY: 34.66}, NumParts: 1, NumPoints: 3, Parts: []int32{0}, Points: []shp.Point{{X: 5.34, Y: 3.4}, {X: 2.34, Y: 45.4}, {X: 654.34, Y: 34.66}}})
}

func TestEncodeSHPPolyline(t *testing.T) {
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
	en := NewSHPEncoder(writer)
	var err error
	go func() {
		defer func() {
			_ = writer.Close()
		}()
		err = en.Encode(&l)
	}()
	tmpFile, err := os.CreateTemp(os.TempDir(), "*.shp")
	assert.NoError(t, err)
	defer func() {
		err := os.Remove(tmpFile.Name())
		assert.NoError(t, err)

	}()
	b, err := io.ReadAll(reader)
	assert.NoError(t, err)
	_, err = tmpFile.Write(b)
	assert.NoError(t, err)
	err = tmpFile.Close()
	assert.NoError(t, err)
	shape, err := shp.Open(tmpFile.Name())
	assert.NoError(t, err)
	defer func() {
		err := shape.Close()
		assert.NoError(t, err)
	}()
	var expected *shp.PolyLine
	var ok bool
	for shape.Next() {
		_, p := shape.Shape()
		expected, ok = p.(*shp.PolyLine)
	}
	assert.Equal(t, true, ok)
	assert.Equal(t, expected, &shp.PolyLine{Box: shp.Box{MinX: 102, MinY: 0, MaxX: 104, MaxY: 0}, NumParts: 1, NumPoints: 3, Parts: []int32{0}, Points: []shp.Point{{X: 5.34, Y: 3.4}, {X: 2.34, Y: 45.4}, {X: 654.34, Y: 34.66}}})
}
