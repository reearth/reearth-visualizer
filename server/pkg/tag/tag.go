package tag

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
)

var (
	ErrEmptyLabel     = errors.New("tag label can't be empty")
	ErrInvalidSceneID = errors.New("invalid scene ID")
)

type tag struct {
	id      ID
	label   string
	sceneId id.SceneID
}

type Tag interface {
	ID() ID
	Scene() id.SceneID
	Label() string
	Rename(string)
}

func (t *tag) ID() ID {
	return t.id
}

func (t *tag) Scene() id.SceneID {
	return t.sceneId
}

func (t *tag) Label() string {
	return t.label
}

func (t *tag) Rename(s string) {
	t.label = s
}

func ToTagGroup(t Tag) *Group {
	if tg, ok := t.(*Group); ok {
		return tg
	}
	return nil
}

func ToTagItem(t Tag) *Item {
	if ti, ok := t.(*Item); ok {
		return ti
	}
	return nil
}
