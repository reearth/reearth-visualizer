package gqlmodel

import (
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

func (LayerItem) IsNode() {}

func (LayerGroup) IsNode() {}

func (l *PropertyFieldLink) Copy() *PropertyFieldLink {
	if l == nil {
		return nil
	}
	return &PropertyFieldLink{
		DatasetID:            l.DatasetID,
		DatasetSchemaID:      l.DatasetSchemaID,
		DatasetSchemaFieldID: l.DatasetSchemaFieldID,
	}
}

func (d *Dataset) Field(id ID) *DatasetField {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Fields {
		if f.FieldID == id {
			return f
		}
	}
	return nil
}

func (d *DatasetSchema) Field(id ID) *DatasetSchemaField {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Fields {
		if f.ID == id {
			return f
		}
	}
	return nil
}

func (d *Property) Field(id id.PropertyFieldID) *PropertyField {
	if d == nil || id == "" {
		return nil
	}
	for _, g := range d.Items {
		if gi, ok := g.(*PropertyGroup); ok {
			for _, f := range gi.Fields {
				if f.ID == string(id) {
					return f
				}
			}
		}
	}
	return nil
}

func (d *PropertySchema) Field(id ID) *PropertySchemaField {
	if d == nil || id == "" {
		return nil
	}
	for _, g := range d.Groups {
		for _, f := range g.Fields {
			if f.FieldID == id {
				return f
			}
		}
	}
	return nil
}

func (d *Plugin) Extension(id ID) *PluginExtension {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Extensions {
		if f.ExtensionID == id {
			return f
		}
	}
	return nil
}

func (d *Infobox) Field(id ID) *InfoboxField {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Fields {
		if f.ID == id {
			return f
		}
	}
	return nil
}

func (d *MergedInfobox) Field(id ID) *MergedInfoboxField {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Fields {
		if f.OriginalID == id {
			return f
		}
	}
	return nil
}

func AttachParentLayer(layers []*Layer, parent ID) []Layer {
	if layers == nil {
		return nil
	}
	res := make([]Layer, 0, len(layers))
	for _, l := range layers {
		if l == nil {
			res = append(res, nil)
			continue
		}
		l2 := *l
		if l2 == nil {
			res = append(res, nil)
			continue
		}
		if li, ok := l2.(*LayerItem); ok {
			li.ParentID = &parent
			res = append(res, li)
		} else if lg, ok := l2.(*LayerGroup); ok {
			lg.ParentID = &parent
			res = append(res, lg)
		}
	}
	return res
}

func NewEmptyPageInfo() *PageInfo {
	return ToPageInfo(usecasex.NewPageInfo(0, nil, nil, false, false))
}

func (d *PropertyGroup) Field(id ID) *PropertyField {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Fields {
		if f.ID == string(id) {
			return f
		}
	}
	return nil
}

func (d *PropertySchema) Group(id ID) *PropertySchemaGroup {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Groups {
		if f.SchemaGroupID == id {
			return f
		}
	}
	return nil
}

func (d *Property) Item(id ID) PropertyItem {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Items {
		switch g := f.(type) {
		case *PropertyGroup:
			if g.ID == id {
				return g
			}
		case *PropertyGroupList:
			if g.ID == id {
				return g
			}
			h := g.Group(id)
			if h != nil {
				return h
			}
		}
	}
	return nil
}

func (d *PropertyGroupList) Group(id ID) *PropertyGroup {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Groups {
		if f.ID == id {
			return f
		}
	}
	return nil
}

func (d *MergedProperty) PropertyID() *ID {
	if d.OriginalID != nil {
		return d.OriginalID
	} else if d.ParentID != nil {
		return d.ParentID
	}
	return nil
}

func (d *MergedProperty) GroupByOriginal(id ID) *MergedPropertyGroup {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Groups {
		if f.OriginalID != nil && *f.OriginalID == id {
			return f
		}
	}
	return nil
}

func (d *MergedProperty) GroupByParent(id ID) *MergedPropertyGroup {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Groups {
		if f.ParentID != nil && *f.ParentID == id {
			return f
		}
	}
	return nil
}

func (d *MergedPropertyGroup) PropertyID() *ID {
	if d.OriginalID != nil {
		return d.OriginalID
	} else if d.ParentID != nil {
		return d.ParentID
	}
	return nil
}

func (d *MergedPropertyGroup) GroupByOriginal(id ID) *MergedPropertyGroup {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Groups {
		if f.OriginalID != nil && *f.OriginalID == id {
			return f
		}
	}
	return nil
}

func (d *MergedPropertyGroup) GroupByParent(id ID) *MergedPropertyGroup {
	if d == nil || id == "" {
		return nil
	}
	for _, f := range d.Groups {
		if f.ParentID != nil && *f.ParentID == id {
			return f
		}
	}
	return nil
}

func (s *Scene) Widget(pluginID, extensionID ID) *SceneWidget {
	if s == nil {
		return nil
	}
	for _, w := range s.Widgets {
		if w.PluginID == pluginID && w.ExtensionID == extensionID {
			return w
		}
	}
	return nil
}

func (s *Scene) Plugin(pluginID ID) *ScenePlugin {
	if s == nil {
		return nil
	}
	for _, p := range s.Plugins {
		if p.PluginID == pluginID {
			return p
		}
	}
	return nil
}

type JSON map[string]any

const maxAttempts = 3

func (j *JSON) UnmarshalGQL(v interface{}) error {
	switch v := v.(type) {
	case string:
		if err := json.Unmarshal([]byte(v), &j); err != nil {
			return fmt.Errorf("cannot unmarshal string %v to JSON: %w", v, err)
		}
		return nil
	default:
		return fmt.Errorf("JSON must be a string, got: %T", v)
	}
}

func (j JSON) MarshalGQL(w io.Writer) {
	b, err := json.Marshal(j)
	if err != nil {
		b = []byte(`{"status":"error","message":"default behavior due to marshaling error"}`)
	}

	// Retry mechanism for writing
	for attempts := 0; attempts < maxAttempts; attempts++ {
		_, err = w.Write(b)
		if err == nil {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	// If after maxAttempts we still have an error, we silently fail.
}
