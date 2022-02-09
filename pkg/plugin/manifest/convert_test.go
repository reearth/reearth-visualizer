package manifest

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/stretchr/testify/assert"
)

func TestToValue(t *testing.T) {
	v := property.ValueTypeBool
	var vv *property.Value = nil
	assert.Equal(t, toValue(false, "bool"), v.ValueFrom(false))
	assert.Equal(t, toValue("xx", "xxx"), vv)
}

func TestChoice(t *testing.T) {
	tests := []struct {
		name     string
		ch       *Choice
		expected *property.SchemaFieldChoice
	}{
		{
			name: "success",
			ch: &Choice{
				Icon:  "aaa",
				Key:   "nnn",
				Label: "vvv",
			},
			expected: &property.SchemaFieldChoice{
				Key:   "nnn",
				Title: i18n.StringFrom("vvv"),
				Icon:  "aaa",
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, *tt.expected, *tt.ch.choice())
		})
	}

}

func TestManifest(t *testing.T) {
	es := ""
	cesium := "cesium"
	a := "aaa"
	d := "ddd"
	r := "rrr"

	tests := []struct {
		name     string
		root     *Root
		expected *Manifest
		err      string
	}{
		{
			name: "success official plugin",
			root: &Root{
				Author:      &a,
				Name:        "aaa",
				ID:          "reearth",
				Description: &d,
				Extensions: []Extension{{
					Description: nil,
					ID:          "cesium",
					Name:        "",
					Schema:      nil,
					Type:        "visualizer",
					Visualizer:  &cesium,
				}},
				Repository: &r,
				System:     true,
				Version:    "1.1.1",
			},
			expected: &Manifest{
				Plugin: plugin.New().
					ID(plugin.OfficialPluginID).
					Name(i18n.StringFrom("aaa")).
					Extensions([]*plugin.Extension{
						plugin.NewExtension().
							ID("cesium").
							Visualizer("cesium").
							Type("visualizer").
							System(true).MustBuild(),
					}).MustBuild(),
				ExtensionSchema: nil,
				Schema:          nil,
			},
		},
		{
			name: "success empty name",
			root: &Root{
				Name:   "reearth",
				ID:     "reearth",
				System: true,
			},
			expected: &Manifest{
				Plugin:          plugin.New().ID(plugin.OfficialPluginID).Name(i18n.StringFrom("reearth")).MustBuild(),
				ExtensionSchema: nil,
				Schema:          nil,
			},
		},
		{
			name: "fail invalid manifest - extension",
			root: &Root{
				Author:      &a,
				Name:        "aaa",
				ID:          "reearth",
				Description: &d,
				Extensions: []Extension{{
					Description: nil,
					ID:          "cesium",
					Name:        "",
					Schema:      nil,
					Type:        "visualizer",
					Visualizer:  &es,
				}},
				Repository: &r,
				System:     true,
				Version:    "1.1.1",
			},
			expected: &Manifest{
				Plugin: plugin.New().
					ID(plugin.OfficialPluginID).
					Name(i18n.StringFrom("aaa")).
					Extensions([]*plugin.Extension{
						plugin.NewExtension().
							ID("cesium").
							Visualizer("cesium").
							Type("visualizer").
							System(true).
							MustBuild(),
					}).
					MustBuild(),
				ExtensionSchema: nil,
				Schema:          nil,
			},
			err: "invalid manifest: ext (cesium): visualizer missing",
		},
		{
			name: "fail invalid manifest - id",
			root: &Root{
				Name:   "",
				ID:     "",
				System: false,
			},
			expected: &Manifest{
				Plugin: plugin.New().
					ID(plugin.OfficialPluginID).
					Name(i18n.StringFrom("reearth")).
					MustBuild(),
			},
			err: "invalid manifest: invalid plugin id:   <nil>",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			m, err := tt.root.manifest(nil)
			if tt.err == "" {
				assert.Equal(t, tt.expected.Plugin.ID(), m.Plugin.ID())
				assert.Equal(t, tt.expected.Plugin.Name(), m.Plugin.Name())
				assert.Equal(t, len(tt.expected.Plugin.Extensions()), len(m.Plugin.Extensions()))
			} else {
				assert.Equal(t, tt.err, err.Error())
			}
		})
	}
}

