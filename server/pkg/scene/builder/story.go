package builder

import (
	"context"

	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/samber/lo"
)

type storyJSON struct {
	ID            string       `json:"id"`
	Property      propertyJSON `json:"property"`
	Pages         []pageJSON   `json:"pages"`
	PanelPosition string       `json:"position"`
	BgColor       string       `json:"bgColor"`
}

type pageJSON struct {
	ID              string       `json:"id"`
	Property        propertyJSON `json:"property"`
	Title           string       `json:"title"`
	Blocks          []blockJSON  `json:"blocks"`
	Swipeable       bool         `json:"swipeable"`
	SwipeableLayers []string     `json:"swipeableLayers"`
	Layers          []string     `json:"layers"`
}

type blockJSON struct {
	ID          string                  `json:"id"`
	Property    propertyJSON            `json:"property"`
	Plugins     map[string]propertyJSON `json:"plugins"`
	ExtensionId string                  `json:"extensionId"`
	PluginId    string                  `json:"pluginId"`
}

func (b *Builder) storyJSON(ctx context.Context, p []*property.Property) (*storyJSON, error) {
	if b.story == nil {
		return nil, nil
	}

	return &storyJSON{
		ID:       b.story.Id().String(),
		Property: b.property(ctx, findProperty(p, b.story.Property())),
		Pages: lo.FilterMap(b.story.Pages().Pages(), func(page *storytelling.Page, _ int) (pageJSON, bool) {
			if page == nil {
				return pageJSON{}, false
			}
			return b.pageJSON(ctx, *page, p), true
		}),
		PanelPosition: string(b.story.PanelPosition()),
		BgColor:       b.story.BgColor(),
	}, nil
}

func (b *Builder) pageJSON(ctx context.Context, page storytelling.Page, p []*property.Property) pageJSON {
	return pageJSON{
		ID:       page.Id().String(),
		Property: b.property(ctx, findProperty(p, page.Property())),
		Title:    page.Title(),
		Blocks: lo.FilterMap(page.Blocks(), func(block *storytelling.Block, _ int) (blockJSON, bool) {
			if block == nil {
				return blockJSON{}, false
			}
			return b.blockJSON(ctx, *block, p), true
		}),
		Swipeable:       page.Swipeable(),
		SwipeableLayers: page.SwipeableLayers().Strings(),
		Layers:          page.Layers().Strings(),
	}
}

func (b *Builder) blockJSON(ctx context.Context, block storytelling.Block, p []*property.Property) blockJSON {
	return blockJSON{
		ID:          block.ID().String(),
		Property:    b.property(ctx, findProperty(p, block.Property())),
		Plugins:     nil,
		ExtensionId: block.Extension().String(),
		PluginId:    block.Plugin().String(),
	}
}
