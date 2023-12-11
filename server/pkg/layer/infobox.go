package layer

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/property"
)

type Infobox struct {
	property PropertyID
	fields   []*InfoboxField
	// for checking duplication
	ids map[InfoboxFieldID]struct{}
}

func NewInfobox(fields []*InfoboxField, p PropertyID) *Infobox {
	infobox := Infobox{
		property: p,
		fields:   make([]*InfoboxField, len(fields)),
		ids:      make(map[InfoboxFieldID]struct{}, len(fields)),
	}
	for i, f := range fields {
		if f == nil {
			continue
		}
		infobox.fields[i] = f
		infobox.ids[f.ID()] = struct{}{}
	}
	return &infobox
}

func (i *Infobox) Property() PropertyID {
	return i.property
}

func (i *Infobox) PropertyRef() *PropertyID {
	if i == nil {
		return nil
	}
	pid := i.property
	return &pid
}

func (i *Infobox) Fields() []*InfoboxField {
	if i == nil {
		return nil
	}
	return append([]*InfoboxField{}, i.fields...)
}

func (i *Infobox) Field(field InfoboxFieldID) *InfoboxField {
	for _, f := range i.fields {
		if f.ID() == field {
			return f
		}
	}
	return nil
}

func (i *Infobox) FieldAt(index int) *InfoboxField {
	if i == nil || index < 0 || len(i.fields) <= index {
		return nil
	}
	return i.fields[index]
}

func (i *Infobox) FieldsByPlugin(pid PluginID, eid *PluginExtensionID) []*InfoboxField {
	if i == nil {
		return nil
	}
	fields := make([]*InfoboxField, 0, len(i.fields))
	for _, f := range i.fields {
		if f.Plugin().Equal(pid) && (eid == nil || f.Extension() == *eid) {
			fields = append(fields, f)
		}
	}
	return fields
}

func (i *Infobox) Has(id InfoboxFieldID) bool {
	_, ok := i.ids[id]
	return ok
}

func (i *Infobox) Count() int {
	return len(i.fields)
}

func (i *Infobox) Add(field *InfoboxField, index int) {
	l := len(i.fields)
	if index < 0 || l <= index {
		index = l
	}

	id := field.ID()
	if i.Has(id) {
		return
	}
	i.fields = append(i.fields[:index], append([]*InfoboxField{field}, i.fields[index:]...)...)
	i.ids[id] = struct{}{}
}

func (i *Infobox) Move(field InfoboxFieldID, toIndex int) {
	for fromIndex, f := range i.fields {
		if f.ID() == field {
			i.MoveAt(fromIndex, toIndex)
			return
		}
	}
}

func (i *Infobox) MoveAt(fromIndex int, toIndex int) {
	l := len(i.fields)
	if fromIndex < 0 || l <= fromIndex {
		return
	}
	if toIndex < 0 || l <= toIndex {
		toIndex = l - 1
	}
	f := i.fields[fromIndex]

	i.fields = append(i.fields[:fromIndex], i.fields[fromIndex+1:]...)
	newSlice := make([]*InfoboxField, toIndex+1)
	copy(newSlice, i.fields[:toIndex])
	newSlice[toIndex] = f
	i.fields = append(newSlice, i.fields[toIndex:]...)
}

func (i *Infobox) Remove(field InfoboxFieldID) {
	for index, f := range i.fields {
		if f.ID() == field {
			i.RemoveAt(index)
			return
		}
	}
}

func (i *Infobox) RemoveAllByPlugin(pid PluginID, eid *PluginExtensionID) []PropertyID {
	if i == nil {
		return nil
	}

	var properties []PropertyID
	for j := 0; j < len(i.fields); j++ {
		if i.fields[j].plugin.Equal(pid) && (eid == nil || i.fields[j].Extension() == *eid) {
			properties = append(properties, i.fields[j].Property())
			i.fields = append(i.fields[:j], i.fields[j+1:]...)
			j--
		}
	}
	return properties
}

func (i *Infobox) RemoveAt(index int) {
	l := len(i.fields)
	if index < 0 || l <= index {
		index = l
	}

	f := i.fields[index]
	if index == l {
		i.fields = i.fields[:index]
	} else {
		i.fields = append(i.fields[:index], i.fields[index+1:]...)
	}
	delete(i.ids, f.ID())
}

func (i *Infobox) ValidateProperties(pm property.Map) error {
	if i == nil || pm == nil {
		return nil
	}

	lp := pm[i.property]
	if lp == nil {
		return errors.New("property does not exist")
	}
	if !lp.Schema().Equal(builtin.PropertySchemaIDInfobox) {
		return errors.New("property has a invalid schema")
	}

	for i, f := range i.fields {
		if err := f.ValidateProperty(pm); err != nil {
			return fmt.Errorf("field[%d](%s): %w", i, f.ID(), err)
		}
	}

	return nil
}

func (i *Infobox) Clone() *Infobox {
	if i == nil {
		return nil
	}

	clonedFields := make([]*InfoboxField, len(i.fields))
	for idx, field := range i.fields {
		if field != nil {
			clonedFields[idx] = field.Clone()
		}
	}

	clonedIDs := make(map[InfoboxFieldID]struct{})
	for id, val := range i.ids {
		clonedIDs[id] = val
	}

	return &Infobox{
		property: i.property,
		fields:   clonedFields,
		ids:      clonedIDs,
	}
}
