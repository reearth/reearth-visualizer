package layer

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestInfobox(t *testing.T) {
	f1 := &InfoboxField{id: id.NewInfoboxFieldID()}
	f2 := &InfoboxField{id: id.NewInfoboxFieldID()}
	f3 := &InfoboxField{id: id.NewInfoboxFieldID()}
	f4 := &InfoboxField{id: id.NewInfoboxFieldID()}
	fields := []*InfoboxField{f1, f2, f3}
	infobox := NewInfobox(fields, id.NewPropertyID())

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

func TestInfobox_RemoveAllByPlugin(t *testing.T) {
	pid1 := id.MustPluginID("xxx~1.1.1")
	pid2 := id.MustPluginID("xxy~1.1.1")
	f1 := &InfoboxField{id: id.NewInfoboxFieldID(), plugin: pid1, extension: "a", property: id.NewPropertyID()}
	f2 := &InfoboxField{id: id.NewInfoboxFieldID(), plugin: pid2, extension: "b", property: id.NewPropertyID()}
	f3 := &InfoboxField{id: id.NewInfoboxFieldID(), plugin: pid1, extension: "c", property: id.NewPropertyID()}
	infobox := NewInfobox([]*InfoboxField{f1, f2, f3}, id.NewPropertyID())

	assert.Equal(t, []id.PropertyID(nil), (*Infobox)(nil).RemoveAllByPlugin(pid1))
	assert.Equal(t, []*InfoboxField{f1, f2, f3}, infobox.fields)
	assert.Equal(t, []id.PropertyID{f1.Property(), f3.Property()}, infobox.RemoveAllByPlugin(pid1))
	assert.Equal(t, []*InfoboxField{f2}, infobox.fields)
	assert.Equal(t, []id.PropertyID(nil), infobox.RemoveAllByPlugin(pid1))
	assert.Equal(t, []*InfoboxField{f2}, infobox.fields)
}
