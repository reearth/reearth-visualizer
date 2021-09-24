package plugin

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/visualizer"
	"github.com/stretchr/testify/assert"
)

func TestExtensionBuilder_Name(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").Name(i18n.StringFrom("nnn")).MustBuild()
	assert.Equal(t, i18n.StringFrom("nnn"), res.Name())
}

func TestExtensionBuilder_Description(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").Description(i18n.StringFrom("ddd")).MustBuild()
	assert.Equal(t, i18n.StringFrom("ddd"), res.Description())
}

func TestExtensionBuilder_ID(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").MustBuild()
	assert.Equal(t, id.PluginExtensionID("xxx"), res.ID())
}

func TestExtensionBuilder_Type(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").Type("ppp").MustBuild()
	assert.Equal(t, ExtensionType("ppp"), res.Type())
}

func TestExtensionBuilder_Icon(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").Icon("ccc").MustBuild()
	assert.Equal(t, "ccc", res.Icon())
}

func TestExtensionBuilder_Schema(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").Schema(id.MustPropertySchemaID("hoge~0.1.0/fff")).MustBuild()
	assert.Equal(t, id.MustPropertySchemaID("hoge~0.1.0/fff"), res.Schema())
}

func TestExtensionBuilder_Visualizer(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").Visualizer("ccc").MustBuild()
	assert.Equal(t, visualizer.Visualizer("ccc"), res.Visualizer())
}

func TestExtensionBuilder_WidgetLayout(t *testing.T) {
	var b = NewExtension()
	wl := NewWidgetLayout(
		false, true, false, false, nil,
	)
	res := b.ID("xxx").WidgetLayout(&wl).MustBuild()
	assert.Same(t, &wl, res.WidgetLayout())
}

func TestExtensionBuilder_Build(t *testing.T) {
	testCases := []struct {
		name, icon    string
		id            id.PluginExtensionID
		extensionType ExtensionType
		system        bool
		ename         i18n.String
		description   i18n.String
		schema        id.PropertySchemaID
		visualizer    visualizer.Visualizer
		widgetLayout  *WidgetLayout
		expected      *Extension
		err           error
	}{
		{
			name:          "success not system",
			icon:          "ttt",
			id:            "xxx",
			extensionType: "ppp",
			system:        false,
			ename:         i18n.StringFrom("nnn"),
			description:   i18n.StringFrom("ddd"),
			schema:        id.MustPropertySchemaID("foo~1.1.1/hhh"),
			visualizer:    "vvv",
			widgetLayout: NewWidgetLayout(
				false, false, true, false, &WidgetLocation{
					Zone:    WidgetZoneOuter,
					Section: WidgetSectionLeft,
					Area:    WidgetAreaTop,
				},
			).Ref(),
			expected: &Extension{
				id:            "xxx",
				extensionType: "ppp",
				name:          i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				icon:          "ttt",
				schema:        id.MustPropertySchemaID("foo~1.1.1/hhh"),
				visualizer:    "vvv",
				widgetLayout: NewWidgetLayout(
					false, false, true, false, &WidgetLocation{
						Zone:    WidgetZoneOuter,
						Section: WidgetSectionLeft,
						Area:    WidgetAreaTop,
					},
				).Ref(),
			},
			err: nil,
		},
		{
			name:          "fail not system type visualizer",
			extensionType: ExtensionTypeVisualizer,
			err:           id.ErrInvalidID,
		},
		{
			name:          "fail not system type infobox",
			extensionType: ExtensionTypeInfobox,
			err:           id.ErrInvalidID,
		},
		{
			name: "fail nil id",
			err:  id.ErrInvalidID,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			e, err := NewExtension().
				ID(tc.id).
				Visualizer(tc.visualizer).
				Schema(tc.schema).
				System(tc.system).
				Type(tc.extensionType).
				Description(tc.description).
				Name(tc.ename).
				Icon(tc.icon).
				WidgetLayout(tc.widgetLayout).
				Build()
			if tc.err == nil {
				assert.Equal(tt, tc.expected, e)
			} else {
				assert.Equal(tt, tc.err, err)
			}
		})
	}
}

func TestExtensionBuilder_MustBuild(t *testing.T) {
	testCases := []struct {
		name, icon    string
		id            id.PluginExtensionID
		extensionType ExtensionType
		system        bool
		ename         i18n.String
		description   i18n.String
		schema        id.PropertySchemaID
		visualizer    visualizer.Visualizer
		widgetLayout  *WidgetLayout
		expected      *Extension
	}{
		{
			name:          "success not system",
			icon:          "ttt",
			id:            "xxx",
			extensionType: "ppp",
			system:        false,
			ename:         i18n.StringFrom("nnn"),
			description:   i18n.StringFrom("ddd"),
			schema:        id.MustPropertySchemaID("foo~1.1.1/hhh"),
			visualizer:    "vvv",
			widgetLayout: NewWidgetLayout(
				false, false, true, false, &WidgetLocation{
					Zone:    WidgetZoneOuter,
					Section: WidgetSectionLeft,
					Area:    WidgetAreaTop,
				}).Ref(),
			expected: &Extension{
				id:            "xxx",
				extensionType: "ppp",
				name:          i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				icon:          "ttt",
				schema:        id.MustPropertySchemaID("foo~1.1.1/hhh"),
				visualizer:    "vvv",
				widgetLayout: NewWidgetLayout(
					false, false, true, false, &WidgetLocation{
						Zone:    WidgetZoneOuter,
						Section: WidgetSectionLeft,
						Area:    WidgetAreaTop,
					}).Ref(),
			},
		},
		{
			name:          "fail not system type visualizer",
			extensionType: ExtensionTypeVisualizer,
		},
		{
			name:          "fail not system type infobox",
			extensionType: ExtensionTypeInfobox,
		},
		{
			name: "fail nil id",
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			var e *Extension
			defer func() {
				if r := recover(); r == nil {
					assert.Equal(tt, tc.expected, e)

				}
			}()
			e = NewExtension().
				ID(tc.id).
				Visualizer(tc.visualizer).
				Schema(tc.schema).
				System(tc.system).
				Type(tc.extensionType).
				Description(tc.description).
				Name(tc.ename).
				Icon(tc.icon).
				WidgetLayout(tc.widgetLayout).
				MustBuild()
		})
	}
}
