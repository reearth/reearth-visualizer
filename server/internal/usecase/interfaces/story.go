package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

type CreateStoryInput struct {
	SceneID id.SceneID
	Title   string
	Index   *int
}

type UpdateStoryInput struct {
	SceneID       id.SceneID
	StoryID       id.StoryID
	Title         *string
	Index         *int
	PanelPosition *storytelling.Position
	BgColor       *string

	IsBasicAuthActive *bool
	BasicAuthUsername *string
	BasicAuthPassword *string
	Alias             *string
	PublicTitle       *string
	PublicDescription *string
	PublicImage       *string
	PublicNoIndex     *bool
	DeletePublicImage *bool
}

type MoveStoryInput struct {
	SceneID id.SceneID
	StoryID id.StoryID
	Index   int
}

type RemoveStoryInput struct {
	SceneID id.SceneID
	StoryID id.StoryID
}

type PublishStoryInput struct {
	ID     id.StoryID
	Alias  *string
	Status storytelling.PublishmentStatus
}

type CreatePageParam struct {
	SceneID         id.SceneID
	StoryID         id.StoryID
	Title           *string
	Swipeable       *bool
	Layers          *[]id.NLSLayerID
	SwipeableLayers *[]id.NLSLayerID
	Index           *int
}

type UpdatePageParam struct {
	SceneID         id.SceneID
	StoryID         id.StoryID
	PageID          id.PageID
	Title           *string
	Swipeable       *bool
	Layers          *[]id.NLSLayerID
	SwipeableLayers *[]id.NLSLayerID
	Index           *int
}

type MovePageParam struct {
	StoryID id.StoryID
	PageID  id.PageID
	Index   int
}

type RemovePageParam struct {
	SceneID id.SceneID
	StoryID id.StoryID
	PageID  id.PageID
}

type DuplicatePageParam struct {
	SceneID id.SceneID
	StoryID id.StoryID
	PageID  id.PageID
}

type PageLayerParam struct {
	SceneID   id.SceneID
	StoryID   id.StoryID
	PageID    id.PageID
	Swipeable bool
	LayerID   id.NLSLayerID
}

type CreateBlockParam struct {
	StoryID     id.StoryID
	PageID      id.PageID
	PluginID    id.PluginID
	ExtensionID id.PluginExtensionID
	Index       *int
}

type MoveBlockParam struct {
	StoryID id.StoryID
	PageID  id.PageID
	BlockID id.BlockID
	Index   int
}

type RemoveBlockParam struct {
	StoryID id.StoryID
	PageID  id.PageID
	BlockID id.BlockID
}

var (
	ErrPageNotFound                  error = rerror.NewE(i18n.T("page not found"))
	ErrBlockNotFound                 error = rerror.NewE(i18n.T("block not found"))
	ErrPageSwipeableMismatch         error = rerror.NewE(i18n.T("page swipeable mismatch"))
	ErrExtensionTypeMustBeStoryBlock error = errors.New("extension type must be storyBlock")
)

type Storytelling interface {
	Fetch(context.Context, id.StoryIDList, *usecase.Operator) (*storytelling.StoryList, error)
	FetchByScene(context.Context, id.SceneID, *usecase.Operator) (*storytelling.StoryList, error)
	Create(context.Context, CreateStoryInput, *usecase.Operator) (*storytelling.Story, error)
	Update(context.Context, UpdateStoryInput, *usecase.Operator) (*storytelling.Story, error)
	Remove(context.Context, RemoveStoryInput, *usecase.Operator) (*id.StoryID, error)
	Move(context.Context, MoveStoryInput, *usecase.Operator) (*id.StoryID, int, error)
	Publish(context.Context, PublishStoryInput, *usecase.Operator) (*storytelling.Story, error)

	CreatePage(context.Context, CreatePageParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, error)
	UpdatePage(context.Context, UpdatePageParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, error)
	RemovePage(context.Context, RemovePageParam, *usecase.Operator) (*storytelling.Story, *id.PageID, error)
	MovePage(context.Context, MovePageParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, int, error)
	DuplicatePage(context.Context, DuplicatePageParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, error)

	AddPageLayer(context.Context, PageLayerParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, error)
	RemovePageLayer(context.Context, PageLayerParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, error)

	CreateBlock(context.Context, CreateBlockParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, *storytelling.Block, int, error)
	RemoveBlock(context.Context, RemoveBlockParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, *id.BlockID, error)
	MoveBlock(context.Context, MoveBlockParam, *usecase.Operator) (*storytelling.Story, *storytelling.Page, *id.BlockID, int, error)
}
