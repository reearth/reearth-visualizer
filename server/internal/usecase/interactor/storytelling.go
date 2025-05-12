package interactor

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Storytelling struct {
	common
	commonSceneLock
	storytellingRepo repo.Storytelling
	pluginRepo       repo.Plugin
	propertyRepo     repo.Property
	workspaceRepo    accountrepo.Workspace
	policyRepo       repo.Policy
	projectRepo      repo.Project
	sceneRepo        repo.Scene
	file             gateway.File
	transaction      usecasex.Transaction
	nlsLayerRepo     repo.NLSLayer
	layerStyles      repo.Style

	propertySchemaRepo repo.PropertySchema
}

func NewStorytelling(r *repo.Container, gr *gateway.Container) interfaces.Storytelling {
	return &Storytelling{
		commonSceneLock:  commonSceneLock{sceneLockRepo: r.SceneLock},
		storytellingRepo: r.Storytelling,
		pluginRepo:       r.Plugin,
		propertyRepo:     r.Property,
		workspaceRepo:    r.Workspace,
		policyRepo:       r.Policy,
		projectRepo:      r.Project,
		sceneRepo:        r.Scene,
		file:             gr.File,
		transaction:      r.Transaction,
		nlsLayerRepo:     r.NLSLayer,
		layerStyles:      r.Style,

		propertySchemaRepo: r.PropertySchema,
	}
}

func (i *Storytelling) Fetch(ctx context.Context, ids id.StoryIDList, _ *usecase.Operator) (*storytelling.StoryList, error) {
	return i.storytellingRepo.FindByIDs(ctx, ids)
}

func (i *Storytelling) FetchByScene(ctx context.Context, sid id.SceneID, _ *usecase.Operator) (*storytelling.StoryList, error) {
	return i.storytellingRepo.FindByScene(ctx, sid)
}

func (i *Storytelling) Create(ctx context.Context, inp interfaces.CreateStoryInput, op *usecase.Operator) (*storytelling.Story, error) {
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

	if err := i.CanWriteScene(inp.SceneID, op); err != nil {
		return nil, interfaces.ErrOperationDenied
	}

	storySchema := builtin.GetPropertySchema(builtin.PropertySchemaIDStory)
	prop, err := i.addNewProperty(ctx, storySchema.ID(), inp.SceneID, nil)
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

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return story, nil
}

func (i *Storytelling) Update(ctx context.Context, inp interfaces.UpdateStoryInput, op *usecase.Operator) (*storytelling.Story, error) {
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
	if err := i.CanWriteScene(story.Scene(), op); err != nil {
		return nil, err
	}

	if inp.Title != nil && *inp.Title != "" {
		story.Rename(*inp.Title)
	}

	if inp.PublicTitle != nil {
		story.SetPublicTitle(*inp.PublicTitle)
	}

	if inp.PublicDescription != nil {
		story.SetPublicDescription(*inp.PublicDescription)
	}

	if inp.PublicImage != nil {
		story.SetPublicImage(*inp.PublicImage)
	}

	if inp.IsBasicAuthActive != nil {
		if err := story.SetBasicAuth(*inp.IsBasicAuthActive, inp.BasicAuthUsername, inp.BasicAuthPassword); err != nil {
			return nil, err
		}
	}

	if inp.PublicNoIndex != nil {
		story.SetPublicNoIndex(*inp.PublicNoIndex)
	}

	if inp.PanelPosition != nil {
		story.SetPanelPosition(*inp.PanelPosition)
	}

	if inp.BgColor != nil {
		story.SetBgColor(*inp.BgColor)
	}

	if inp.EnableGa != nil {
		story.SetEnableGa(*inp.EnableGa)
	}

	if inp.TrackingID != nil {
		story.SetTrackingID(*inp.TrackingID)
	}

	// TODO: Handel ordering

	err = i.storytellingRepo.Save(ctx, *story)
	if err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return story, nil
}