func TestExtension(t *testing.T) {
	es := ""
	cesium := "cesium"
	d := "ddd"
	i := "xx:/aa.bb"
	tr := true

	tests := []struct {
		name       string
		ext        Extension
		sys        bool
		pid        plugin.ID
		expectedPE *plugin.Extension
		expectedPS *property.Schema
		err        string
	}{
		{
			name: "visualizer",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Icon:        &i,
				Schema:      nil,
				Type:        "visualizer",
				Visualizer:  &cesium,
			},
			sys: true,
			pid: plugin.OfficialPluginID,
			expectedPE: plugin.NewExtension().
				ID("cesium").
				Name(i18n.StringFrom("Cesium")).
				Visualizer("cesium").
				Type(plugin.ExtensionTypeVisualizer).
				System(true).
				Description(i18n.StringFrom("ddd")).
				Schema(property.MustSchemaID("reearth/cesium")).
				Icon(i).
				MustBuild(),
			expectedPS: property.NewSchema().
				ID(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
		},
		{
			name: "primitive",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "primitive",
				Visualizer:  &cesium,
			},
			sys: true,
			pid: plugin.OfficialPluginID,
			expectedPE: plugin.NewExtension().
				ID("cesium").
				Name(i18n.StringFrom("Cesium")).
				Visualizer("cesium").
				Type(plugin.ExtensionTypePrimitive).
				System(true).
				Description(i18n.StringFrom("ddd")).
				Schema(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
			expectedPS: property.NewSchema().
				ID(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
		},
		{
			name: "widget",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "widget",
				SingleOnly:  &tr,
			},
			sys: true,
			pid: plugin.OfficialPluginID,
			expectedPE: plugin.NewExtension().
				ID("cesium").
				Name(i18n.StringFrom("Cesium")).
				Visualizer("").
				Type(plugin.ExtensionTypeWidget).
				System(true).
				Description(i18n.StringFrom("ddd")).
				Schema(property.MustSchemaID("reearth/cesium")).
				SingleOnly(true).
				MustBuild(),
			expectedPS: property.NewSchema().
				ID(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
		},
		{
			name: "block",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "block",
			},
			sys: true,
			pid: plugin.OfficialPluginID,
			expectedPE: plugin.NewExtension().
				ID("cesium").Name(i18n.StringFrom("Cesium")).
				Visualizer("").
				Type(plugin.ExtensionTypeBlock).
				System(true).
				Description(i18n.StringFrom("ddd")).
				Schema(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
			expectedPS: property.NewSchema().
				ID(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
		},
		{
			name: "infobox",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "infobox",
				Visualizer:  &cesium,
			},
			sys: true,
			pid: plugin.OfficialPluginID,
			expectedPE: plugin.NewExtension().
				ID("cesium").
				Name(i18n.StringFrom("Cesium")).
				Visualizer("cesium").
				Type(plugin.ExtensionTypeInfobox).
				System(true).
				Description(i18n.StringFrom("ddd")).
				Schema(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
			expectedPS: property.NewSchema().
				ID(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
		},
		{
			name: "cluster",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "cluster",
				Visualizer:  &cesium,
			},
			sys: true,
			pid: plugin.OfficialPluginID,
			expectedPE: plugin.NewExtension().
				ID("cesium").
				Name(i18n.StringFrom("Cesium")).
				Visualizer("cesium").
				Type(plugin.ExtensionTypeCluster).
				System(true).
				Description(i18n.StringFrom("ddd")).
				Schema(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
			expectedPS: property.NewSchema().
				ID(property.MustSchemaID("reearth/cesium")).
				MustBuild(),
		},
		{
			name: "empty visualizer",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "visualizer",
				Visualizer:  &es,
			},
			sys:        true,
			pid:        plugin.OfficialPluginID,
			expectedPE: nil,
			expectedPS: nil,
			err:        "visualizer missing",
		},
		{
			name: "nil visualizer",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "visualizer",
				Visualizer:  nil,
			},
			sys:        true,
			pid:        plugin.OfficialPluginID,
			expectedPE: nil,
			expectedPS: nil,
			err:        "visualizer missing",
		},
		{
			name: "empty type",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Name:        "Cesium",
				Schema:      nil,
				Type:        "",
				Visualizer:  &cesium,
			},
			sys:        true,
			pid:        plugin.OfficialPluginID,
			expectedPE: nil,
			expectedPS: nil,
			err:        "type missing",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			pe, ps, err := tt.ext.extension(tt.pid, tt.sys)
			if tt.err == "" {
				assert.Equal(t, tt.expectedPE, pe)
				assert.Equal(t, tt.expectedPS, ps)
			} else {
				assert.Equal(t, tt.err, err.Error())
			}
		})
	}
}

