package decoding

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Decoder = &ReearthDecoder{}

func TestReearthDecoder_Decode(t *testing.T) {
	sid := layer.NewSceneID()
	dsid := layer.NewDatasetSchemaID()
	did := layer.NewDatasetID()
	reearthjson := `{
		"reearth": 1,
		"layers": [
			{
				"plugin": "reearth",
				"extension": "marker",
				"name": "ABC",
				"infobox": {
					"blocks": [
						{
							"plugin": "reearth",
							"extension": "textblock"
						}
					]
				},
				"property": {
					"default": {
						"fields": {
							"latlng": {
								"type": "latlng",
								"value": {
									"lat": 1,
									"lng": 2
								}
							}
						}
					}
				},
				"layers": [
					{
						"name": "abc",
						"isVisible": true,
						"linkedDataset": "` + did.String() + `",
						"plugin": "reearth",
						"extension": "marker",
						"property": {
							"hoge": {
								"groups": [
									{
										"foobar": {
											"type": "string",
											"value": "bar"
										}
									},
									{
										"foobar": {
											"type": "string",
											"value": "foo"
										}
									}
								]
							}
						}
					}
				],
				"isVisible": false,
				"linkedDatasetSchema": "` + dsid.String() + `"
			}
		]
	}`

	p := NewReearthDecoder(json.NewDecoder(strings.NewReader(reearthjson)), sid)
	result, err := p.Decode()

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result.Layers))     // 2 layers
	assert.Equal(t, 4, len(result.Properties)) // 3 properties for 2 layers, 1 infobox, and 1 infobox field

	tr := true
	f := false

	// root layer
	rootLayer := result.Layers.Group(result.Root.LayerAt(0))
	assert.Equal(t, (&layer.Initializer{
		ID:         rootLayer.IDRef(),
		Plugin:     layer.OfficialPluginID.Ref(),
		Extension:  layer.PluginExtensionID("marker").Ref(),
		PropertyID: rootLayer.Property().Ref(),
		Name:       "ABC",
		Infobox: &layer.InitializerInfobox{
			PropertyID: rootLayer.Infobox().Property().Ref(),
			Fields: []*layer.InitializerInfoboxField{
				{
					ID:         rootLayer.Infobox().FieldAt(0).ID().Ref(),
					Plugin:     layer.OfficialPluginID,
					Extension:  layer.PluginExtensionID("textblock"),
					PropertyID: rootLayer.Infobox().FieldAt(0).Property().Ref(),
				},
			},
		},
		LayerIDs:            rootLayer.Layers().Layers(),
		IsVisible:           &f,
		LinkedDatasetSchema: &dsid,
	}).MustBeLayer(sid).RootLayer(), rootLayer)

	// second layer
	secondLayer := result.Layers.Item(rootLayer.Layers().LayerAt(0))
	assert.Equal(t, (&layer.Initializer{
		ID:            secondLayer.IDRef(),
		Plugin:        layer.OfficialPluginID.Ref(),
		Extension:     layer.PluginExtensionID("marker").Ref(),
		PropertyID:    secondLayer.Property().Ref(),
		Name:          "abc",
		IsVisible:     &tr,
		LinkedDataset: &did,
	}).MustBeLayer(sid).RootLayer(), secondLayer)

	// property of root layer
	prop := result.Properties[*rootLayer.Property()]
	assert.Equal(
		t,
		(&property.Initializer{
			ID:     prop.ID().Ref(),
			Schema: property.MustSchemaID("reearth/marker"),
			Items: []*property.InitializerItem{
				{
					ID:         prop.Items()[0].ID().Ref(),
					SchemaItem: property.SchemaGroupID("default"),
					Fields: []*property.InitializerField{
						{
							Field: property.FieldID("latlng"),
							Type:  property.ValueTypeLatLng,
							Value: property.ValueTypeLatLng.ValueFrom(property.LatLng{Lat: 1, Lng: 2}),
						},
					},
				},
			},
		}).MustBeProperty(sid),
		prop,
	)

	// property of infobox of root layer
	prop = result.Properties[rootLayer.Infobox().Property()]
	assert.Equal(
		t,
		(&property.Initializer{
			ID:     rootLayer.Infobox().PropertyRef(),
			Schema: property.MustSchemaID("reearth/infobox"),
		}).MustBeProperty(sid),
		prop,
	)

	// property of infobox field of root layer
	prop = result.Properties[rootLayer.Infobox().FieldAt(0).Property()]
	assert.Equal(
		t,
		(&property.Initializer{
			ID:     rootLayer.Infobox().FieldAt(0).PropertyRef(),
			Schema: property.MustSchemaID("reearth/textblock"),
		}).MustBeProperty(sid),
		prop,
	)

	// property of second layer
	prop = result.Properties[*secondLayer.Property()]
	assert.Equal(
		t,
		(&property.Initializer{
			ID:     prop.ID().Ref(),
			Schema: property.MustSchemaID("reearth/marker"),
			Items: []*property.InitializerItem{
				{
					ID:         prop.Items()[0].ID().Ref(),
					SchemaItem: property.SchemaGroupID("hoge"),
					Groups: []*property.InitializerGroup{
						{
							ID: property.ToGroupList(prop.Items()[0]).GroupAt(0).IDRef(),
							Fields: []*property.InitializerField{
								{
									Field: property.FieldID("foobar"),
									Type:  property.ValueTypeString,
									Value: property.ValueTypeString.ValueFrom("bar"),
								},
							},
						},
						{
							ID: property.ToGroupList(prop.Items()[0]).GroupAt(1).IDRef(),
							Fields: []*property.InitializerField{
								{
									Field: property.FieldID("foobar"),
									Type:  property.ValueTypeString,
									Value: property.ValueTypeString.ValueFrom("foo"),
								},
							},
						},
					},
				},
			},
		}).MustBeProperty(sid),
		prop,
	)
}