func (i *Storytelling) Remove(ctx context.Context, inp interfaces.RemoveStoryInput, op *usecase.Operator) (*id.StoryID, error) {
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
	if err := i.CanWriteScene(story.Scene(), op); err != nil {
		return nil, err
	}

	// TODO: Handel ordering

	if err := i.storytellingRepo.Remove(ctx, inp.StoryID); err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	return &inp.StoryID, nil
}

func (i *Storytelling) CheckAlias(ctx context.Context, newAlias string, sid *id.StoryID) (bool, error) {
	aliasName := strings.ToLower(newAlias)

	if sid == nil {

		if err := alias.CheckAliasPatternStorytelling(aliasName); err != nil {
			return false, err
		}
		if err := i.sceneRepo.CheckAliasUnique(ctx, aliasName); err != nil {
			return false, err
		}
		if err := i.storytellingRepo.CheckAliasUnique(ctx, aliasName); err != nil {
			return false, err
		}
		if strings.HasPrefix(aliasName, alias.ReservedReearthPrefixProject) || strings.HasPrefix(aliasName, alias.ReservedReearthPrefixStory) {
			return false, alias.ErrInvalidProjectInvalidPrefixAlias.AddTemplateData("aliasName", aliasName)
		}

	} else {

		story, err := i.storytellingRepo.FindByID(ctx, *sid)
		if err != nil {
			return false, err
		}

		if aliasName == story.Alias() {
			// current alias
			return true, nil
		}

		if strings.HasPrefix(aliasName, alias.ReservedReearthPrefixProject) {
			// error 'c-' prefix
			return false, alias.ErrInvalidStorytellingInvalidPrefixAlias.AddTemplateData("aliasName", aliasName)
		} else if strings.HasPrefix(aliasName, alias.ReservedReearthPrefixStory) {
			id := strings.TrimPrefix(aliasName, alias.ReservedReearthPrefixStory)
			// only allow self ID
			if id != story.Id().String() {
				// error 'c-' prefix
				return false, alias.ErrInvalidStorytellingInvalidPrefixAlias.AddTemplateData("aliasName", aliasName)
			}
		}

		if story.Id().String() == aliasName || alias.ReservedReearthPrefixStory+story.Id().String() == aliasName {
			// allow self StoryID
		} else {
			if err := alias.CheckAliasPatternStorytelling(aliasName); err != nil {
				return false, err
			}
			if err := i.sceneRepo.CheckAliasUnique(ctx, aliasName); err != nil {
				return false, err
			}
			if err = i.storytellingRepo.CheckAliasUnique(ctx, aliasName); err != nil {
				return false, err
			}
		}

	}

	return true, nil
}

func (i *Storytelling) Publish(ctx context.Context, inp interfaces.PublishStoryInput, op *usecase.Operator) (*storytelling.Story, error) {
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

	story, err := i.storytellingRepo.FindByID(ctx, inp.ID)
	if err != nil {
		return nil, err
	}

	if err := i.CanWriteScene(story.Scene(), op); err != nil {
		return nil, err
	}

	prevAlias := story.Alias()

	// if StoryID is not specified
	if inp.Alias == nil || *inp.Alias == "" {
		// if you don't have an alias, set it to StoryID
		if story.Alias() == "" {
			story.UpdateAlias(alias.ReservedReearthPrefixStory + story.Id().String()) // default prefix + ID
		}
		// if anything is set, do nothing
	} else {
		newAlias := strings.ToLower(*inp.Alias)

		if strings.HasPrefix(newAlias, alias.ReservedReearthPrefixProject) {
			// error 'c-' prefix
			return nil, alias.ErrInvalidStorytellingInvalidPrefixAlias.AddTemplateData("aliasName", newAlias)
		} else if strings.HasPrefix(newAlias, alias.ReservedReearthPrefixStory) {
			id := strings.TrimPrefix(newAlias, alias.ReservedReearthPrefixStory)
			// only allow self ID
			if id != story.Id().String() {
				// error 'c-' prefix
				return nil, alias.ErrInvalidStorytellingInvalidPrefixAlias.AddTemplateData("aliasName", newAlias)
			}
		}

		story.UpdateAlias(newAlias)
	}

	if prevAlias == story.Alias() || story.Id().String() == story.Alias() || alias.ReservedReearthPrefixStory+story.Id().String() == story.Alias() {
		// if do not change alias or self StoryID, do nothing
	} else {
		if err := alias.CheckAliasPatternStorytelling(story.Alias()); err != nil {
			return nil, err
		}
		if err := i.sceneRepo.CheckAliasUnique(ctx, story.Alias()); err != nil {
			return nil, err
		}
		if err = i.storytellingRepo.CheckAliasUnique(ctx, story.Alias()); err != nil {
			return nil, err
		}
	}

	story.UpdatePublishmentStatus(inp.Status)

	// publish
	if story.PublishmentStatus() != storytelling.PublishmentStatusPrivate {
		if err := i.uploadPublishStory(ctx, story, op); err != nil {
			return nil, err
		}
		story.SetPublishedAt(time.Now())
	}

	// unpublish
	if story.PublishmentStatus() == storytelling.PublishmentStatusPrivate || prevAlias != story.Alias() {
		// always delete previous aliase
		if err = i.file.RemoveBuiltScene(ctx, prevAlias); err != nil {
			return story, err
		}
	}

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return story, nil
}

