package manifest

import (
	"errors"
	"fmt"
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestToValue(t *testing.T) {
	v := property.ValueTypeBool
	var vv *property.Value = nil
	assert.Equal(t, toValue(false, "bool"), v.ValueFromUnsafe(false))
	assert.Equal(t, toValue("xx", "xxx"), vv)
}

func TestChoice(t *testing.T) {
	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, *tc.expected, *tc.ch.choice())
		})
	}

}

func TestManifest(t *testing.T) {
	a := "aaa"
	d := "ddd"
	r := "rrr"
	testCases := []struct {
		name     string
		root     *Root
		expected *Manifest
		err      error
	}{
		{
			name: "success official plugin",
			root: &Root{
				Author:      &a,
				Title:       "aaa",
				ID:          "reearth",
				Description: &d,
				Extensions: []Extension{{
					Description: nil,
					ID:          "cesium",
					Title:       "",
					Schema:      nil,
					Type:        "visualizer",
					Visualizer:  "cesium",
				}},
				Repository: &r,
				System:     true,
				Version:    "1.1.1",
			},
			expected: &Manifest{
				Plugin:          plugin.New().ID(id.OfficialPluginID).Name(i18n.StringFrom("aaa")).Extensions([]*plugin.Extension{plugin.NewExtension().ID("cesium").Visualizer("cesium").Type("visualizer").System(true).MustBuild()}).MustBuild(),
				ExtensionSchema: nil,
				Schema:          nil,
			},
			err: nil,
		},
		{
			name: "success empty name",
			root: &Root{
				Title:  "reearth",
				ID:     "reearth",
				System: true,
			},
			expected: &Manifest{
				Plugin:          plugin.New().ID(id.OfficialPluginID).Name(i18n.StringFrom("reearth")).MustBuild(),
				ExtensionSchema: nil,
				Schema:          nil,
			},
			err: nil,
		},
		{
			name: "fail invalid manifest - extension",
			root: &Root{
				Author:      &a,
				Title:       "aaa",
				ID:          "reearth",
				Description: &d,
				Extensions: []Extension{{
					Description: nil,
					ID:          "cesium",
					Title:       "",
					Schema:      nil,
					Type:        "visualizer",
					Visualizer:  "",
				}},
				Repository: &r,
				System:     true,
				Version:    "1.1.1",
			},
			expected: &Manifest{
				Plugin:          plugin.New().ID(id.OfficialPluginID).Name(i18n.StringFrom("aaa")).Extensions([]*plugin.Extension{plugin.NewExtension().ID("cesium").Visualizer("cesium").Type("visualizer").System(true).MustBuild()}).MustBuild(),
				ExtensionSchema: nil,
				Schema:          nil,
			},
			err: ErrInvalidManifest,
		},
		{
			name: "fail invalid manifest - id",
			root: &Root{
				Title:  "",
				ID:     "",
				System: false,
			},
			expected: &Manifest{
				Plugin: plugin.New().ID(id.OfficialPluginID).Name(i18n.StringFrom("reearth")).MustBuild(),
			},
			err: ErrInvalidManifest,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			m, err := tc.root.manifest(nil)
			if err == nil {
				assert.Equal(tt, tc.expected.Plugin.ID(), m.Plugin.ID())
				assert.Equal(tt, tc.expected.Plugin.Name(), m.Plugin.Name())
				assert.Equal(tt, len(tc.expected.Plugin.Extensions()), len(m.Plugin.Extensions()))
				//assert.Equal(tt,tc.expected.Schema..)
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestExtension(t *testing.T) {
	d := "ddd"
	i := "xx:/aa.bb"
	testCases := []struct {
		name       string
		ext        Extension
		sys        bool
		pid        id.PluginID
		expectedPE *plugin.Extension
		expectedPS *property.Schema
		err        error
	}{
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Icon:        &i,
				Schema:      nil,
				Type:        "visualizer",
				Visualizer:  "cesium",
			},
			sys:        true,
			pid:        id.OfficialPluginID,
			expectedPE: plugin.NewExtension().ID("cesium").Name(i18n.StringFrom("Cesium")).Visualizer("cesium").Type(plugin.ExtensionTypeVisualizer).System(true).Description(i18n.StringFrom("ddd")).MustBuild(),
			expectedPS: property.NewSchema().ID(id.MustPropertySchemaID("reearth/cesium")).MustBuild(),
			err:        nil,
		},
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Schema:      nil,
				Type:        "primitive",
				Visualizer:  "cesium",
			},
			sys:        true,
			pid:        id.OfficialPluginID,
			expectedPE: plugin.NewExtension().ID("cesium").Name(i18n.StringFrom("Cesium")).Visualizer("cesium").Type(plugin.ExtensionTypePrimitive).System(true).Description(i18n.StringFrom("ddd")).MustBuild(),
			expectedPS: property.NewSchema().ID(id.MustPropertySchemaID("reearth/cesium")).MustBuild(),
			err:        nil,
		},
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Schema:      nil,
				Type:        "widget",
				Visualizer:  "cesium",
			},
			sys:        true,
			pid:        id.OfficialPluginID,
			expectedPE: plugin.NewExtension().ID("cesium").Name(i18n.StringFrom("Cesium")).Visualizer("cesium").Type(plugin.ExtensionTypeWidget).System(true).Description(i18n.StringFrom("ddd")).MustBuild(),
			expectedPS: property.NewSchema().ID(id.MustPropertySchemaID("reearth/cesium")).MustBuild(),
			err:        nil,
		},
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Schema:      nil,
				Type:        "block",
				Visualizer:  "cesium",
			},
			sys:        true,
			pid:        id.OfficialPluginID,
			expectedPE: plugin.NewExtension().ID("cesium").Name(i18n.StringFrom("Cesium")).Visualizer("cesium").Type(plugin.ExtensionTypeBlock).System(true).Description(i18n.StringFrom("ddd")).MustBuild(),
			expectedPS: property.NewSchema().ID(id.MustPropertySchemaID("reearth/cesium")).MustBuild(),
			err:        nil,
		},
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Schema:      nil,
				Type:        "infobox",
				Visualizer:  "cesium",
			},
			sys:        true,
			pid:        id.OfficialPluginID,
			expectedPE: plugin.NewExtension().ID("cesium").Name(i18n.StringFrom("Cesium")).Visualizer("cesium").Type(plugin.ExtensionTypeInfobox).System(true).Description(i18n.StringFrom("ddd")).MustBuild(),
			expectedPS: property.NewSchema().ID(id.MustPropertySchemaID("reearth/cesium")).MustBuild(),
			err:        nil,
		},
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Schema:      nil,
				Type:        "visualizer",
				Visualizer:  "",
			},
			sys:        true,
			pid:        id.OfficialPluginID,
			expectedPE: nil,
			expectedPS: nil,
			err:        ErrInvalidManifest,
		},
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Schema:      nil,
				Type:        "",
				Visualizer:  "cesium",
			},
			sys:        true,
			pid:        id.OfficialPluginID,
			expectedPE: nil,
			expectedPS: nil,
			err:        ErrInvalidManifest,
		},
		{
			name: "success official extension",
			ext: Extension{
				Description: &d,
				ID:          "cesium",
				Title:       "Cesium",
				Schema:      nil,
				Type:        "visualizer",
				Visualizer:  "cesium",
			},
			sys:        false,
			pid:        id.OfficialPluginID,
			expectedPE: nil,
			expectedPS: nil,
			err:        ErrInvalidManifest,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			pe, ps, err := tc.ext.extension(tc.pid, tc.sys)
			if err == nil {
				assert.Equal(tt, tc.expectedPE.ID(), pe.ID())
				assert.Equal(tt, tc.expectedPE.Visualizer(), pe.Visualizer())
				assert.Equal(tt, tc.expectedPE.Type(), pe.Type())
				assert.Equal(tt, tc.expectedPE.Name(), pe.Name())
				assert.Equal(tt, tc.expectedPS.ID(), ps.ID())
				assert.Equal(tt, tc.expectedPS.ID(), ps.ID())
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestPointer(t *testing.T) {
	sg := "aaa"
	f := "xxx"
	testCases := []struct {
		name     string
		pp       *PropertyPointer
		expected *property.Pointer
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
			expected: property.NewPointer(id.PropertySchemaFieldIDFrom(&sg), nil, id.PropertySchemaFieldIDFrom(&f)),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, tc.pp.pointer())
		})
	}
}
func TestCondition(t *testing.T) {
	v := toValue("xxx", "string")
	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, tc.con.condition())
		})
	}
}