func TestPointer(t *testing.T) {
	sg := "aaa"
	f := "xxx"

	tests := []struct {
		name     string
		pp       *PropertyPointer
		expected *property.SchemaFieldPointer
	}{
		{
			name:     "failed nil PropertyPointer",
			pp:       nil,
			expected: nil,
		},
		{
			name: "failed empty FieldID and SchemaGroupID",
			pp: &PropertyPointer{
				FieldID:       "",
				SchemaGroupID: "",
			},
			expected: nil,
		},
		{
			name: "success",
			pp: &PropertyPointer{
				FieldID:       "xxx",
				SchemaGroupID: "aaa",
			},
			expected: &property.SchemaFieldPointer{
				SchemaGroup: property.SchemaGroupID(sg),
				Field:       property.FieldID(f),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, tt.pp.pointer())
		})
	}
}

func TestCondition(t *testing.T) {
	v := toValue("xxx", "string")

	tests := []struct {
		name     string
		con      *PropertyCondition
		expected *property.Condition
	}{
		{
			name:     "failed nil condition",
			con:      nil,
			expected: nil,
		},
		{
			name: "success",
			con: &PropertyCondition{
				Field: "aaa",
				Type:  "string",
				Value: "xxx",
			},
			expected: &property.Condition{
				Field: "aaa",
				Value: v,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, tt.con.condition())
		})
	}
}

func TestLinkable(t *testing.T) {
	l := "location"
	d := "default"
	u := "url"

	tests := []struct {
		name     string
		p        *PropertyLinkableFields
		expected property.LinkableFields
	}{
		{
			name:     "nil linkable fields",
			p:        nil,
			expected: property.LinkableFields{},
		},
		{
			name: "success linkable fields",
			p: &PropertyLinkableFields{
				Latlng: &PropertyPointer{
					FieldID:       "location",
					SchemaGroupID: "default",
				},
				URL: &PropertyPointer{
					FieldID:       "url",
					SchemaGroupID: "default",
				},
			},
			expected: property.LinkableFields{
				LatLng: &property.SchemaFieldPointer{SchemaGroup: property.SchemaGroupID(d), Field: property.FieldID(l)},
				URL:    &property.SchemaFieldPointer{SchemaGroup: property.SchemaGroupID(d), Field: property.FieldID(u)},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, tt.p.linkable())
		})
	}
}

func TestSchema(t *testing.T) {
	str := "ddd"

	tests := []struct {
		name, psid string
		ps         *PropertySchema
		pid        plugin.ID
		expected   *property.Schema
		err        string
	}{
		{
			name: "fail invalid id",
			psid: "@",
			ps: &PropertySchema{
				Groups:   nil,
				Linkable: nil,
				Version:  0,
			},
			pid:      plugin.MustID("aaa~1.1.1"),
			expected: nil,
			err:      "invalid id: aaa~1.1.1/@",
		},
		{
			name:     "success nil PropertySchema",
			psid:     "marker",
			ps:       nil,
			pid:      plugin.OfficialPluginID,
			expected: property.NewSchema().ID(property.MustSchemaID("reearth/marker")).MustBuild(),
		},
		{
			name: "success ",
			psid: "marker",
			ps: &PropertySchema{
				Groups: []PropertySchemaGroup{{
					AvailableIf: nil,
					Description: &str,
					Fields: []PropertySchemaField{{
						AvailableIf:  nil,
						Choices:      nil,
						DefaultValue: nil,
						Description:  nil,
						ID:           "location",
						Max:          nil,
						Min:          nil,
						Title:        nil,
						Prefix:       nil,
						Suffix:       nil,
						Type:         "latlng",
						UI:           nil,
					}},
					ID:    "default",
					List:  false,
					Title: "marker",
				}},
				Linkable: nil,
				Version:  0,
			},
			pid: plugin.OfficialPluginID,
			expected: property.
				NewSchema().
				ID(property.MustSchemaID("reearth/marker")).
				Groups(property.NewSchemaGroupList([]*property.SchemaGroup{
					property.NewSchemaGroup().
						ID("default").
						Fields([]*property.SchemaField{
							property.NewSchemaField().
								ID("location").
								Type(property.ValueTypeLatLng).
								MustBuild()},
						).
						MustBuild()},
				)).
				MustBuild(),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res, err := tt.ps.schema(tt.pid, tt.psid)
			if tt.err == "" {
				assert.Equal(t, tt.expected.Groups().Len(), res.Groups().Len())
				assert.Equal(t, tt.expected.LinkableFields(), res.LinkableFields())
				assert.Equal(t, tt.expected.Version(), res.Version())
				if res.Groups().Len() > 0 {
					exg := tt.expected.Groups().Group(res.Groups().Groups()[0].ID())
					assert.NotNil(t, exg)
				}
			} else {
				assert.Equal(t, tt.err, err.Error())
			}
		})
	}
}

