package property

import "github.com/reearth/reearth/server/pkg/id"

// Merged represents a merged property from two properties
type Merged struct {
	Original *id.PropertyID
	Parent   *id.PropertyID
	Schema   id.PropertySchemaID
	Groups   []*MergedGroup
}

// MergedGroup represents a group of Merged
type MergedGroup struct {
	Original    *ItemID
	Parent      *ItemID
	SchemaGroup id.PropertySchemaGroupID
	Groups      []*MergedGroup
	Fields      []*MergedField
}

// MergedField represents a field of Merged
type MergedField struct {
	ID         FieldID
	Type       ValueType
	Value      *Value
	Overridden bool
}

type MergedMetadata struct {
	Original *id.PropertyID
	Parent   *id.PropertyID
}

// MergedMetadataFrom generates MergedMetadata from single property
func MergedMetadataFrom(p id.PropertyID) MergedMetadata {
	p2 := p
	return MergedMetadata{
		Original: &p2,
	}
}

// Properties returns associated property IDs
func (m MergedMetadata) Properties() []id.PropertyID {
	ids := make([]id.PropertyID, 0, 2)
	if m.Original != nil {
		ids = append(ids, *m.Original)
	}
	if m.Parent != nil {
		ids = append(ids, *m.Parent)
	}
	return ids
}

// Merge merges two properties
func (m MergedMetadata) Merge(o *Property, p *Property) *Merged {
	if m.Original != nil && (o == nil || *m.Original != o.ID()) {
		return nil
	}
	if m.Parent != nil && (p == nil || *m.Parent != p.ID()) {
		return nil
	}
	return Merge(o, p)
}

// Merge merges two properties
func Merge(o *Property, p *Property) *Merged {
	if o == nil && p == nil || o != nil && p != nil && !o.Schema().Equal(p.Schema()) {
		return nil
	}

	var schema id.PropertySchemaID
	if p != nil {
		schema = p.Schema()
	} else if o != nil {
		schema = o.Schema()
	}

	return &Merged{
		Original: o.IDRef(),
		Parent:   p.IDRef(),
		Schema:   schema,
		Groups:   mergeItems(o.Items(), p.Items()),
	}
}

func mergeItems(i1, i2 []Item) []*MergedGroup {
	if i1 == nil && i2 == nil || len(i1) == 0 && len(i2) == 0 {
		return nil
	}

	consumed := map[ItemID]struct{}{}
	groups := []*MergedGroup{}

	for _, item := range i1 {
		sgid := item.SchemaGroup()

		var parentItem Item
		for _, item2 := range i2 {
			if item2.SchemaGroup() == sgid {
				parentItem = item2
				consumed[item2.ID()] = struct{}{}
			}
		}

		if mg := mergeItem(item, parentItem); mg != nil {
			groups = append(groups, mg)
		}
	}

	for _, item := range i2 {
		if _, ok := consumed[item.ID()]; ok {
			continue
		}

		if mg := mergeItem(nil, item); mg != nil {
			groups = append(groups, mg)
		}
	}

	return groups
}

func groupList(o, p Item) (*GroupList, *GroupList) {
	return ToGroupList(o), ToGroupList(p)
}

func group(o, p Item) (*Group, *Group) {
	return ToGroup(o), ToGroup(p)
}

func mergeItem(o, p Item) *MergedGroup {
	if o == nil && p == nil || o != nil && p != nil && o.SchemaGroup() != p.SchemaGroup() {
		return nil
	}

	var mgroups []*MergedGroup
	var mfields []*MergedField

	if og, pg := groupList(o, p); og != nil || pg != nil {
		// List merging
		var groups []*Group
		// if original exists, original is used
		if og != nil {
			groups = og.Groups()
		} else {
			groups = pg.Groups()
		}
		mgroups = make([]*MergedGroup, 0, len(groups))
		for _, gg := range groups {
			var mi *MergedGroup
			if og != nil {
				mi = mergeItem(gg, nil)
			} else {
				mi = mergeItem(nil, gg)
			}
			if mi != nil {
				mgroups = append(mgroups, mi)
			}
		}
	} else if og, pg := group(o, p); og != nil || pg != nil {
		// Group merging
		fieldKeys := allFields(og.FieldIDs(), pg.FieldIDs())
		mfields = make([]*MergedField, 0, len(fieldKeys))
		for _, k := range fieldKeys {
			mf := mergeField(og.Field(k), pg.Field(k))
			if mf != nil {
				mfields = append(mfields, mf)
			}
		}
	}

	var oid, pid *ItemID
	var sg id.PropertySchemaGroupID
	if o != nil {
		oid = o.IDRef()
		sg = o.SchemaGroup()
	}
	if p != nil {
		pid = p.IDRef()
		sg = p.SchemaGroup()
	}

	return &MergedGroup{
		Original:    oid,
		Parent:      pid,
		SchemaGroup: sg,
		Fields:      mfields,
		Groups:      mgroups,
	}
}

func mergeField(original, parent *Field) *MergedField {
	if original == nil && parent == nil || original != nil && parent != nil && (original.Field() != parent.Field() || original.Type() != parent.Type()) {
		return nil
	}

	var t ValueType
	if original != nil {
		t = original.Type()
	} else if parent != nil {
		t = parent.Type()
	}

	var fid FieldID
	if original != nil {
		fid = original.Field()
	} else if parent != nil {
		fid = parent.Field()
	}

	var v *Value
	overridden := false

	if original == nil && parent != nil {
		// parent value is used
		v = parent.Value().Clone()
	} else if original != nil {
		// overrided value is used
		v = original.Value().Clone()
		overridden = parent != nil
	}

	return &MergedField{
		ID:         fid,
		Value:      v,
		Type:       t,
		Overridden: overridden,
	}
}

func allFields(args ...[]FieldID) []FieldID {
	consumedKeys := map[FieldID]struct{}{}
	result := []FieldID{}
	for _, fields := range args {
		for _, f := range fields {
			if _, ok := consumedKeys[f]; ok {
				continue
			}
			consumedKeys[f] = struct{}{}
			result = append(result, f)
		}
	}
	return result
}
