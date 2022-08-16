package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/tag"
)

var (
	ErrNonemptyTagGroupCannotDelete = errors.New("can't delete non-empty tag group")
)

type CreateTagItemParam struct {
	Label                 string
	SceneID               id.SceneID
	Parent                *id.TagID
	LinkedDatasetSchemaID *id.DatasetSchemaID
	LinkedDatasetID       *id.DatasetID
	LinkedDatasetField    *id.DatasetFieldID
}

type CreateTagGroupParam struct {
	Label   string
	SceneID id.SceneID
	Tags    []id.TagID
}

type AttachItemToGroupParam struct {
	ItemID, GroupID id.TagID
}

type DetachItemToGroupParam struct {
	ItemID, GroupID id.TagID
}

type UpdateTagParam struct {
	Label *string
	TagID id.TagID
}

type Tag interface {
	Fetch(context.Context, []id.TagID, *usecase.Operator) ([]*tag.Tag, error)
	FetchByScene(context.Context, id.SceneID, *usecase.Operator) ([]*tag.Tag, error)
	FetchItem(context.Context, []id.TagID, *usecase.Operator) ([]*tag.Item, error)
	FetchGroup(context.Context, []id.TagID, *usecase.Operator) ([]*tag.Group, error)
	CreateItem(context.Context, CreateTagItemParam, *usecase.Operator) (*tag.Item, *tag.Group, error)
	CreateGroup(context.Context, CreateTagGroupParam, *usecase.Operator) (*tag.Group, error)
	AttachItemToGroup(context.Context, AttachItemToGroupParam, *usecase.Operator) (*tag.Group, error)
	DetachItemFromGroup(context.Context, DetachItemToGroupParam, *usecase.Operator) (*tag.Group, error)
	UpdateTag(context.Context, UpdateTagParam, *usecase.Operator) (*tag.Tag, error)
	Remove(context.Context, id.TagID, *usecase.Operator) (*id.TagID, layer.List, error)
}
