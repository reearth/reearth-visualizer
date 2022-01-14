package builder

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestEncoder_Result(t *testing.T) {
	testCases := []struct {
		Name     string
		E        *encoder
		Expected []*layerJSON
	}{
		{
			Name:     "nil encoder",
			E:        nil,
			Expected: nil,
		},
		{
			Name: "success",
			E: &encoder{
				res: []*layerJSON{
					{
						ID:          "xxx",
						PluginID:    nil,
						ExtensionID: nil,
						Name:        "aaa",
						Property:    nil,
						Infobox:     nil,
					},
				},
			},
			Expected: []*layerJSON{
				{
					ID:          "xxx",
					PluginID:    nil,
					ExtensionID: nil,
					Name:        "aaa",
					Property:    nil,
					Infobox:     nil,
				},
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.E.Result()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestEncoder_Encode(t *testing.T) {
	testCases := []struct {
		Name     string
		E        *encoder
		SL       merging.SealedLayer
		Expected error
	}{
		{
			Name:     "nil encoder",
			E:        nil,
			SL:       nil,
			Expected: nil,
		},
		{
			Name:     "success encoding",
			E:        &encoder{},
			SL:       nil,
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.E.Encode(tc.SL)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestEncoder_Layers(t *testing.T) {
	lid := layer.NewID()
	sid := scene.NewID()
	pid := property.NewID()
	ex := layer.PluginExtensionID("marker")
	iid := property.NewItemID()
	v1 := property.LatLng{
		Lat: 4.4,
		Lng: 53.4,
	}

	f1 := property.SealedField{
		ID: property.FieldID("location"),
		Val: property.NewValueAndDatasetValue(
			property.ValueTypeLatLng,
			nil,
			property.ValueTypeLatLng.ValueFrom(v1),
		),
	}
	fl1 := []*property.SealedField{}
	fl1 = append(fl1, &f1)
	item1 := property.SealedItem{
		Original:      &iid,
		Parent:        nil,
		SchemaGroup:   property.SchemaGroupID("default"),
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
	sealed := &merging.SealedLayerItem{
		SealedLayerCommon: merging.SealedLayerCommon{
			Merged: layer.Merged{
				Original:    lid,
				Parent:      nil,
				Name:        "test",
				Scene:       sid,
				Property:    nil,
				Infobox:     nil,
				PluginID:    &layer.OfficialPluginID,
				ExtensionID: &ex,
			},
			Property: &sp,
			Infobox:  nil,
		}}
	testCases := []struct {
		Name     string
		E        *encoder
		SL       *merging.SealedLayerItem
		Expected *layerJSON
	}{
		{
			Name:     "nil layers",
			E:        &encoder{},
			SL:       nil,
			Expected: nil,
		},
		{
			Name: "success",
			E:    &encoder{},
			SL:   sealed,
			Expected: &layerJSON{
				ID:          lid.String(),
				PluginID:    layer.OfficialPluginID.StringRef(),
				ExtensionID: ex.StringRef(),
				Name:        "test",
				Property:    map[string]interface{}{"default": map[string]interface{}{"location": property.LatLng{Lat: 4.4, Lng: 53.4}}},
				Infobox:     nil,
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.E.layer(tc.SL)
			if res == nil {
				assert.Equal(tt, tc.Expected, res)
			} else {
				assert.Equal(tt, tc.Expected.Property, res.Property)
				assert.Equal(tt, tc.Expected.Infobox, res.Infobox)
				assert.Equal(tt, *tc.Expected.ExtensionID, *res.ExtensionID)
				assert.Equal(tt, tc.Expected.ID, res.ID)
				assert.Equal(tt, tc.Expected.Name, res.Name)
				assert.Equal(tt, *tc.Expected.PluginID, *res.PluginID)
			}
		})
	}
}
