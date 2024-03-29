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
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type Project struct {
	common
	commonSceneLock
	assetRepo         repo.Asset
	projectRepo       repo.Project
	userRepo          accountrepo.User
	workspaceRepo     accountrepo.Workspace
	sceneRepo         repo.Scene
	propertyRepo      repo.Property
	layerRepo         repo.Layer
	datasetRepo       repo.Dataset
	datasetSchemaRepo repo.DatasetSchema
	tagRepo           repo.Tag
	transaction       usecasex.Transaction
	policyRepo        repo.Policy
	file              gateway.File
	nlsLayerRepo      repo.NLSLayer
	layerStyles       repo.Style
}

func NewProject(r *repo.Container, gr *gateway.Container) interfaces.Project {
	return &Project{
		commonSceneLock:   commonSceneLock{sceneLockRepo: r.SceneLock},
		assetRepo:         r.Asset,
		projectRepo:       r.Project,
		userRepo:          r.User,
		workspaceRepo:     r.Workspace,
		sceneRepo:         r.Scene,
		propertyRepo:      r.Property,
		layerRepo:         r.Layer,
		datasetRepo:       r.Dataset,
		datasetSchemaRepo: r.DatasetSchema,
		tagRepo:           r.Tag,
		transaction:       r.Transaction,
		policyRepo:        r.Policy,
		file:              gr.File,
		nlsLayerRepo:      r.NLSLayer,
		layerStyles:       r.Style,
	}
}

func (i *Project) Fetch(ctx context.Context, ids []id.ProjectID, _ *usecase.Operator) ([]*project.Project, error) {
	return i.projectRepo.FindByIDs(ctx, ids)
}

func (i *Project) FindByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, p *usecasex.Pagination, _ *usecase.Operator) ([]*project.Project, *usecasex.PageInfo, error) {
	return i.projectRepo.FindByWorkspace(ctx, id, p)
}

func (i *Project) Create(ctx context.Context, p interfaces.CreateProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	if err := i.CanWriteWorkspace(p.WorkspaceID, operator); err != nil {
		return nil, err
	}

	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	ws, err := i.workspaceRepo.FindByID(ctx, p.WorkspaceID)
	if err != nil {
		return nil, err
	}

	// enforce policy
	if policyID := operator.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return nil, err
		}

		projectCount, err := i.projectRepo.CountByWorkspace(ctx, ws.ID())
		if err != nil {
			return nil, err
		}

		if err := p.EnforceProjectCount(projectCount + 1); err != nil {
			return nil, err
		}
	}

	pb := project.New().
		NewID().
		Workspace(p.WorkspaceID).
		Visualizer(p.Visualizer)
	if p.Name != nil {
		pb = pb.Name(*p.Name)
	}
	if p.Description != nil {
		pb = pb.Description(*p.Description)
	}
	if p.ImageURL != nil {
		pb = pb.ImageURL(p.ImageURL)
	}
	if p.Alias != nil {
		pb = pb.Alias(*p.Alias)
	}
	if p.Archived != nil {
		pb = pb.IsArchived(*p.Archived)
	}
	if p.CoreSupport != nil {
		pb = pb.CoreSupport(*p.CoreSupport)
	}

	proj, err := pb.Build()
	if err != nil {
		return nil, err
	}

	err = i.projectRepo.Save(ctx, proj)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return proj, nil
}

