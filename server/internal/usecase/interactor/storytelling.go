package interactor

import (
	"context"
	"errors"
	"io"
	"time"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	scene2 "github.com/reearth/reearth/server/pkg/scene"
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
	layerRepo        repo.Layer
	datasetRepo      repo.Dataset
	tagRepo          repo.Tag
	file             gateway.File
	transaction      usecasex.Transaction
	nlsLayerRepo     repo.NLSLayer
	layerStyles      repo.Style
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
		layerRepo:        r.Layer,
		datasetRepo:      r.Dataset,
		tagRepo:          r.Tag,
		file:             gr.File,
		transaction:      r.Transaction,
		nlsLayerRepo:     r.NLSLayer,
		layerStyles:      r.Style,
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

	if err = i.propertyRepo.Save(ctx, prop); err != nil {
		return nil, err
	}

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
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

	oldAlias := story.Alias()
	if inp.Alias != nil && *inp.Alias != oldAlias {
		if err := story.UpdateAlias(*inp.Alias); err != nil {
			return nil, err
		}
	}

	// TODO: Handel ordering

	err = i.storytellingRepo.Save(ctx, *story)
	if err != nil {
		return nil, err
	}

	if story.PublishmentStatus() != storytelling.PublishmentStatusPrivate && inp.Alias != nil && story.Alias() != oldAlias {
		if err := i.file.MoveStory(ctx, oldAlias, story.Alias()); err != nil {
			// ignore ErrNotFound
			if !errors.Is(err, rerror.ErrNotFound) {
				return nil, err
			}
		}
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

	return &inp.StoryID, nil
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
	if err := i.CheckSceneLock(ctx, story.Scene()); err != nil {
		return nil, err
	}

	scene, err := i.sceneRepo.FindByID(ctx, story.Scene())
	if err != nil {
		return nil, err
	}

	// prj, err := i.projectRepo.FindByScene(ctx, story.Scene())
	// if err != nil {
	// 	return nil, err
	// }

	// enableGa := prj.EnableGA()
	// trackingId := prj.TrackingID()

	//
	// Commenting this out till the point we make a decision on this: @pyshx
	//
	// ws, err := i.workspaceRepo.FindByID(ctx, scene.Workspace())
	// if err != nil {
	// 	return nil, err
	// }

	// if story.PublishmentStatus() == storytelling.PublishmentStatusPrivate {
	// 	// enforce policy
	// 	if policyID := op.Policy(ws.Policy()); policyID != nil {
	// 		p, err := i.policyRepo.FindByID(ctx, *policyID)
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 		s, err := i.projectRepo.CountPublicByWorkspace(ctx, ws.ID())
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 		if err := p.EnforcePublishedProjectCount(s + 1); err != nil {
	// 			return nil, err
	// 		}
	// 	}
	// }

	nlsLayers, err := i.nlsLayerRepo.FindByScene(ctx, story.Scene())
	if err != nil {
		return nil, err
	}

	layerStyles, err := i.layerStyles.FindByScene(ctx, story.Scene())
	if err != nil {
		return nil, err
	}

	prevAlias := story.Alias()
	if inp.Alias == nil && prevAlias == "" && inp.Status != storytelling.PublishmentStatusPrivate {
		return nil, interfaces.ErrProjectAliasIsNotSet
	}

	var prevPublishedAlias string
	if story.PublishmentStatus() != storytelling.PublishmentStatusPrivate {
		prevPublishedAlias = prevAlias
	}

	newAlias := prevAlias
	if inp.Alias != nil && *inp.Alias != prevAlias {
		if publishedStory, err := i.storytellingRepo.FindByPublicName(ctx, *inp.Alias); err != nil && !errors.Is(rerror.ErrNotFound, err) {
			return nil, err
		} else if publishedStory != nil && story.Id() != publishedStory.Id() {
			return nil, interfaces.ErrProjectAliasAlreadyUsed
		}

		if err := story.UpdateAlias(*inp.Alias); err != nil {
			return nil, err
		}
		newAlias = *inp.Alias
	}

	// Lock
	if err := i.UpdateSceneLock(ctx, scene.ID(), scene2.LockModeFree, scene2.LockModePublishing); err != nil {
		return nil, err
	}

	defer i.ReleaseSceneLock(ctx, scene.ID())

	if inp.Status == storytelling.PublishmentStatusPrivate {
		// unpublish
		if err = i.file.RemoveStory(ctx, prevPublishedAlias); err != nil {
			return story, err
		}
	} else {
		// publish
		r, w := io.Pipe()

		// Build
		scenes := []id.SceneID{scene.ID()}
		go func() {
			var err error

			defer func() {
				_ = w.CloseWithError(err)
			}()

			err = builder.New(
				repo.LayerLoaderFrom(i.layerRepo),
				repo.PropertyLoaderFrom(i.propertyRepo),
				repo.DatasetGraphLoaderFrom(i.datasetRepo),
				repo.TagLoaderFrom(i.tagRepo),
				repo.TagSceneLoaderFrom(i.tagRepo, scenes),
				repo.NLSLayerLoaderFrom(i.nlsLayerRepo),
			).ForScene(scene).WithNLSLayers(&nlsLayers).WithLayerStyle(layerStyles).WithStory(story).Build(ctx, w, time.Now(), true, false, "")
		}()

		// Save
		if err := i.file.UploadStory(ctx, r, newAlias); err != nil {
			return nil, err
		}

		// If project has been published before and alias is changed,
		// remove old published data.
		if prevPublishedAlias != "" && newAlias != prevPublishedAlias {
			if err := i.file.RemoveStory(ctx, prevPublishedAlias); err != nil {
				return nil, err
			}
		}
	}

	story.UpdatePublishmentStatus(inp.Status)
	story.SetPublishedAt(time.Now())

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
		return nil, err
	}

	tx.Commit()
	return story, nil
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

	if err = i.propertyRepo.Save(ctx, prop); err != nil {
		return nil, nil, err
	}

	if err := i.storytellingRepo.Save(ctx, *story); err != nil {
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

	_, extension, err := i.getPlugin(ctx, &inp.PluginID, &inp.ExtensionID)
	if err != nil {
		return nil, nil, nil, -1, err
	}
	if extension.Type() != plugin.ExtensionTypeStoryBlock {
		return nil, nil, nil, -1, interfaces.ErrExtensionTypeMustBeStoryBlock
	}

	prop, err := property.New().NewID().Schema(extension.Schema()).Scene(story.Scene()).Build()
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

	err = i.propertyRepo.Save(ctx, prop)
	if err != nil {
		return nil, nil, nil, -1, err
	}

	err = i.storytellingRepo.Save(ctx, *story)
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

	tx.Commit()
	return story, page, &inp.BlockID, inp.Index, nil
}

func (i *Storytelling) getPlugin(ctx context.Context, pId *id.PluginID, eId *id.PluginExtensionID) (*plugin.Plugin, *plugin.Extension, error) {
	if pId == nil {
		return nil, nil, nil
	}

	plg, err := i.pluginRepo.FindByID(ctx, *pId)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil, interfaces.ErrPluginNotFound
		}
		return nil, nil, err
	}

	if eId == nil {
		return plg, nil, nil
	}

	extension := plg.Extension(*eId)
	if extension == nil {
		return nil, nil, interfaces.ErrExtensionNotFound
	}

	return plg, extension, nil
}
