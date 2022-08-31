package property

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
)

// Merged represents a merged property from two properties
type Merged struct {
	Original      *ID
	Parent        *ID
	Schema        SchemaID
	LinkedDataset *DatasetID
	Groups        []*MergedGroup
}

// MergedGroup represents a group of Merged
type MergedGroup struct {
	Original      *ItemID
	Parent        *ItemID
	SchemaGroup   SchemaGroupID
	LinkedDataset *DatasetID
	Groups        []*MergedGroup
	Fields        []*MergedField
}

// MergedField represents a field of Merged
type MergedField struct {
	ID         FieldID
	Type       ValueType
	Value      *Value
	Links      *Links
	Overridden bool
}

// Datasets returns associated dataset IDs
func (m *Merged) Datasets() []DatasetID {
	if m == nil {
		return nil
	}
	ids := []DatasetID{}
	for _, g := range m.Groups {
		ids = append(ids, g.Datasets()...)
	}
	return ids
}

// Datasets returns associated dataset IDs
func (m *MergedGroup) Datasets() []DatasetID {
	if m == nil {
		return nil
	}
	ids := []DatasetID{}
	for _, f := range m.Fields {
		if f == nil {
			continue
		}
		ids = append(ids, f.Links.DatasetIDs()...)
	}
	return ids
}

type MergedMetadata struct {
	Original      *ID
	Parent        *ID
	LinkedDataset *DatasetID
}

// MergedMetadataFrom generates MergedMetadata from single property
func MergedMetadataFrom(p ID) MergedMetadata {
	p2 := p
	return MergedMetadata{
		Original: &p2,
	}
}

// Properties returns associated property IDs
func (m MergedMetadata) Properties() []ID {
	ids := make([]ID, 0, 2)
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
	return Merge(o, p, m.LinkedDataset)
}

func (f *MergedField) DatasetValue(ctx context.Context, d dataset.GraphLoader) (*dataset.Value, error) {
	if f == nil {
		return nil, nil
	}
	return f.Links.DatasetValue(ctx, d)
}

// Merge merges two properties
func Merge(o *Property, p *Property, linked *DatasetID) *Merged {
	if o == nil && p == nil || o != nil && p != nil && !o.Schema().Equal(p.Schema()) {
		return nil
	}

	var schema SchemaID
	if p != nil {
		schema = p.Schema()
	} else if o != nil {
		schema = o.Schema()
	}

	return &Merged{
		Original:      o.IDRef(),
		Parent:        p.IDRef(),
		Schema:        schema,
		Groups:        mergeItems(o.Items(), p.Items(), linked.CloneRef()),
		LinkedDataset: linked.CloneRef(),
	}
}

func mergeItems(i1, i2 []Item, linked *DatasetID) []*MergedGroup {
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

		if mg := mergeItem(item, parentItem, linked); mg != nil {
			groups = append(groups, mg)
		}
	}

	for _, item := range i2 {
		if _, ok := consumed[item.ID()]; ok {
			continue
		}

		if mg := mergeItem(nil, item, linked); mg != nil {
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

func mergeItem(o, p Item, linked *DatasetID) *MergedGroup {
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
				mi = mergeItem(gg, nil, linked)
			} else {
				mi = mergeItem(nil, gg, linked)
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
			mf := mergeField(og.Field(k), pg.Field(k), linked)
			if mf != nil {
				mfields = append(mfields, mf)
			}
		}
	}

	var oid, pid *ItemID
	var sg SchemaGroupID
	if o != nil {
		oid = o.IDRef()
		sg = o.SchemaGroup()
	}
	if p != nil {
		pid = p.IDRef()
		sg = p.SchemaGroup()
	}

	return &MergedGroup{
		Original:      oid,
		Parent:        pid,
		SchemaGroup:   sg,
		Fields:        mfields,
		Groups:        mgroups,
		LinkedDataset: linked,
	}
}

func mergeField(original, parent *Field, linked *DatasetID) *MergedField {
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

	var links *Links
	if l := original.Links(); l != nil {
		// original links are used but dataset is overrided
		links = l.ApplyDataset(linked)
		overridden = parent != nil
	} else if l := parent.Links(); l != nil {
		// parent links are used and dataset is overrided
		links = l.ApplyDataset(linked)
	}

	return &MergedField{
		ID:         fid,
		Value:      v,
		Type:       t,
		Links:      links,
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
