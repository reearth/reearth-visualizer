package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/tag"
)

type Tag struct {
	common
	tagRepo     repo.Tag
	layerRepo   repo.Layer
	sceneRepo   repo.Scene
	transaction repo.Transaction
}

func NewTag(r *repo.Container) interfaces.Tag {
	return &Tag{
		tagRepo:     r.Tag,
		layerRepo:   r.Layer,
		sceneRepo:   r.Scene,
		transaction: r.Transaction,
	}
}

func (i *Tag) CreateItem(ctx context.Context, inp interfaces.CreateTagItemParam, operator *usecase.Operator) (*tag.Item, *tag.Group, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(inp.SceneID, operator); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	var parent *tag.Group
	if inp.Parent != nil {
		parent, err = i.tagRepo.FindGroupByID(ctx, *inp.Parent)
		if err != nil {
			return nil, nil, err
		}
	}

	builder := tag.NewItem().
		NewID().
		Label(inp.Label).
		Scene(inp.SceneID).
		Parent(inp.Parent)
	if inp.LinkedDatasetSchemaID != nil && inp.LinkedDatasetID != nil && inp.LinkedDatasetField != nil {
		builder = builder.
			LinkedDatasetFieldID(inp.LinkedDatasetField).
			LinkedDatasetID(inp.LinkedDatasetID).
			LinkedDatasetSchemaID(inp.LinkedDatasetSchemaID)
	}
	item, err := builder.Build()
	if err != nil {
		return nil, nil, err
	}

	if parent != nil {
		parent.Tags().Add(item.ID())
	}

	itemt := tag.Tag(item)
	tags := []*tag.Tag{&itemt}
	if parent != nil {
		parentt := tag.Tag(parent)
		tags = append(tags, &parentt)
	}
	if err := i.tagRepo.SaveAll(ctx, tags); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return item, parent, nil
}

func (i *Tag) CreateGroup(ctx context.Context, inp interfaces.CreateTagGroupParam, operator *usecase.Operator) (*tag.Group, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(inp.SceneID, operator); err != nil {
		return nil, interfaces.ErrOperationDenied
	}

	list := tag.IDListFrom(inp.Tags)
	group, err := tag.NewGroup().
		NewID().
		Label(inp.Label).
		Scene(inp.SceneID).
		Tags(list).
		Build()

	if err != nil {
		return nil, err
	}

	err = i.tagRepo.Save(ctx, group)
	if err != nil {
		return nil, err
	}
	tx.Commit()
	return group, nil
}

func (i *Tag) Fetch(ctx context.Context, ids []id.TagID, operator *usecase.Operator) ([]*tag.Tag, error) {
	return i.tagRepo.FindByIDs(ctx, ids)
}

func (i *Tag) FetchByScene(ctx context.Context, sid id.SceneID, operator *usecase.Operator) ([]*tag.Tag, error) {
	return i.tagRepo.FindRootsByScene(ctx, sid)
}

func (i *Tag) FetchItem(ctx context.Context, ids []id.TagID, operator *usecase.Operator) ([]*tag.Item, error) {
	return i.tagRepo.FindItemByIDs(ctx, ids)
}

func (i *Tag) FetchGroup(ctx context.Context, ids []id.TagID, operator *usecase.Operator) ([]*tag.Group, error) {
	return i.tagRepo.FindGroupByIDs(ctx, ids)
}

func (i *Tag) AttachItemToGroup(ctx context.Context, inp interfaces.AttachItemToGroupParam, operator *usecase.Operator) (*tag.Group, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	// make sure item exist
	ti, err := i.tagRepo.FindItemByID(ctx, inp.ItemID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(ti.Scene(), operator); err != nil {
		return nil, err
	}
	if ti.Parent() != nil {
		return nil, errors.New("tag is already added to the group")
	}

	tg, err := i.tagRepo.FindGroupByID(ctx, inp.GroupID)
	if err != nil {
		return nil, err
	}

	if tg.Tags().Has(inp.ItemID) {
		return nil, errors.New("tag item is already attached to the group")
	}

	tg.Tags().Add(inp.ItemID)
	ti.SetParent(tg.ID().Ref())

	tgt := tag.Tag(tg)
	tit := tag.Tag(ti)
	if err := i.tagRepo.SaveAll(ctx, []*tag.Tag{&tgt, &tit}); err != nil {
		return nil, err
	}

	tx.Commit()
	return tg, nil
}

func (i *Tag) DetachItemFromGroup(ctx context.Context, inp interfaces.DetachItemToGroupParam, operator *usecase.Operator) (*tag.Group, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	// make sure item exist
	ti, err := i.tagRepo.FindItemByID(ctx, inp.ItemID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(ti.Scene(), operator); err != nil {
		return nil, err
	}

	tg, err := i.tagRepo.FindGroupByID(ctx, inp.GroupID)
	if err != nil {
		return nil, err
	}

	if !tg.Tags().Has(inp.ItemID) {
		return nil, errors.New("tag item is not attached to the group")
	}

	tg.Tags().Remove(inp.ItemID)
	ti.SetParent(nil)

	tgt := tag.Tag(tg)
	tit := tag.Tag(ti)
	if err := i.tagRepo.SaveAll(ctx, []*tag.Tag{&tgt, &tit}); err != nil {
		return nil, err
	}

	tx.Commit()
	return tg, nil
}

func (i *Tag) UpdateTag(ctx context.Context, inp interfaces.UpdateTagParam, operator *usecase.Operator) (*tag.Tag, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	tg, err := i.tagRepo.FindByID(ctx, inp.TagID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(tg.Scene(), operator); err != nil {
		return nil, err
	}

	if inp.Label != nil {
		tg.Rename(*inp.Label)
	}

	err = i.tagRepo.Save(ctx, tg)
	if err != nil {
		return nil, err
	}
	tx.Commit()
	return &tg, nil
}

func (i *Tag) Remove(ctx context.Context, tagID id.TagID, operator *usecase.Operator) (*id.TagID, layer.List, error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return nil, nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	t, err := i.tagRepo.FindByID(ctx, tagID)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteScene(t.Scene(), operator); err != nil {
		return nil, nil, err
	}

	if group := tag.ToTagGroup(t); group != nil {
		if len(group.Tags().Tags()) != 0 {
			return nil, nil, interfaces.ErrNonemptyTagGroupCannotDelete
		}
	}

	if item := tag.ToTagItem(t); item != nil {
		g, err := i.tagRepo.FindGroupByItem(ctx, item.ID())
		if err != nil && !errors.Is(rerror.ErrNotFound, err) {
			return nil, nil, err
		}
		if g != nil {
			g.Tags().Remove(item.ID())
			if err := i.tagRepo.Save(ctx, g); err != nil {
				return nil, nil, err
			}
		}
	}

	ls, err := i.layerRepo.FindByTag(ctx, tagID)
	if err != nil && !errors.Is(rerror.ErrNotFound, err) {
		return nil, nil, err
	}

	if len(ls) != 0 {
		for _, l := range ls.Deref() {
			_ = l.Tags().Delete(tagID)
		}
		if err := i.layerRepo.SaveAll(ctx, ls); err != nil {
			return nil, nil, err
		}
	}

	if err := i.tagRepo.Remove(ctx, tagID); err != nil {
		return nil, nil, err
	}

	return &tagID, ls, nil
}
