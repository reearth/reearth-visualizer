package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/samber/lo"
)

func ToStory(s *storytelling.Story) *Story {
	return &Story{
		ID:                IDFrom(s.Id()),
		Title:             s.Title(),
		Alias:             s.Alias(),
		Property:          nil,
		Pages:             ToPages(s.Pages()),
		PublishmentStatus: ToStoryPublishmentStatus(s.Published()),
		CreatedAt:         s.Id().Timestamp(),
		UpdatedAt:         s.UpdatedAt(),
		PublishedAt:       s.PublishedAt(),
	}
}

func ToStories(ss storytelling.StoryList) []*Story {
	return lo.Map(ss, func(s *storytelling.Story, _ int) *Story {
		return ToStory(s)
	})
}

func ToPage(s *storytelling.Page) *Page {
	return &Page{
		ID:          IDFrom(s.Id()),
		Title:       s.Title(),
		Blocks:      ToBlocks(s.Blocks()),
		Swipe:       s.Swipe(),
		Layers:      nil,
		SwipeLayers: nil,
		Property:    nil,
		CreatedAt:   s.Id().Timestamp(),
	}
}

func ToPages(ss storytelling.PageList) []*Page {
	return lo.Map(ss, func(s *storytelling.Page, _ int) *Page {
		return ToPage(s)
	})
}

func ToBlock(s *storytelling.Block) *Block {
	return &Block{
		ID:              IDFrom(s.ID()),
		PropertyID:      "",
		PluginID:        "",
		ExtensionID:     "",
		LinkedDatasetID: nil,
		Page:            nil,
		Property:        nil,
		Plugin:          nil,
		Extension:       nil,
	}
}

func ToBlocks(ss storytelling.BlockList) []*Block {
	return lo.Map(ss, func(s *storytelling.Block, _ int) *Block {
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
