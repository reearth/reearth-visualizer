package mongodoc

import (
	"time"

	"github.com/pkg/errors"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type StorytellingDocument struct {
	Id            string
	Property      string
	Scene         string
	Title         string
	Alias         string
	Pages         []PageDocument
	Status        string
	PublishedAt   *time.Time
	UpdatedAt     time.Time
	Index         int
	PanelPosition string
	BgColor       string

	IsBasicAuthActive bool
	BasicAuthUsername string
	BasicAuthPassword string
	PublicTitle       string
	PublicDescription string
	PublicImage       string
	PublicNoIndex     bool
}

type PageDocument struct {
	Id          string
	Property    string
	Title       string
	Swipeable   bool
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
		Id:            s.Id().String(),
		Property:      s.Property().String(),
		Scene:         s.Scene().String(),
		Title:         s.Title(),
		Alias:         s.Alias(),
		Pages:         newPages(s.Pages()),
		Status:        string(s.Status()),
		PublishedAt:   s.PublishedAt(),
		UpdatedAt:     s.UpdatedAt(),
		Index:         1,
		PanelPosition: string(s.PanelPosition()),
		BgColor:       s.BgColor(),

		IsBasicAuthActive: s.IsBasicAuthActive(),
		BasicAuthUsername: s.BasicAuthUsername(),
		BasicAuthPassword: s.BasicAuthPassword(),
		PublicTitle:       s.PublicTitle(),
		PublicDescription: s.PublicDescription(),
		PublicImage:       s.PublicImage(),
		PublicNoIndex:     s.PublicNoIndex(),
	}, sId
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

func newPage(p storytelling.Page) PageDocument {
	return PageDocument{
		Id:          p.Id().String(),
		Property:    p.Property().String(),
		Title:       p.Title(),
		Swipeable:   p.Swipeable(),
		Layers:      p.Layers().Strings(),
		SwipeLayers: p.SwipeableLayers().Strings(),
		Blocks:      newBlocks(p.Blocks()),
	}
}

func newPages(pl *storytelling.PageList) []PageDocument {
	if pl == nil {
		return nil
	}
	return lo.Map(pl.Pages(), func(p *storytelling.Page, _ int) PageDocument {
		if p == nil {
			return PageDocument{}
		}
		return newPage(*p)
	})
}

func newBlocks(blocks storytelling.BlockList) []BlockDocument {
	if blocks == nil {
		return nil
	}
	return lo.Map(blocks, func(b *storytelling.Block, _ int) BlockDocument {
		if b == nil {
			return BlockDocument{}
		}
		return newBlock(*b)
	})
}

func newBlock(b storytelling.Block) BlockDocument {
	return BlockDocument{
		Id:        b.ID().String(),
		Plugin:    b.Plugin().String(),
		Extension: b.Extension().String(),
		Property:  b.Property().String(),
	}
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

	pages := lo.Map(d.Pages, func(p PageDocument, _ int) *storytelling.Page {
		page, err2 := p.Model()
		if err2 != nil {
			err = err2
			return nil
		}
		return page
	})
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
		PanelPosition(storytelling.Position(d.PanelPosition)).
		BgColor(d.BgColor).
		PublishedAt(d.PublishedAt).
		UpdatedAt(d.UpdatedAt).
		Pages(storytelling.NewPageList(pages)).
		PublicBasicAuth(d.IsBasicAuthActive, d.BasicAuthUsername, d.BasicAuthPassword).
		PublicTitle(d.PublicTitle).
		PublicDescription(d.PublicDescription).
		PublicImage(d.PublicImage).
		PublicNoIndex(d.PublicNoIndex).
		Build()
	if err != nil {
		return nil, err
	}

	return s, nil
}

func (d *PageDocument) Model() (*storytelling.Page, error) {
	pId, err := id.PageIDFrom(d.Id)
	if err != nil {
		return nil, err
	}
	property, err := id.PropertyIDFrom(d.Property)
	if err != nil {
		return nil, err
	}
	lIds, err := id.NLSLayerIDListFrom(d.Layers)
	if err != nil {
		return nil, err
	}
	slIds, err := id.NLSLayerIDListFrom(d.SwipeLayers)
	if err != nil {
		return nil, err
	}

	blocks := lo.Map(d.Blocks, func(b BlockDocument, _ int) *storytelling.Block {
		page, err2 := b.Model()
		if err2 != nil {
			err = err2
			return nil
		}
		return page
	})
	if err != nil {
		return nil, err
	}

	p, err := storytelling.NewPage().
		ID(pId).
		Property(property).
		Title(d.Title).
		Layers(lIds).
		Swipeable(d.Swipeable).
		SwipeableLayers(slIds).
		Blocks(blocks).
		Build()
	if err != nil {
		return nil, err
	}

	return p, nil
}

func (d BlockDocument) Model() (*storytelling.Block, error) {
	bId, err := id.BlockIDFrom(d.Id)
	if err != nil {
		return nil, err
	}
	property, err := id.PropertyIDFrom(d.Property)
	if err != nil {
		return nil, err
	}
	plugin, err := id.PluginIDFrom(d.Plugin)
	if err != nil {
		return nil, err
	}
	extension := id.PluginExtensionIDFromRef(&d.Extension)
	if extension == nil {
		return nil, errors.New("invalid extension")
	}

	b, err := storytelling.NewBlock().
		ID(bId).
		Property(property).
		Plugin(plugin).
		Extension(*extension).
		Build()
	if err != nil {
		return nil, err
	}

	return b, nil
}