func TestSchemaGroup(t *testing.T) {
	str := "marker"
	des := "ddd"

	tests := []struct {
		name     string
		psg      PropertySchemaGroup
		expected *property.SchemaGroup
		err      string
	}{
		{
			name: "success reearth/cesium",
			psg: PropertySchemaGroup{
				AvailableIf: nil,
				Description: &des,
				Fields: []PropertySchemaField{{
					AvailableIf:  nil,
					Choices:      nil,
					DefaultValue: nil,
					Description:  nil,
					ID:           "location",
					Max:          nil,
					Min:          nil,
					Title:        nil,
					Prefix:       nil,
					Suffix:       nil,
					Type:         "latlng",
					UI:           nil,
				}},
				ID:    "default",
				List:  false,
				Title: "marker",
			},
			expected: property.NewSchemaGroup().
				ID("default").
				Title(i18n.StringFrom(str)).
				Fields([]*property.SchemaField{
					property.NewSchemaField().
						ID("location").
						Type(property.ValueTypeLatLng).
						MustBuild(),
				}).MustBuild(),
		},
		{
			name: "fail invalid schema field",
			psg: PropertySchemaGroup{
				AvailableIf: nil,
				Description: &des,
				Fields: []PropertySchemaField{{
					AvailableIf:  nil,
					Choices:      nil,
					DefaultValue: nil,
					Description:  nil,
					ID:           "location",
					Max:          nil,
					Min:          nil,
					Title:        nil,
					Prefix:       nil,
					Suffix:       nil,
					Type:         "xx",
					UI:           nil,
				}},
				ID:    "default",
				List:  false,
				Title: "marker",
			},
			expected: nil,
			err:      "field (location): invalid value type: xx",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res, err := tt.psg.schemaGroup()
			if tt.err == "" {
				assert.Equal(t, tt.expected.Title().String(), res.Title().String())
				assert.Equal(t, tt.expected.Title(), res.Title())
				assert.Equal(t, len(tt.expected.Fields()), len(res.Fields()))
				if len(res.Fields()) > 0 {
					exf := res.Fields()[0]
					assert.NotNil(t, tt.expected.Field(exf.ID()))
				}
			} else {
				assert.Equal(t, tt.err, err.Error())
			}
		})
	}
}

