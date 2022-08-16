package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/tag"
	"github.com/reearth/reearthx/util"
)

func ToTagItem(ti *tag.Item) *TagItem {
	if ti == nil {
		return nil
	}

	return &TagItem{
		ID:                    IDFrom(ti.ID()),
		SceneID:               IDFrom(ti.Scene()),
		Label:                 ti.Label(),
		ParentID:              IDFromRef(ti.Parent()),
		LinkedDatasetID:       IDFromRef(ti.LinkedDatasetID()),
		LinkedDatasetSchemaID: IDFromRef(ti.LinkedDatasetSchemaID()),
		LinkedDatasetFieldID:  IDFromRef(ti.LinkedDatasetFieldID()),
	}
}

func ToTagGroup(tg *tag.Group) *TagGroup {
	if tg == nil {
		return nil
	}

	return &TagGroup{
		ID:      IDFrom(tg.ID()),
		SceneID: IDFrom(tg.Scene()),
		Label:   tg.Label(),
		TagIds:  util.Map(tg.Tags(), IDFrom[id.Tag]),
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
