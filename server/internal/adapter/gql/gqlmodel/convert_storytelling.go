package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/samber/lo"
)

func ToStory(s *storytelling.Story) *Story {
	if s == nil {
		return nil
	}

	return &Story{
		ID:            IDFrom(s.Id()),
		ProjectID:     IDFrom(s.Project()),
		SceneID:       IDFrom(s.Scene()),
		Title:         s.Title(),
		BgColor:       ToStoryBgColor(s.BgColor()),
		PanelPosition: ToStoryPosition(s.PanelPosition()),
		CreatedAt:     s.Id().Timestamp(),
		UpdatedAt:     s.UpdatedAt(),

		PropertyID: IDFrom(s.Property()),
		Property:   nil,
		Pages:      ToPages(s.Pages()),

		// publishment
		Alias:             s.Alias(),
		PublishmentStatus: ToStoryPublishmentStatus(s.PublishmentStatus()),
		PublishedAt:       s.PublishedAt(),
		PublicTitle:       s.PublicTitle(),
		PublicDescription: s.PublicDescription(),
		PublicImage:       s.PublicImage(),
		PublicNoIndex:     s.PublicNoIndex(),
		IsBasicAuthActive: s.IsBasicAuthActive(),
		BasicAuthUsername: s.BasicAuthUsername(),
		BasicAuthPassword: s.BasicAuthPassword(),
		EnableGa:          s.EnableGa(),
		TrackingID:        s.TrackingID(),
	}
}

func ToStories(sl storytelling.StoryList) []*Story {
	return lo.Map(sl, func(s *storytelling.Story, _ int) *Story {
		return ToStory(s)
	})
}

func ToPage(p *storytelling.Page) *StoryPage {
	if p == nil {
		return nil
	}
	return &StoryPage{
		ID:                 IDFrom(p.Id()),
		Title:              p.Title(),
		Blocks:             ToBlocks(p.Blocks()),
		Swipeable:          p.Swipeable(),
		LayersIds:          IDFromList(p.Layers()),
		SwipeableLayersIds: IDFromList(p.SwipeableLayers()),
		PropertyID:         IDFrom(p.Property()),
		Property:           nil,
		CreatedAt:          p.Id().Timestamp(),
	}
}

func ToPages(pl *storytelling.PageList) []*StoryPage {
	if pl == nil || len(pl.Pages()) == 0 {
		return []*StoryPage{}
	}
	return lo.Map(pl.Pages(), func(s *storytelling.Page, _ int) *StoryPage {
		return ToPage(s)
	})
}

func ToBlock(b *storytelling.Block) *StoryBlock {
	if b == nil {
		return nil
	}
	return &StoryBlock{
		ID:          IDFrom(b.ID()),
		PropertyID:  IDFrom(b.Property()),
		Property:    nil,
		PluginID:    IDFromPluginID(b.Plugin()),
		Plugin:      nil,
		ExtensionID: IDFromString(b.Extension()),
		Extension:   nil,
	}
}

func ToBlocks(bl storytelling.BlockList) []*StoryBlock {
	if len(bl) == 0 {
		return []*StoryBlock{}
	}
	return lo.Map(bl, func(s *storytelling.Block, _ int) *StoryBlock {
		return ToBlock(s)
	})
}

func ToStoryPublishmentStatus(v storytelling.PublishmentStatus) PublishmentStatus {
	switch v {
	case storytelling.PublishmentStatusPublic:
		return PublishmentStatusPublic
	case storytelling.PublishmentStatusLimited:
		return PublishmentStatusLimited
	case storytelling.PublishmentStatusPrivate:
		return PublishmentStatusPrivate
	}
	return ""
}

func ToStoryPosition(v storytelling.Position) Position {
	switch v {
	case storytelling.PositionLeft:
		return PositionLeft
	case storytelling.PositionRight:
		return PositionRight
	}
	return ""
}

func ToStoryBgColor(bg string) *string {
	return &bg
}

func FromStoryPositionRef(v *Position) *storytelling.Position {
	if v == nil {
		return nil
	}
	switch *v {
	case PositionLeft:
		return lo.ToPtr(storytelling.PositionLeft)
	case PositionRight:
		return lo.ToPtr(storytelling.PositionRight)
	}
	return nil
}

func FromStoryPublishmentStatus(v PublishmentStatus) storytelling.PublishmentStatus {
	switch v {
	case PublishmentStatusPublic:
		return storytelling.PublishmentStatusPublic
	case PublishmentStatusLimited:
		return storytelling.PublishmentStatusLimited
	case PublishmentStatusPrivate:
		return storytelling.PublishmentStatusPrivate
	}
	return ""
}
