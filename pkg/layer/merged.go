package layer

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

// Merged represents a merged layer from two layers
type Merged struct {
	Original    id.LayerID
	Parent      *id.LayerID
	Name        string
	Scene       id.SceneID
	Property    *property.MergedMetadata
	Infobox     *MergedInfobox
	PluginID    *id.PluginID
	ExtensionID *id.PluginExtensionID
}

// MergedInfobox represents a merged info box from two layers
type MergedInfobox struct {
	Property *property.MergedMetadata
	Fields   []*MergedInfoboxField
}

// MergedInfoboxField represents a field of MergedInfobox
type MergedInfoboxField struct {
	ID        id.InfoboxFieldID
	Plugin    id.PluginID
	Extension id.PluginExtensionID
	Property  *property.MergedMetadata
}

// Merge merges two layers
func Merge(o Layer, p *Group) *Merged {
	if o == nil || p != nil && o.Scene() != p.Scene() {
		return nil
	}

	return &Merged{
		Original:    o.ID(),
		Parent:      p.IDRef().CopyRef(),
		Scene:       o.Scene(),
		Name:        o.Name(),
		PluginID:    o.Plugin().CopyRef(),
		ExtensionID: o.Extension().CopyRef(),
		Property: &property.MergedMetadata{
			Original:      o.Property(),
			Parent:        p.Property(),
			LinkedDataset: ToLayerItem(o).LinkedDataset(),
		},
		Infobox: MergeInfobox(o.Infobox(), p.Infobox(), ToLayerItem(o).LinkedDataset()),
	}
}

// MergeInfobox merges two infoboxes
func MergeInfobox(o *Infobox, p *Infobox, linked *id.DatasetID) *MergedInfobox {
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
func (m *Merged) Properties() []id.PropertyID {
	if m == nil {
		return nil
	}
	added := map[id.PropertyID]struct{}{}
	result := []id.PropertyID{}
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
