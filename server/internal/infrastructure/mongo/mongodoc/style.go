package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"golang.org/x/exp/slices"
)

type StyleDocument struct {
	ID    string
	Name  string
	Value map[string]any
	Scene string
}

type StyleConsumer = Consumer[*StyleDocument, *scene.Style]

func NewStyleConsumer(scenes []id.SceneID) *StyleConsumer {
	return NewConsumer[*StyleDocument, *scene.Style](func(a *scene.Style) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func NewStyle(s scene.Style) (*StyleDocument, string) {
	id := s.ID().String()
	return &StyleDocument{
		ID:    id,
		Name:  s.Name(),
		Value: *s.Value(),
		Scene: s.Scene().String(),
	}, id
}

func NewStyles(styles scene.StyleList, f scene.IDList) ([]interface{}, []string) {
	res := make([]interface{}, 0, len(styles))
	ids := make([]string, 0, len(styles))
	for _, d := range styles {
		if d == nil {
			continue
		}
		d2 := *d
		if f != nil && !f.Has(d2.Scene()) {
			continue
		}
		r, id := NewStyle(d2)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func (d *StyleDocument) Model() (*scene.Style, error) {
	if d == nil {
		return nil, nil
	}

	sid, err := id.StyleIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	scid, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}

	return scene.NewStyle().
		ID(sid).
		Value(NewStyleValue(d.Value)).
		Name(d.Name).
		Scene(scid).
		Build()
}

func NewStyleValue(c map[string]any) *scene.StyleValue {
	config := scene.StyleValue(c)
	return &config
}