func (i *Project) Update(ctx context.Context, p interfaces.UpdateProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	prj, err := i.projectRepo.FindByID(ctx, p.ID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteWorkspace(prj.Workspace(), operator); err != nil {
		return nil, err
	}

	oldAlias := prj.Alias()

	if p.Name != nil {
		prj.UpdateName(*p.Name)
	}

	if p.Description != nil {
		prj.UpdateDescription(*p.Description)
	}

	if p.Alias != nil {
		if err := prj.UpdateAlias(*p.Alias); err != nil {
			return nil, err
		}
	}

	if p.DeleteImageURL {
		prj.SetImageURL(nil)
	} else if p.ImageURL != nil {
		prj.SetImageURL(p.ImageURL)
	}

	if p.Archived != nil {
		prj.SetArchived(*p.Archived)
	}

	if p.IsBasicAuthActive != nil {
		prj.SetIsBasicAuthActive(*p.IsBasicAuthActive)
	}

	if p.BasicAuthUsername != nil {
		prj.SetBasicAuthUsername(*p.BasicAuthUsername)
	}

	if p.BasicAuthPassword != nil {
		prj.SetBasicAuthPassword(*p.BasicAuthPassword)
	}

	if p.PublicTitle != nil {
		prj.UpdatePublicTitle(*p.PublicTitle)
	}

	if p.PublicDescription != nil {
		prj.UpdatePublicDescription(*p.PublicDescription)
	}

	if p.DeletePublicImage {
		prj.UpdatePublicImage("")
	} else if p.PublicImage != nil {
		prj.UpdatePublicImage(*p.PublicImage)
	}

	if p.PublicNoIndex != nil {
		prj.UpdatePublicNoIndex(*p.PublicNoIndex)
	}

	if p.EnableGa != nil {
		prj.UpdateEnableGA(*p.EnableGa)
	}

	if p.TrackingID != nil {
		prj.UpdateTrackingID(*p.TrackingID)
	}

	if p.SceneID != nil {
		prj.UpdateSceneID(*p.SceneID)
	}

	if p.PublicDescription != nil {
		prj.UpdatePublicDescription(*p.PublicDescription)
	}

	if prj.PublishmentStatus() != project.PublishmentStatusPrivate && p.Alias != nil && *p.Alias != oldAlias {
		if err := i.file.MoveBuiltScene(ctx, oldAlias, *p.Alias); err != nil {
			// ignore ErrNotFound
			if !errors.Is(err, rerror.ErrNotFound) {
				return nil, err
			}
		}
	}

	if err := i.projectRepo.Save(ctx, prj); err != nil {
		return nil, err
	}

	tx.Commit()
	return prj, nil
}

func (i *Project) CheckAlias(ctx context.Context, alias string) (bool, error) {
	if !project.CheckAliasPattern(alias) {
		return false, project.ErrInvalidAlias
	}

	prj, err := i.projectRepo.FindByPublicName(ctx, alias)
	if prj == nil && err == nil || err != nil && errors.Is(err, rerror.ErrNotFound) {
		return true, nil
	}

	return false, err
}

func (i *Project) Publish(ctx context.Context, params interfaces.PublishProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	prj, err := i.projectRepo.FindByID(ctx, params.ID)
	if err != nil {
		return nil, err
	}
	coreSupport := prj.CoreSupport()
	enableGa := prj.EnableGA()
	trackingId := prj.TrackingID()
	if err := i.CanWriteWorkspace(prj.Workspace(), operator); err != nil {
		return nil, err
	}

	ws, err := i.workspaceRepo.FindByID(ctx, prj.Workspace())
	if err != nil {
		return nil, err
	}

	// enforce policy
	if params.Status != project.PublishmentStatusPrivate {
		if policyID := operator.Policy(ws.Policy()); policyID != nil {
			p, err := i.policyRepo.FindByID(ctx, *policyID)
			if err != nil {
				return nil, err
			}

			projectCount, err := i.projectRepo.CountPublicByWorkspace(ctx, ws.ID())
			if err != nil {
				return nil, err
			}

			// newrly published
			if prj.PublishmentStatus() == project.PublishmentStatusPrivate {
				projectCount += 1
			}

			if err := p.EnforcePublishedProjectCount(projectCount); err != nil {
				return nil, err
			}
		}
	}

	s, err := i.sceneRepo.FindByProject(ctx, params.ID)
	if err != nil {
		return nil, err
	}

	if err := i.CheckSceneLock(ctx, s.ID()); err != nil {
		return nil, err
	}

	sceneID := s.ID()

	prevAlias := prj.Alias()
	if params.Alias == nil && prevAlias == "" && params.Status != project.PublishmentStatusPrivate {
		return nil, interfaces.ErrProjectAliasIsNotSet
	}

	var prevPublishedAlias string
	if prj.PublishmentStatus() != project.PublishmentStatusPrivate {
		prevPublishedAlias = prevAlias
	}

	newAlias := prevAlias
	if params.Alias != nil {
		if prj2, err := i.projectRepo.FindByPublicName(ctx, *params.Alias); err != nil && !errors.Is(rerror.ErrNotFound, err) {
			return nil, err
		} else if prj2 != nil && prj.ID() != prj2.ID() {
			return nil, interfaces.ErrProjectAliasAlreadyUsed
		}

		if err := prj.UpdateAlias(*params.Alias); err != nil {
			return nil, err
		}
		newAlias = *params.Alias
	}

	newPublishedAlias := newAlias

	nlsLayers, err := i.nlsLayerRepo.FindByScene(ctx, sceneID)
	if err != nil {
		return nil, err
	}

	layerStyles, err := i.layerStyles.FindByScene(ctx, sceneID)
	if err != nil {
		return nil, err
	}

	// Lock
	if err := i.UpdateSceneLock(ctx, sceneID, scene.LockModeFree, scene.LockModePublishing); err != nil {
		return nil, err
	}

	defer i.ReleaseSceneLock(ctx, sceneID)

	if params.Status == project.PublishmentStatusPrivate {
		// unpublish
		if err = i.file.RemoveBuiltScene(ctx, prevPublishedAlias); err != nil {
			return prj, err
		}
	} else {
		// publish
		r, w := io.Pipe()

		// Build
		scenes := []id.SceneID{sceneID}
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
			).ForScene(s).WithNLSLayers(&nlsLayers).WithLayerStyle(layerStyles).Build(ctx, w, time.Now(), coreSupport, enableGa, trackingId)
		}()

		// Save
		if err := i.file.UploadBuiltScene(ctx, r, newPublishedAlias); err != nil {
			return nil, err
		}

		// If project has been published before and alias is changed,
		// remove old published data.
		if prevPublishedAlias != "" && newPublishedAlias != prevPublishedAlias {
			if err := i.file.RemoveBuiltScene(ctx, prevPublishedAlias); err != nil {
				return nil, err
			}
		}
	}

	prj.UpdatePublishmentStatus(params.Status)
	prj.SetPublishedAt(time.Now())

	if err := i.projectRepo.Save(ctx, prj); err != nil {
		return nil, err
	}

	tx.Commit()
	return prj, nil
}

func (i *Project) Delete(ctx context.Context, projectID id.ProjectID, operator *usecase.Operator) (err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	prj, err := i.projectRepo.FindByID(ctx, projectID)
	if err != nil {
		return err
	}
	if err := i.CanWriteWorkspace(prj.Workspace(), operator); err != nil {
		return err
	}

	deleter := ProjectDeleter{
		SceneDeleter: SceneDeleter{
			Scene:         i.sceneRepo,
			SceneLock:     i.sceneLockRepo,
			Layer:         i.layerRepo,
			Property:      i.propertyRepo,
			Dataset:       i.datasetRepo,
			DatasetSchema: i.datasetSchemaRepo,
		},
		File:    i.file,
		Project: i.projectRepo,
	}
	if err := deleter.Delete(ctx, prj, true, operator); err != nil {
		return err
	}

	tx.Commit()
	return nil
}
