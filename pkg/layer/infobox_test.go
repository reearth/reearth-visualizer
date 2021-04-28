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
