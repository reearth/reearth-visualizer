package plugin

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/stretchr/testify/assert"
)

func TestExtension(t *testing.T) {
	expected := struct {
		ID           ExtensionID
		Type         ExtensionType
		Name         i18n.String
		Description  i18n.String
		Icon         string
		Schema       PropertySchemaID
		Visualizer   visualizer.Visualizer
		SingleOnly   bool
		WidgetLayout *WidgetLayout
	}{
		ID:           "xxx",
		Type:         ExtensionTypePrimitive,
		Name:         i18n.StringFrom("aaa"),
		Description:  i18n.StringFrom("ddd"),
		Icon:         "test",
		Schema:       MustPropertySchemaID("hoge~0.1.0/fff"),
		Visualizer:   "vvv",
		SingleOnly:   true,
		WidgetLayout: NewWidgetLayout(false, false, true, false, nil).Ref(),
	}

	actual := NewExtension().
		ID("xxx").
		Name(i18n.StringFrom("aaa")).
		Description(i18n.StringFrom("ddd")).
		Schema(MustPropertySchemaID("hoge~0.1.0/fff")).
		Icon("test").
		WidgetLayout(NewWidgetLayout(false, false, true, false, nil).Ref()).
		Visualizer("vvv").
		SingleOnly(true).
		Type(ExtensionTypePrimitive).
		MustBuild()

	assert.Equal(t, expected.Visualizer, actual.Visualizer())
	assert.Equal(t, expected.Type, actual.Type())
	assert.Equal(t, expected.Description, actual.Description())
	assert.Equal(t, expected.Name, actual.Name())
	assert.Equal(t, expected.Icon, actual.Icon())
	assert.Equal(t, expected.SingleOnly, actual.SingleOnly())
	assert.Equal(t, expected.WidgetLayout, actual.WidgetLayout())
	assert.Equal(t, expected.Schema, actual.Schema())
	assert.Equal(t, expected.ID, actual.ID())
}

func TestExtension_Rename(t *testing.T) {
	p := NewExtension().ID("aaa").Name(i18n.StringFrom("x")).MustBuild()
	p.Rename(i18n.StringFrom("z"))
	assert.Equal(t, i18n.StringFrom("z"), p.Name())
}

func TestExtension_SetDescription(t *testing.T) {
	p := NewExtension().ID("xx").MustBuild()
	p.SetDescription(i18n.StringFrom("xxx"))
	assert.Equal(t, i18n.StringFrom("xxx"), p.Description())
}