func (i *Storytelling) checkPublishPolicy(ctx context.Context, story *storytelling.Story, op *usecase.Operator) (*scene.Scene, error) {
	s, err := i.sceneRepo.FindByID(ctx, story.Scene())
	if err != nil {
		return nil, err
	}

	ws, err := i.workspaceRepo.FindByID(ctx, s.Workspace())
	if err != nil {
		return nil, err
	}
	if policyID := op.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return nil, err
		}
		s, err := i.projectRepo.CountPublicByWorkspace(ctx, ws.ID())
		if err != nil {
			return nil, err
		}
		if err := p.EnforcePublishedProjectCount(s + 1); err != nil {
			return nil, err
		}
	}
	return s, nil
}

func (i *Storytelling) uploadPublishStory(ctx context.Context, story *storytelling.Story, op *usecase.Operator) error {

	// enforce policy
	s, err := i.checkPublishPolicy(ctx, story, op)
	if err != nil {
		return err
	}

	// Lock
	if err := i.CheckSceneLock(ctx, story.Scene()); err != nil {
		return err
	}

	if err := i.UpdateSceneLock(ctx, story.Scene(), scene.LockModeFree, scene.LockModePublishing); err != nil {
		return err
	}

	defer i.ReleaseSceneLock(ctx, story.Scene())

	nlsLayers, err := i.nlsLayerRepo.FindByScene(ctx, story.Scene())
	if err != nil {
		return err
	}

	layerStyles, err := i.layerStyles.FindByScene(ctx, story.Scene())
	if err != nil {
		return err
	}

	// publish
	r, w := io.Pipe()

	// Build
	go func() {
		var err error

		defer func() {
			_ = w.CloseWithError(err)
		}()

		err = builder.New(
			repo.PropertyLoaderFrom(i.propertyRepo),
			repo.NLSLayerLoaderFrom(i.nlsLayerRepo),
			false,
		).ForScene(s).
			WithNLSLayers(&nlsLayers).
			WithLayerStyle(layerStyles).
			WithStory(story).
			Build(ctx, w, time.Now(), true, story.EnableGa(), story.TrackingID())
	}()

	// Save
	if err := i.file.UploadStory(ctx, r, story.Alias()); err != nil {
		return err
	}

	return nil
}

func (i *Storytelling) Move(_ context.Context, _ interfaces.MoveStoryInput, _ *usecase.Operator) (*id.StoryID, int, error) {
	return nil, 0, rerror.ErrNotImplemented
}

