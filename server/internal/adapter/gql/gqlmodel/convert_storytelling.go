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

func ToPage(s *storytelling.Page) *StoryPage {
	return &StoryPage{
		ID:              IDFrom(s.Id()),
		Title:           s.Title(),
		Blocks:          ToBlocks(s.Blocks()),
		Swipeable:       s.Swipeable(),
		Layers:          nil,
		SwipeableLayers: nil,
		Property:        nil,
		CreatedAt:       s.Id().Timestamp(),
	}
}

func ToPages(ss *storytelling.PageList) []*StoryPage {
	if ss == nil {
		return nil
	}
	return lo.Map(ss.Pages(), func(s *storytelling.Page, _ int) *StoryPage {
		return ToPage(s)
	})
}

func ToBlock(s *storytelling.Block) *StoryBlock {
	return &StoryBlock{
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

func ToBlocks(ss storytelling.BlockList) []*StoryBlock {
	return lo.Map(ss, func(s *storytelling.Block, _ int) *StoryBlock {
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
