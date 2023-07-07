package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/usecasex"
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

func (i *Storytelling) Fetch(ctx context.Context, ids id.StoryIDList, op *usecase.Operator) (*storytelling.StoryList, error) {
	return i.storytellingRepo.FindByIDs(ctx, ids)
}

func (i *Storytelling) FetchByScene(ctx context.Context, sid id.SceneID, op *usecase.Operator) (*storytelling.StoryList, error) {
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

	builder := storytelling.NewStory().
		NewID().
		Title(inp.Title).
		Scene(inp.SceneID)

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

func (i *Storytelling) Remove(ctx context.Context, sId id.StoryID, operator *usecase.Operator) (*id.StoryID, error) {
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

	story, err := i.storytellingRepo.FindByID(ctx, sId)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(story.Scene(), operator); err != nil {
		return nil, err
	}

	// TODO: Handel ordering

	if err := i.storytellingRepo.Remove(ctx, sId); err != nil {
		return nil, err
	}

	return &sId, nil
}

func (i *Storytelling) Move(ctx context.Context, input interfaces.MoveStoryInput, operator *usecase.Operator) (*id.StoryID, int, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) CreatePage(ctx context.Context, param interfaces.CreatePageParam, operator *usecase.Operator) (*storytelling.Story, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) UpdatePage(ctx context.Context, param interfaces.UpdatePageParam, operator *usecase.Operator) (*storytelling.Story, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) RemovePage(ctx context.Context, storyID id.StoryID, pageID id.PageID, operator *usecase.Operator) (*storytelling.Story, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) MovePage(ctx context.Context, param interfaces.MovePageParam, operator *usecase.Operator) (*storytelling.Story, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) CreateBlock(ctx context.Context, param interfaces.CreateBlockParam, operator *usecase.Operator) (*id.BlockID, *storytelling.Page, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) RemoveBlock(ctx context.Context, param interfaces.RemoveBlockParam, operator *usecase.Operator) (*id.BlockID, *storytelling.Page, error) {
	// TODO implement me
	panic("implement me")
}

func (i *Storytelling) MoveBlock(ctx context.Context, param interfaces.MoveBlockParam, operator *usecase.Operator) (*id.BlockID, *storytelling.Page, int, error) {
	// TODO implement me
	panic("implement me")
}