func (i *Storytelling) CreatePage(ctx context.Context, inp interfaces.CreatePageParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
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

	if err := i.CanWriteScene(inp.SceneID, op); err != nil {
		return nil, nil, interfaces.ErrOperationDenied
	}

	storyPageSchema := builtin.GetPropertySchema(builtin.PropertySchemaIDStoryPage)
	prop, err := i.addNewProperty(ctx, storyPageSchema.ID(), inp.SceneID, nil)
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

	s, err := i.sceneRepo.FindByID(ctx, inp.SceneID)
	if err != nil {
		return nil, nil, err
	}

	ws, err := i.workspaceRepo.FindByID(ctx, s.Workspace())
	if err != nil {
		return nil, nil, err
	}

	if policyID := op.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return nil, nil, err
		}

		var pageCount = len(story.Pages().Pages())
		if err := p.EnforcePageCount(pageCount + 1); err != nil {
			return nil, nil, err
		}
	}

	story.Pages().AddAt(page, inp.Index)

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) UpdatePage(ctx context.Context, inp interfaces.UpdatePageParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
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

	if err := i.CanWriteScene(inp.SceneID, op); err != nil {
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

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) RemovePage(ctx context.Context, inp interfaces.RemovePageParam, op *usecase.Operator) (*storytelling.Story, *id.PageID, error) {
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

	if err := i.CanWriteScene(inp.SceneID, op); err != nil {
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

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page.Id().Ref(), nil
}

func (i *Storytelling) MovePage(ctx context.Context, inp interfaces.MovePageParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, int, error) {
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

	if err := i.CanWriteScene(story.Scene(), op); err != nil {
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

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, 0, err
	}

	tx.Commit()
	return story, page, inp.Index, nil
}

func (i *Storytelling) DuplicatePage(ctx context.Context, inp interfaces.DuplicatePageParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
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

	if err := i.CanWriteScene(story.Scene(), op); err != nil {
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

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, dupPage, nil
}

func (i *Storytelling) AddPageLayer(ctx context.Context, inp interfaces.PageLayerParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
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

	if err := i.CanWriteScene(story.Scene(), op); err != nil {
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

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) RemovePageLayer(ctx context.Context, inp interfaces.PageLayerParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, error) {
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

	if err := i.CanWriteScene(story.Scene(), op); err != nil {
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

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return story, page, nil
}

func (i *Storytelling) CreateBlock(ctx context.Context, inp interfaces.CreateBlockParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, *storytelling.Block, int, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, nil, -1, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, nil, -1, err
	}
	if err := i.CanWriteScene(story.Scene(), op); err != nil {
		return nil, nil, nil, -1, err
	}

	s, err := i.sceneRepo.FindByID(ctx, story.Scene())
	if err != nil {
		return nil, nil, nil, -1, err
	}

	ws, err := i.workspaceRepo.FindByID(ctx, s.Workspace())
	if err != nil {
		return nil, nil, nil, -1, err
	}

	if policyID := op.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return nil, nil, nil, -1, err
		}

		story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
		if err != nil {
			return nil, nil, nil, -1, err
		}

		page := story.Pages().Page(inp.PageID)
		if page == nil {
			return nil, nil, nil, -1, interfaces.ErrPageNotFound
		}

		var s = page.Count()
		if err := p.EnforceBlocksCount(s + 1); err != nil {
			return nil, nil, nil, -1, err
		}
	}

	_, extension, err := i.getStoryBlockPlugin(ctx, story.Scene(), inp.PluginID.String(), inp.ExtensionID.String())
	if err != nil {
		return nil, nil, nil, -1, err
	}

	prop, err := i.addNewProperty(ctx, extension.Schema(), story.Scene(), nil)
	if err != nil {
		return nil, nil, nil, -1, err
	}

	block, err := storytelling.NewBlock().
		NewID().
		Plugin(inp.PluginID).
		Extension(inp.ExtensionID).
		Property(prop.ID()).
		Build()
	if err != nil {
		return nil, nil, nil, -1, err
	}

	index := -1
	if inp.Index != nil {
		index = *inp.Index
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, nil, -1, interfaces.ErrPageNotFound
	}

	page.AddBlock(block, index)

	err = i.storytellingRepo.Save(ctx, *story)
	if err != nil {
		return nil, nil, nil, -1, err
	}

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, nil, -1, err
	}

	tx.Commit()
	return story, page, block, 1, err
}

func (i *Storytelling) RemoveBlock(ctx context.Context, inp interfaces.RemoveBlockParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, *id.BlockID, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, nil, err
	}
	if err := i.CanWriteScene(story.Scene(), op); err != nil {
		return nil, nil, nil, err
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, nil, interfaces.ErrPageNotFound
	}

	block := page.Block(inp.BlockID)
	if block == nil {
		return nil, nil, nil, interfaces.ErrBlockNotFound
	}

	page.RemoveBlock(inp.BlockID)
	err = i.storytellingRepo.Save(ctx, *story)
	if err != nil {
		return nil, nil, nil, err
	}

	if err := i.propertyRepo.Remove(ctx, block.Property()); err != nil {
		return nil, nil, nil, err
	}

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, nil, err
	}

	tx.Commit()
	return story, page, &inp.BlockID, nil
}

