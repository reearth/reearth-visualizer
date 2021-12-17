package gqlmodel

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
)

func ToTagItem(ti *tag.Item) *TagItem {
	if ti == nil {
		return nil
	}
	return &TagItem{
		ID:                    ti.ID().ID(),
		SceneID:               ti.Scene().ID(),
		Label:                 ti.Label(),
		ParentID:              ti.Parent().IDRef(),
		LinkedDatasetID:       ti.LinkedDatasetID().IDRef(),
		LinkedDatasetSchemaID: ti.LinkedDatasetSchemaID().IDRef(),
		LinkedDatasetFieldID:  ti.LinkedDatasetFieldID().IDRef(),
	}
}

func ToTagGroup(tg *tag.Group) *TagGroup {
	if tg == nil {
		return nil
	}
	tags := tg.Tags().Tags()
	ids := make([]*id.ID, 0, len(tags))
	for _, tid := range tags {
		if !tid.IsNil() {
			ids = append(ids, tid.IDRef())
		}
	}
	return &TagGroup{
		ID:      tg.ID().ID(),
		SceneID: tg.Scene().ID(),
		Label:   tg.Label(),
		TagIds:  ids,
	}
}

func ToTag(t tag.Tag) Tag {
	if t == nil {
		return nil
	}
	switch ty := t.(type) {
	case *tag.Item:
		return ToTagItem(ty)
	case *tag.Group:
		return ToTagGroup(ty)
	}
	return nil
}
