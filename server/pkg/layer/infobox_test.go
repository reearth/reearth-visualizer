package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInfobox(t *testing.T) {
	f1 := &InfoboxField{id: NewInfoboxFieldID()}
	f2 := &InfoboxField{id: NewInfoboxFieldID()}
	f3 := &InfoboxField{id: NewInfoboxFieldID()}
	f4 := &InfoboxField{id: NewInfoboxFieldID()}
	fields := []*InfoboxField{f1, f2, f3}
	infobox := NewInfobox(fields, NewPropertyID())

	assert.NotNil(t, infobox)
	assert.Equal(t, fields, infobox.Fields())
	assert.Equal(t, f1, infobox.Field(f1.ID()))
	assert.Equal(t, f3, infobox.FieldAt(2))
	assert.Equal(t, 3, infobox.Count())
	assert.True(t, infobox.Has(f1.ID()))
	assert.False(t, infobox.Has(f4.ID()))

	infobox.Add(f4, 3)
	assert.True(t, infobox.Has(f4.ID()))
	assert.Equal(t, 4, infobox.Count())
	assert.Equal(t, f1, infobox.FieldAt(0))
	assert.Equal(t, f2, infobox.FieldAt(1))
	assert.Equal(t, f3, infobox.FieldAt(2))
	assert.Equal(t, f4, infobox.FieldAt(3))

	infobox.Move(f4.ID(), 2)
	assert.Equal(t, f1, infobox.FieldAt(0))
	assert.Equal(t, f2, infobox.FieldAt(1))
	assert.Equal(t, f4, infobox.FieldAt(2))
	assert.Equal(t, f3, infobox.FieldAt(3))

	infobox.Remove(f2.ID())
	assert.Equal(t, 3, infobox.Count())
	assert.False(t, infobox.Has(f2.ID()))
	assert.Nil(t, infobox.Field(f2.ID()))
	assert.Equal(t, f1, infobox.FieldAt(0))
	assert.Equal(t, f4, infobox.FieldAt(1))
	assert.Equal(t, f3, infobox.FieldAt(2))

	infobox.Move(f4.ID(), 2)
	assert.Equal(t, f1, infobox.FieldAt(0))
	assert.Equal(t, f3, infobox.FieldAt(1))
	assert.Equal(t, f4, infobox.FieldAt(2))
}

func TestInfobox_FieldsByPlugin(t *testing.T) {
	pid1 := MustPluginID("xxx~1.1.1")
	pid2 := MustPluginID("xxy~1.1.1")
	f1 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid1, extension: "a", property: NewPropertyID()}
	f2 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid2, extension: "b", property: NewPropertyID()}
	f3 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid1, extension: "c", property: NewPropertyID()}
	f4 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid2, extension: "d", property: NewPropertyID()}
	infobox := NewInfobox([]*InfoboxField{f1, f2, f3, f4}, NewPropertyID())

	assert.Equal(t, []*InfoboxField(nil), (*Infobox)(nil).FieldsByPlugin(pid1, nil))
	assert.Equal(t, []*InfoboxField{f1, f3}, infobox.FieldsByPlugin(pid1, nil))
	assert.Equal(t, []*InfoboxField{f2, f4}, infobox.FieldsByPlugin(pid2, nil))
	assert.Equal(t, []*InfoboxField{f2}, infobox.FieldsByPlugin(pid2, PluginExtensionID("b").Ref()))
}

func TestInfobox_RemoveAllByPlugin(t *testing.T) {
	pid1 := MustPluginID("xxx~1.1.1")
	pid2 := MustPluginID("xxy~1.1.1")
	f1 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid1, extension: "a", property: NewPropertyID()}
	f2 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid2, extension: "b", property: NewPropertyID()}
	f3 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid1, extension: "c", property: NewPropertyID()}
	f4 := &InfoboxField{id: NewInfoboxFieldID(), plugin: pid2, extension: "d", property: NewPropertyID()}
	infobox := NewInfobox([]*InfoboxField{f1, f2, f3, f4}, NewPropertyID())

	assert.Equal(t, []PropertyID(nil), (*Infobox)(nil).RemoveAllByPlugin(pid1, nil))
	assert.Equal(t, []*InfoboxField{f1, f2, f3, f4}, infobox.fields)
	assert.Equal(t, []PropertyID{f1.Property(), f3.Property()}, infobox.RemoveAllByPlugin(pid1, nil))
	assert.Equal(t, []*InfoboxField{f2, f4}, infobox.fields)
	assert.Equal(t, []PropertyID(nil), infobox.RemoveAllByPlugin(pid1, nil))
	assert.Equal(t, []*InfoboxField{f2, f4}, infobox.fields)
	assert.Equal(t, []PropertyID{f4.Property()}, infobox.RemoveAllByPlugin(pid2, PluginExtensionID("d").Ref()))
	assert.Equal(t, []*InfoboxField{f2}, infobox.fields)
}