func TestLinkable(t *testing.T) {
	l := "location"
	d := "default"
	u := "url"
	testCases := []struct {
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
				LatLng: property.NewPointer(id.PropertySchemaFieldIDFrom(&d), nil, id.PropertySchemaFieldIDFrom(&l)),
				URL:    property.NewPointer(id.PropertySchemaFieldIDFrom(&d), nil, id.PropertySchemaFieldIDFrom(&u)),
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, tc.p.linkable())
		})
	}
}

func TestSchema(t *testing.T) {
	str := "ddd"
	testCases := []struct {
		name, psid string
		ps         *PropertySchema
		pid        id.PluginID
		expected   *property.Schema
		err        error
	}{
		{
			name: "fail invalid id",
			psid: "@",
			ps: &PropertySchema{
				Groups:   nil,
				Linkable: nil,
				Version:  0,
			},
			pid:      id.MustPluginID("aaa~1.1.1"),
			expected: nil,
			err:      id.ErrInvalidID,
		},
		{
			name:     "success nil PropertySchema",
			psid:     "marker",
			ps:       nil,
			pid:      id.OfficialPluginID,
			expected: property.NewSchema().ID(id.MustPropertySchemaID("reearth/marker")).MustBuild(),
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
			pid:      id.OfficialPluginID,
			expected: property.NewSchema().ID(id.MustPropertySchemaID("reearth/marker")).Groups([]*property.SchemaGroup{property.NewSchemaGroup().ID("default").Schema(id.MustPropertySchemaID("reearth/cesium")).Fields([]*property.SchemaField{property.NewSchemaField().ID("location").Type(property.ValueTypeLatLng).MustBuild()}).MustBuild()}).MustBuild(),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res, err := tc.ps.schema(tc.pid, tc.psid)
			if err == nil {
				assert.Equal(tt, len(tc.expected.Groups()), len(res.Groups()))
				assert.Equal(tt, tc.expected.LinkableFields(), res.LinkableFields())
				assert.Equal(tt, tc.expected.Version(), res.Version())
				if len(res.Groups()) > 0 {
					exg := tc.expected.Group(res.Groups()[0].ID())
					assert.NotNil(tt, exg)
				}
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestSchemaGroup(t *testing.T) {
	str := "marker"
	des := "ddd"
	testCases := []struct {
		name     string
		psg      PropertySchemaGroup
		sid      id.PropertySchemaID
		expected *property.SchemaGroup
		err      error
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
			sid:      id.MustPropertySchemaID("reearth/cesium"),
			expected: property.NewSchemaGroup().ID("default").Title(i18n.StringFrom("marker")).Title(i18n.StringFrom(str)).Schema(id.MustPropertySchemaID("reearth/cesium")).Fields([]*property.SchemaField{property.NewSchemaField().ID("location").Type(property.ValueTypeLatLng).MustBuild()}).MustBuild(),
			err:      nil,
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
			sid:      id.MustPropertySchemaID("reearth/cesium"),
			expected: nil,
			err:      fmt.Errorf("schema field: invalid value type"),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res, err := tc.psg.schemaGroup(tc.sid)
			if err == nil {
				assert.Equal(tt, tc.expected.Title().String(), res.Title().String())
				assert.Equal(tt, tc.expected.Title(), res.Title())
				assert.Equal(tt, tc.expected.Schema(), res.Schema())
				assert.Equal(tt, len(tc.expected.Fields()), len(res.Fields()))
				if len(res.Fields()) > 0 {
					exf := res.Fields()[0]
					assert.NotNil(tt, tc.expected.Field(exf.ID()))
				}
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestSchemaField(t *testing.T) {
	str := "xx"
	testCases := []struct {
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
			expected: property.NewSchemaField().ID("aaa").Prefix("xx").Name(i18n.StringFrom("")).Description(i18n.StringFrom("")).Type(property.ValueTypeString).MustBuild(),
			err:      nil,
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
			expected: property.NewSchemaField().ID("aaa").Name(i18n.StringFrom("")).Description(i18n.StringFrom("")).Suffix("xx").Type(property.ValueTypeString).MustBuild(),
			err:      nil,
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
			expected: property.NewSchemaField().ID("aaa").Choices([]property.SchemaFieldChoice{
				{
					Key:   "nnn",
					Title: i18n.StringFrom("vvv"),
					Icon:  "aaa",
				},
			}).Type(property.ValueTypeString).Name(i18n.StringFrom("")).Description(i18n.StringFrom("")).MustBuild(),
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
			expected: property.NewSchemaField().ID("aaa").Choices([]property.SchemaFieldChoice{}).Type(property.ValueTypeString).Name(i18n.StringFrom("")).Description(i18n.StringFrom("")).MustBuild(),
			err:      nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res, err := tc.psg.schemaField()
			if err == nil {
				assert.Equal(tt, tc.expected.Title(), res.Title())
				assert.Equal(tt, tc.expected.Description(), res.Description())
				assert.Equal(tt, tc.expected.Suffix(), res.Suffix())
				assert.Equal(tt, tc.expected.Prefix(), res.Prefix())
				assert.Equal(tt, tc.expected.Choices(), res.Choices())
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}
