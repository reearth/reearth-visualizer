package layer

import (
	"github.com/reearth/reearth/server/pkg/property"
)

// Merged represents a merged layer from two layers
type Merged struct {
	Original    ID
	Parent      *ID
	Name        string
	Scene       SceneID
	Property    *property.MergedMetadata
	Infobox     *MergedInfobox
	PluginID    *PluginID
	ExtensionID *PluginExtensionID
	IsVisible   bool
	Tags        []MergedTag
}

// MergedTag represents a merged tag from two layers
type MergedTag struct {
	ID   TagID
	Tags []MergedTag
}

// MergedInfobox represents a merged info box from two layers
type MergedInfobox struct {
	Property *property.MergedMetadata
	Fields   []*MergedInfoboxField
}

// MergedInfoboxField represents a field of MergedInfobox
type MergedInfoboxField struct {
	ID        InfoboxFieldID
	Plugin    PluginID
	Extension PluginExtensionID
	Property  *property.MergedMetadata
}

// Merge merges two layers
func Merge(o Layer, p *Group) *Merged {
	if o == nil || p != nil && o.Scene() != p.Scene() {
		return nil
	}

	return &Merged{
		Original:    o.ID(),
		Parent:      p.IDRef().CloneRef(),
		Scene:       o.Scene(),
		Name:        o.Name(),
		PluginID:    o.Plugin().CloneRef(),
		ExtensionID: o.Extension().CloneRef(),
		Property: &property.MergedMetadata{
			Original:      o.Property(),
			Parent:        p.Property(),
			LinkedDataset: ToLayerItem(o).LinkedDataset(),
		},
		IsVisible: o.IsVisible(),
		Tags:      MergeTags(o.Tags(), p.Tags()),
		Infobox:   MergeInfobox(o.Infobox(), p.Infobox(), ToLayerItem(o).LinkedDataset()),
	}
}

// MergeInfobox merges two tag lists
func MergeTags(o, _p *TagList) []MergedTag {
	// Currently parent tags are ignored
	tags := o.Tags()
	if len(tags) == 0 {
		return nil
	}
	res := make([]MergedTag, 0, len(tags))
	for _, t := range tags {
		tags := TagGroupFrom(t).Children()

		var tags2 []MergedTag
		if len(tags) > 0 {
			tags2 = make([]MergedTag, 0, len(tags))
			for _, t := range tags {
				tags2 = append(tags2, MergedTag{ID: t.ID()})
			}
		}

		res = append(res, MergedTag{
			ID:   t.ID(),
			Tags: tags2,
		})
	}
	return res
}

// MergeInfobox merges two infoboxes
func MergeInfobox(o *Infobox, p *Infobox, linked *DatasetID) *MergedInfobox {
	if o == nil && p == nil {
		return nil
	}

	var ibf []*InfoboxField
	if o != nil {
		ibf = o.Fields()
	} else if p != nil {
		ibf = p.Fields()
	}

	fields := make([]*MergedInfoboxField, 0, len(ibf))
	for _, f := range ibf {
		p := f.Property()
		fields = append(fields, &MergedInfoboxField{
			ID:        f.ID(),
			Plugin:    f.Plugin(),
			Extension: f.Extension(),
			Property: &property.MergedMetadata{
				Original:      &p,
				Parent:        nil,
				LinkedDataset: linked,
			},
		})
	}

	return &MergedInfobox{
		Fields: fields,
		Property: &property.MergedMetadata{
			Original:      o.PropertyRef(),
			Parent:        p.PropertyRef(),
			LinkedDataset: linked,
		},
	}
}

// Properties returns all property IDs in Merged
func (m *Merged) Properties() []PropertyID {
	if m == nil {
		return nil
	}
	added := map[PropertyID]struct{}{}
	result := []PropertyID{}
	if m.Property != nil {
		if m.Property.Original != nil {
			t := *m.Property.Original
			if _, ok := added[t]; !ok {
				result = append(result, t)
				added[t] = struct{}{}
			}
		}
		if m.Property.Parent != nil {
			t := *m.Property.Parent
			if _, ok := added[t]; !ok {
				result = append(result, t)
				added[t] = struct{}{}
			}
		}
	}
	if m.Infobox != nil && m.Infobox.Property != nil {
		if m.Infobox.Property.Original != nil {
			t := *m.Infobox.Property.Original
			if _, ok := added[t]; !ok {
				result = append(result, t)
				added[t] = struct{}{}
			}
		}
		if m.Infobox.Property.Parent != nil {
			t := *m.Infobox.Property.Parent
			if _, ok := added[t]; !ok {
				result = append(result, t)
				added[t] = struct{}{}
			}
		}
	}
	if m.Infobox != nil {
		for _, f := range m.Infobox.Fields {
			if f.Property.Original != nil {
				t := *f.Property.Original
				if _, ok := added[t]; !ok {
					result = append(result, t)
					added[t] = struct{}{}
				}
			}
			if f.Property.Parent != nil {
				t := *f.Property.Parent
				if _, ok := added[t]; !ok {
					result = append(result, t)
					added[t] = struct{}{}
				}
			}
		}
	}
	return result
}

func (m *Merged) AllTags() (res []MergedTag) {
	if m == nil {
		return nil
	}
	for _, t := range m.Tags {
		res = append(res, append([]MergedTag{t}, t.Tags...)...)
	}
	return res
}

func (m *Merged) AllTagIDs() (res []TagID) {
	if m == nil {
		return nil
	}
	for _, t := range m.AllTags() {
		res = append(res, t.ID)
	}
	return res
}
