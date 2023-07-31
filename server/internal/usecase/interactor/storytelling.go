package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Storytelling struct {
	common
	storytellingRepo repo.Storytelling
	transaction      usecasex.Transaction
}

func NewStorytelling(r *repo.Container) interfaces.Storytelling {
	return &Storytelling{
		storytellingRepo: r.Storytelling,
		transaction:      r.Transaction,
	}
}

func (i *Storytelling) Fetch(ctx context.Context, ids id.StoryIDList, _ *usecase.Operator) (*storytelling.StoryList, error) {
	return i.storytellingRepo.FindByIDs(ctx, ids)
}

func (i *Storytelling) FetchByScene(ctx context.Context, sid id.SceneID, _ *usecase.Operator) (*storytelling.StoryList, error) {
	return i.storytellingRepo.FindByScene(ctx, sid)
}

func (i *Storytelling) Create(ctx context.Context, inp interfaces.CreateStoryInput, operator *usecase.Operator) (*storytelling.Story, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(inp.SceneID, operator); err != nil {
		return nil, interfaces.ErrOperationDenied
	}

	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDStory)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(inp.SceneID).Build()
	if err != nil {
		return nil, err
	}

	builder := storytelling.NewStory().
		NewID().
		Title(inp.Title).
		Scene(inp.SceneID).
		Property(prop.ID()).
		Pages(storytelling.NewPageList(nil))

	story, err := builder.Build()
	if err != nil {
		return nil, err
	}

	// TODO: Handel ordering

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, err
	}

	tx.Commit()
	return story, nil
}

func (i *Storytelling) Update(ctx context.Context, inp interfaces.UpdateStoryInput, operator *usecase.Operator) (*storytelling.Story, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(story.Scene(), operator); err != nil {
		return nil, err
	}

	if inp.Title != nil && *inp.Title != "" {
		story.Rename(*inp.Title)
	}

	// TODO: Handel ordering

	err = i.storytellingRepo.Save(ctx, *story)
	if err != nil {
		return nil, err
	}
	tx.Commit()
	return story, nil
}

func (i *Storytelling) Remove(ctx context.Context, inp interfaces.RemoveStoryInput, operator *usecase.Operator) (*id.StoryID, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(story.Scene(), operator); err != nil {
		return nil, err
	}

	// TODO: Handel ordering

	if err := i.storytellingRepo.Remove(ctx, inp.StoryID); err != nil {
		return nil, err
	}

	return &inp.StoryID, nil
}

func (i *Storytelling) Move(ctx context.Context, inp interfaces.MoveStoryInput, operator *usecase.Operator) (*id.StoryID, int, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) CreatePage(ctx context.Context, inp interfaces.CreatePageParam, operator *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(inp.SceneID, operator); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDStoryPage)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(inp.SceneID).Build()
	if err != nil {
		return nil, nil, err
	}

	builder := storytelling.NewPage().
		NewID().
		Property(prop.ID())

	if inp.Title != nil && *inp.Title != "" {
		builder = builder.Title(*inp.Title)
	} else {
		builder = builder.Title("Untitled")
	}

	if inp.Layers != nil {
		builder = builder.Layers(*inp.Layers)
	}

	builder = builder.Swipeable(inp.Swipeable != nil && *inp.Swipeable)

	if inp.Swipeable != nil && *inp.Swipeable && inp.SwipeableLayers != nil {
		builder = builder.SwipeableLayers(*inp.SwipeableLayers)
	}

	page, err := builder.Build()
	if err != nil {
		return nil, nil, err
	}

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, err
	}

	story.Pages().AddAt(page, inp.Index)

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) UpdatePage(ctx context.Context, inp interfaces.UpdatePageParam, operator *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(inp.SceneID, operator); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, err
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, interfaces.ErrPageNotFound
	}

	if inp.Title != nil && *inp.Title != "" {
		page.SetTitle(*inp.Title)
	}

	if inp.Layers != nil {
		page.SetLayers(*inp.Layers)
	}

	page.SetSwipeable(inp.Swipeable != nil && *inp.Swipeable)

	if inp.Swipeable != nil && *inp.Swipeable && inp.SwipeableLayers != nil {
		page.SetSwipeableLayers(*inp.SwipeableLayers)
	}

	if inp.Index != nil {
		story.Pages().Move(page.Id(), *inp.Index)
	}

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) RemovePage(ctx context.Context, inp interfaces.RemovePageParam, operator *usecase.Operator) (*storytelling.Story, *id.PageID, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(inp.SceneID, operator); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, err
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, interfaces.ErrPageNotFound
	}

	story.Pages().Remove(page.Id())

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page.Id().Ref(), nil
}

func (i *Storytelling) MovePage(ctx context.Context, inp interfaces.MovePageParam, operator *usecase.Operator) (*storytelling.Story, *storytelling.Page, int, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, 0, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, 0, err
	}

	if err := i.CanWriteScene(story.Scene(), operator); err != nil {
		return nil, nil, 0, interfaces.ErrOperationDenied
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, 0, interfaces.ErrPageNotFound
	}

	story.Pages().Move(page.Id(), inp.Index)

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, 0, err
	}

	tx.Commit()
	return story, page, inp.Index, nil
}

func (i *Storytelling) DuplicatePage(ctx context.Context, inp interfaces.DuplicatePageParam, operator *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, err
	}

	if err := i.CanWriteScene(story.Scene(), operator); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, interfaces.ErrPageNotFound
	}

	dupPage := page.Duplicate()
	story.Pages().AddAt(dupPage, lo.ToPtr(story.Pages().IndexOf(page.Id())+1))

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, dupPage, nil
}

func (i *Storytelling) AddPageLayer(ctx context.Context, inp interfaces.PageLayerParam, operator *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, err
	}

	if err := i.CanWriteScene(story.Scene(), operator); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, interfaces.ErrPageNotFound
	}

	if !page.Swipeable() && inp.Swipeable {
		return nil, nil, interfaces.ErrPageSwipeableMismatch
	}

	if inp.Swipeable {
		page.AddSwipeableLayer(inp.LayerID)
	} else {
		page.AddLayer(inp.LayerID)
	}

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) RemovePageLayer(ctx context.Context, inp interfaces.PageLayerParam, operator *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, err
	}

	if err := i.CanWriteScene(story.Scene(), operator); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, interfaces.ErrPageNotFound
	}

	if !page.Swipeable() && inp.Swipeable {
		return nil, nil, interfaces.ErrPageSwipeableMismatch
	}

	if inp.Swipeable {
		page.RemoveSwipeableLayer(inp.LayerID)
	} else {
		page.RemoveLayer(inp.LayerID)
	}

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) CreateBlock(ctx context.Context, param interfaces.CreateBlockParam, operator *usecase.Operator) (*storytelling.Page, *storytelling.Block, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) RemoveBlock(ctx context.Context, param interfaces.RemoveBlockParam, operator *usecase.Operator) (*storytelling.Page, *id.BlockID, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) MoveBlock(ctx context.Context, param interfaces.MoveBlockParam, operator *usecase.Operator) (*storytelling.Page, *id.BlockID, int, error) {
	// TODO implement me
	panic("implement me")
}