func (i *Storytelling) MoveBlock(ctx context.Context, inp interfaces.MoveBlockParam, op *usecase.Operator) (*storytelling.Story, *storytelling.Page, *id.BlockID, int, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, nil, inp.Index, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	story, err := i.storytellingRepo.FindByID(ctx, inp.StoryID)
	if err != nil {
		return nil, nil, nil, inp.Index, err
	}
	if err := i.CanWriteScene(story.Scene(), op); err != nil {
		return nil, nil, nil, inp.Index, err
	}

	page := story.Pages().Page(inp.PageID)
	if page == nil {
		return nil, nil, nil, inp.Index, interfaces.ErrPageNotFound
	}

	if block := page.Block(inp.BlockID); block == nil {
		return nil, nil, nil, inp.Index, interfaces.ErrBlockNotFound
	}

	page.MoveBlock(inp.BlockID, inp.Index)
	err = i.storytellingRepo.Save(ctx, *story)
	if err != nil {
		return nil, nil, nil, inp.Index, err
	}

	err = updateProjectUpdatedAtByScene(ctx, story.Scene(), i.projectRepo, i.sceneRepo)
	if err != nil {
		return nil, nil, nil, inp.Index, err
	}

	tx.Commit()
	return story, page, &inp.BlockID, inp.Index, nil
}

