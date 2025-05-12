package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
)

type StoryLoader struct {
	usecase interfaces.Storytelling
}

func NewStoryLoader(usecase interfaces.Storytelling) *StoryLoader {
	return &StoryLoader{usecase: usecase}
}

func (c *StoryLoader) CheckAlias(ctx context.Context, alias string, storyID *gqlmodel.ID) (*gqlmodel.StoryAliasAvailability, error) {
	sid := gqlmodel.ToIDRef[id.Story](storyID)
	ok, err := c.usecase.CheckAlias(ctx, alias, sid)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.StoryAliasAvailability{Alias: alias, Available: ok}, nil
}

// data loaders

type StoryDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Story, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Story, []error)
}
