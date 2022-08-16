package plugin

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/visualizer"
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
	assert.Equal(t, ExtensionID("xxx"), res.ID())
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

func TestExtensionBuilder_SingleOnly(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").SingleOnly(true).MustBuild()
	assert.Equal(t, true, res.SingleOnly())
}

func TestExtensionBuilder_Schema(t *testing.T) {
	var b = NewExtension()
	res := b.ID("xxx").Schema(MustPropertySchemaID("hoge~0.1.0/fff")).MustBuild()
	assert.Equal(t, MustPropertySchemaID("hoge~0.1.0/fff"), res.Schema())
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
	type args struct {
		icon          string
		id            ExtensionID
		extensionType ExtensionType
		system        bool
		ename         i18n.String
		description   i18n.String
		schema        PropertySchemaID
		visualizer    visualizer.Visualizer
		widgetLayout  *WidgetLayout
	}

	tests := []struct {
		name     string
		args     args
		expected *Extension
		err      error
	}{
		{
			name: "success not system",
			args: args{
				icon:          "ttt",
				id:            "xxx",
				extensionType: "ppp",
				system:        false,
				ename:         i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				schema:        MustPropertySchemaID("foo~1.1.1/hhh"),
				visualizer:    "vvv",
				widgetLayout: NewWidgetLayout(
					false, false, true, false, &WidgetLocation{
						Zone:    WidgetZoneOuter,
						Section: WidgetSectionLeft,
						Area:    WidgetAreaTop,
					},
				).Ref(),
			},
			expected: &Extension{
				id:            "xxx",
				extensionType: "ppp",
				name:          i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				icon:          "ttt",
				schema:        MustPropertySchemaID("foo~1.1.1/hhh"),
				visualizer:    "vvv",
				widgetLayout: NewWidgetLayout(
					false, false, true, false, &WidgetLocation{
						Zone:    WidgetZoneOuter,
						Section: WidgetSectionLeft,
						Area:    WidgetAreaTop,
					},
				).Ref(),
			},
		},
		{
			name: "fail not system type visualizer",
			args: args{
				extensionType: ExtensionTypeVisualizer,
			},
			err: ErrInvalidID,
		},
		{
			name: "fail not system type infobox",
			args: args{
				extensionType: ExtensionTypeInfobox,
			},
			err: ErrInvalidID,
		},
		{
			name: "fail nil id",
			err:  ErrInvalidID,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			e, err := NewExtension().
				ID(tc.args.id).
				Visualizer(tc.args.visualizer).
				Schema(tc.args.schema).
				System(tc.args.system).
				Type(tc.args.extensionType).
				Description(tc.args.description).
				Name(tc.args.ename).
				Icon(tc.args.icon).
				WidgetLayout(tc.args.widgetLayout).
				Build()
			if tc.err == nil {
				assert.Equal(t, tc.expected, e)
			} else {
				assert.Equal(t, tc.err, err)
			}
		})
	}
}

func TestExtensionBuilder_MustBuild(t *testing.T) {
	type args struct {
		icon          string
		id            ExtensionID
		extensionType ExtensionType
		system        bool
		ename         i18n.String
		description   i18n.String
		schema        PropertySchemaID
		visualizer    visualizer.Visualizer
		widgetLayout  *WidgetLayout
		singleOnly    bool
	}

	tests := []struct {
		name     string
		args     args
		expected *Extension
		err      error
	}{
		{
			name: "success not system",
			args: args{
				icon:          "ttt",
				id:            "xxx",
				extensionType: "ppp",
				system:        false,
				ename:         i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				schema:        MustPropertySchemaID("foo~1.1.1/hhh"),
				visualizer:    "vvv",
				singleOnly:    true,
				widgetLayout: NewWidgetLayout(
					false, false, true, false, &WidgetLocation{
						Zone:    WidgetZoneOuter,
						Section: WidgetSectionLeft,
						Area:    WidgetAreaTop,
					}).Ref(),
			},
			expected: &Extension{
				id:            "xxx",
				extensionType: "ppp",
				name:          i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				icon:          "ttt",
				schema:        MustPropertySchemaID("foo~1.1.1/hhh"),
				visualizer:    "vvv",
				singleOnly:    true,
				widgetLayout: NewWidgetLayout(
					false, false, true, false, &WidgetLocation{
						Zone:    WidgetZoneOuter,
						Section: WidgetSectionLeft,
						Area:    WidgetAreaTop,
					}).Ref(),
			},
		},
		{
			name: "fail not system type visualizer",
			args: args{
				extensionType: ExtensionTypeVisualizer,
			},
			err: ErrInvalidID,
		},
		{
			name: "fail not system type infobox",
			args: args{
				extensionType: ExtensionTypeInfobox,
			},
			err: ErrInvalidID,
		},
		{
			name: "fail nil id",
			err:  ErrInvalidID,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			build := func() *Extension {
				t.Helper()
				return NewExtension().
					ID(tc.args.id).
					Visualizer(tc.args.visualizer).
					Schema(tc.args.schema).
					System(tc.args.system).
					Type(tc.args.extensionType).
					Description(tc.args.description).
					Name(tc.args.ename).
					Icon(tc.args.icon).
					SingleOnly(tc.args.singleOnly).
					WidgetLayout(tc.args.widgetLayout).
					MustBuild()
			}

			if tc.err != nil {
				assert.PanicsWithValue(t, tc.err, func() { _ = build() })
			} else {
				assert.Equal(t, tc.expected, build())
			}
		})
	}
}