func (i *Storytelling) ImportStory(ctx context.Context, sceneID id.SceneID, data *[]byte) (*storytelling.Story, error) {

	sceneJSON, err := builder.ParseSceneJSONByByte(data)
	if err != nil {
		return nil, err
	}

	filter := Filter(sceneID)

	storyJSON := sceneJSON.Story

	pages := []*storytelling.Page{}
	for _, pageJSON := range storyJSON.Pages {

		blocks := storytelling.BlockList{}
		for _, blockJSON := range pageJSON.Blocks {

			plg, extension, err := i.getStoryBlockPlugin(ctx, sceneID, blockJSON.PluginId, blockJSON.ExtensionId)
			if err != nil {
				return nil, err
			}

			propB, err := i.addNewProperty(ctx, extension.Schema(), sceneID, &filter)
			if err != nil {
				return nil, err
			}
			builder.PropertyUpdate(ctx, propB, i.propertyRepo, i.propertySchemaRepo, blockJSON.Property)
			for k, v := range blockJSON.Plugins {
				fmt.Println("Unsupported blockJSON.Plugins ", k, v)
			}

			block, err := storytelling.NewBlock().
				ID(id.NewBlockID()).
				Property(propB.ID()).
				Plugin(plg.ID()).
				Extension(id.PluginExtensionID(blockJSON.ExtensionId)).
				Build()
			if err != nil {
				return nil, err
			}

			blocks = append(blocks, block)

		}

		storyPageSchema := builtin.GetPropertySchema(builtin.PropertySchemaIDStoryPage)

		propP, err := i.addNewProperty(ctx, storyPageSchema.ID(), sceneID, &filter)
		if err != nil {
			return nil, err
		}

		builder.PropertyUpdate(ctx, propP, i.propertyRepo, i.propertySchemaRepo, pageJSON.Property)

		var swipeableLayers id.NLSLayerIDList
		for _, swipeableLayer := range pageJSON.SwipeableLayers {
			if id, err := id.NLSLayerIDFrom(swipeableLayer); err == nil {
				swipeableLayers = append(swipeableLayers, id)
			}
		}

		var layers id.NLSLayerIDList
		for _, layer := range pageJSON.Layers {
			if id, err := id.NLSLayerIDFrom(layer); err == nil {
				layers = append(layers, id)
			}
		}

		page, err := storytelling.NewPage().
			ID(id.NewPageID()).
			Property(propP.ID()).
			Title(pageJSON.Title).
			Blocks(blocks).
			Swipeable(pageJSON.Swipeable).
			SwipeableLayers(swipeableLayers).
			Layers(layers).
			Build()
		if err != nil {
			return nil, err
		}

		pages = append(pages, page)

	}

	storySchema := builtin.GetPropertySchema(builtin.PropertySchemaIDStory)
	propS, err := i.addNewProperty(ctx, storySchema.ID(), sceneID, &filter)
	if err != nil {
		return nil, err
	}

	builder.PropertyUpdate(ctx, propS, i.propertyRepo, i.propertySchemaRepo, storyJSON.Property)

	story, err := storytelling.NewStory().
		ID(id.NewStoryID()).
		Title(storyJSON.Title).
		Property(propS.ID()).
		Pages(storytelling.NewPageList(pages)).
		Scene(sceneID).
		PanelPosition(storytelling.Position(storyJSON.PanelPosition)).
		BgColor(storyJSON.BgColor).
		Build()
	if err != nil {
		return nil, err
	}

	if err := i.storytellingRepo.Filtered(filter).Save(ctx, *story); err != nil {
		return nil, err
	}

	result, err := i.storytellingRepo.Filtered(filter).FindByID(ctx, story.Id())
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (i *Storytelling) getPlugin(ctx context.Context, sId id.SceneID, pId *id.PluginID, eId *id.PluginExtensionID) (*plugin.Plugin, *plugin.Extension, error) {
	if pId == nil {
		return nil, nil, nil
	}

	readableFilter := repo.SceneFilter{Readable: id.SceneIDList{sId}}
	plg, err := i.pluginRepo.Filtered(readableFilter).FindByID(ctx, *pId)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil, ErrPluginNotFound
		}
		return nil, nil, err
	}

	if eId == nil {
		return plg, nil, nil
	}

	extension := plg.Extension(*eId)
	if extension == nil {
		return nil, nil, ErrExtensionNotFound
	}

	return plg, extension, nil
}

func (i *Storytelling) getStoryBlockPlugin(ctx context.Context, sId id.SceneID, pId string, eId string) (*plugin.Plugin, *plugin.Extension, error) {
	pluginID, err := id.PluginIDFrom(pId)
	if err != nil {
		return nil, nil, err
	}
	extensionID := id.PluginExtensionID(eId)
	plg, extension, err := i.getPlugin(ctx, sId, &pluginID, &extensionID)
	if err != nil {
		return nil, nil, err
	}
	if extension.Type() != plugin.ExtensionTypeStoryBlock {
		return nil, nil, interfaces.ErrExtensionTypeMustBeStoryBlock
	}
	return plg, extension, nil
}

func (i *Storytelling) addNewProperty(ctx context.Context, schemaID id.PropertySchemaID, sceneID id.SceneID, filter *repo.SceneFilter) (*property.Property, error) {
	prop, err := property.New().NewID().Schema(schemaID).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}
	if filter == nil {
		if err = i.propertyRepo.Save(ctx, prop); err != nil {
			return nil, err
		}
	} else {
		if err = i.propertyRepo.Filtered(*filter).Save(ctx, prop); err != nil {
			return nil, err
		}
	}
	return prop, nil
}
