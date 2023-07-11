package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type StorytellingDocument struct {
	Id          string
	Property    string
	Scene       string
	Title       string
	Alias       string
	Pages       []PageDocument
	Status      string
	PublishedAt *time.Time
	UpdatedAt   time.Time
	Index       int
}

type PageDocument struct {
	Id          string
	Property    string
	Title       string
	Swipe       bool
	Layers      []string
	SwipeLayers []string
	Blocks      []BlockDocument
}

type BlockDocument struct {
	Id        string
	Plugin    string
	Extension string
	Property  string
}

type StorytellingConsumer = Consumer[*StorytellingDocument, *storytelling.Story]

func NewStorytellingConsumer(scenes []id.SceneID) *StorytellingConsumer {
	return NewConsumer[*StorytellingDocument, *storytelling.Story](func(a *storytelling.Story) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func NewStorytelling(s *storytelling.Story) (*StorytellingDocument, string) {
	sId := s.Id().String()

	return &StorytellingDocument{
		Id:          s.Id().String(),
		Property:    s.Property().String(),
		Scene:       s.Scene().String(),
		Title:       s.Title(),
		Alias:       s.Alias(),
		Pages:       newPages(s.Pages()),
		Status:      string(s.Status()),
		PublishedAt: s.PublishedAt(),
		UpdatedAt:   s.UpdatedAt(),
		Index:       1,
	}, sId
}

func newPage(p storytelling.Page) PageDocument {
	return PageDocument{}
}

func newPages(pl storytelling.PageList) []PageDocument {
	return lo.Map(pl, func(p *storytelling.Page, _ int) PageDocument {
		if p == nil {
			return PageDocument{}
		}
		return newPage(*p)
	})
}

func NewStorytellings(sl *storytelling.StoryList) ([]any, []string) {
	if sl == nil {
		return nil, nil
	}

	sdl := lo.Map(*sl, func(s *storytelling.Story, _ int) any {
		sd, _ := NewStorytelling(s)
		return sd
	})

	ids := lo.Map(*sl, func(s *storytelling.Story, _ int) string {
		return s.Id().String()
	})

	return sdl, ids
}

func (d *StorytellingDocument) Model() (*storytelling.Story, error) {
	sid, err := id.StoryIDFrom(d.Id)
	if err != nil {
		return nil, err
	}
	property, err := id.PropertyIDFrom(d.Property)
	if err != nil {
		return nil, err
	}
	scene, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}

	s, err := storytelling.NewStory().
		ID(sid).
		Property(property).
		Scene(scene).
		Title(d.Title).
		Alias(d.Alias).
		Status(storytelling.PublishmentStatus(d.Status)).
		PublishedAt(d.PublishedAt).
		UpdatedAt(d.UpdatedAt).
		Build()
	if err != nil {
		return nil, err
	}

	return s, nil
}