func TestSchemaField(t *testing.T) {
	str := "xx"

	tests := []struct {
		name     string
		psg      PropertySchemaField
		expected *property.SchemaField
		err      error
	}{
		{
			name: "success name not nil",
			psg: PropertySchemaField{
				AvailableIf:  nil,
				Choices:      nil,
				DefaultValue: nil,
				Description:  nil,
				ID:           "aaa",
				Max:          nil,
				Min:          nil,
				Title:        &str,
				Prefix:       nil,
				Suffix:       nil,
				Type:         "string",
				UI:           nil,
			},
			expected: property.NewSchemaField().ID("aaa").Name(i18n.StringFrom("xx")).Description(i18n.StringFrom("")).Type(property.ValueTypeString).MustBuild(),
			err:      nil,
		},
		{
			name: "success description not nil",
			psg: PropertySchemaField{
				AvailableIf:  nil,
				Choices:      nil,
				DefaultValue: nil,
				Description:  &str,
				ID:           "aaa",
				Max:          nil,
				Min:          nil,
				Title:        nil,
				Prefix:       nil,
				Suffix:       nil,
				Type:         "string",
				UI:           nil,
			},
			expected: property.NewSchemaField().ID("aaa").Name(i18n.StringFrom("")).Description(i18n.StringFrom("xx")).Type(property.ValueTypeString).MustBuild(),
			err:      nil,
		},
		{
			name: "success prefix not nil",
			psg: PropertySchemaField{
				AvailableIf:  nil,
				Choices:      nil,
				DefaultValue: nil,
				Description:  nil,
				ID:           "aaa",
				Max:          nil,
				Min:          nil,
				Title:        nil,
				Prefix:       &str,
				Suffix:       nil,
				Type:         "string",
				UI:           nil,
			},
			expected: property.NewSchemaField().
				ID("aaa").
				Prefix("xx").
				Name(i18n.StringFrom("")).
				Description(i18n.StringFrom("")).
				Type(property.ValueTypeString).
				MustBuild(),
			err: nil,
		},
		{
			name: "success suffix not nil",
			psg: PropertySchemaField{
				AvailableIf:  nil,
				Choices:      nil,
				DefaultValue: nil,
				Description:  nil,
				ID:           "aaa",
				Max:          nil,
				Min:          nil,
				Title:        nil,
				Prefix:       nil,
				Suffix:       &str,
				Type:         "string",
				UI:           nil,
			},
			expected: property.NewSchemaField().
				ID("aaa").
				Name(i18n.StringFrom("")).
				Description(i18n.StringFrom("")).
				Suffix("xx").
				Type(property.ValueTypeString).
				MustBuild(),
			err: nil,
		},
		{
			name: "success choices not empty",
			psg: PropertySchemaField{
				AvailableIf: nil,
				Choices: []Choice{
					{
						Icon:  "aaa",
						Key:   "nnn",
						Label: "vvv",
					},
				},
				DefaultValue: nil,
				Description:  nil,
				ID:           "aaa",
				Max:          nil,
				Min:          nil,
				Title:        nil,
				Prefix:       nil,
				Suffix:       nil,
				Type:         "string",
				UI:           nil,
			},
			expected: property.NewSchemaField().
				ID("aaa").
				Choices([]property.SchemaFieldChoice{
					{
						Key:   "nnn",
						Title: i18n.StringFrom("vvv"),
						Icon:  "aaa",
					},
				}).
				Type(property.ValueTypeString).
				Name(i18n.StringFrom("")).
				Description(i18n.StringFrom("")).
				MustBuild(),
			err: nil,
		},
		{
			name: "success choices empty key",
			psg: PropertySchemaField{
				AvailableIf: nil,
				Choices: []Choice{
					{
						Icon:  "aaa",
						Key:   "",
						Label: "vvv",
					},
				},
				DefaultValue: nil,
				Description:  nil,
				ID:           "aaa",
				Max:          nil,
				Min:          nil,
				Title:        nil,
				Prefix:       nil,
				Suffix:       nil,
				Type:         "string",
				UI:           nil,
			},
			expected: property.NewSchemaField().
				ID("aaa").
				Choices([]property.SchemaFieldChoice{}).
				Type(property.ValueTypeString).
				Name(i18n.StringFrom("")).
				Description(i18n.StringFrom("")).
				MustBuild(),
			err: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res, err := tt.psg.schemaField()
			if tt.err == nil {
				assert.Equal(t, tt.expected.Title(), res.Title())
				assert.Equal(t, tt.expected.Description(), res.Description())
				assert.Equal(t, tt.expected.Suffix(), res.Suffix())
				assert.Equal(t, tt.expected.Prefix(), res.Prefix())
				assert.Equal(t, tt.expected.Choices(), res.Choices())
			} else {
				assert.Equal(t, tt.err, rerror.Get(err).Err)
			}
		})
	}
}

func TestLayout(t *testing.T) {
	tr := true

	tests := []struct {
		name         string
		widgetLayout WidgetLayout
		expected     *plugin.WidgetLayout
	}{
		{
			name: "convert manifest widget layout to scene widget layout",
			widgetLayout: WidgetLayout{
				Extendable: &Extendable{
					Horizontally: &tr,
					Vertically:   nil,
				},
				Extended: nil,
				Floating: true,
				DefaultLocation: &Location{
					Zone:    "outer",
					Section: "left",
					Area:    "top",
				},
			},
			expected: plugin.NewWidgetLayout(true, false, false, true, &plugin.WidgetLocation{
				Zone:    plugin.WidgetZoneOuter,
				Section: plugin.WidgetSectionLeft,
				Area:    plugin.WidgetAreaTop,
			}).Ref(),
		},
		{
			name: "nil default location",
			widgetLayout: WidgetLayout{
				Extendable: &Extendable{
					Horizontally: nil,
					Vertically:   &tr,
				},
				Extended:        nil,
				Floating:        false,
				DefaultLocation: nil,
			},
			expected: plugin.NewWidgetLayout(false, true, false, false, nil).Ref(),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.widgetLayout.layout()
			assert.Equal(t, tt.expected, res)
		})
	}
}
