package interactor

import (
	"archive/zip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	jsonmodel "github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/spf13/afero"
)

type Project struct {
	common
	commonSceneLock
	assetRepo         repo.Asset
	projectRepo       repo.Project
	storytellingRepo  repo.Storytelling
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
	pluginRepo        repo.Plugin
}

func NewProject(r *repo.Container, gr *gateway.Container) interfaces.Project {
	return &Project{
		commonSceneLock:   commonSceneLock{sceneLockRepo: r.SceneLock},
		assetRepo:         r.Asset,
		projectRepo:       r.Project,
		storytellingRepo:  r.Storytelling,
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
		pluginRepo:        r.Plugin,
	}
}

func (i *Project) Fetch(ctx context.Context, ids []id.ProjectID, _ *usecase.Operator) ([]*project.Project, error) {
	return i.projectRepo.FindByIDs(ctx, ids)
}

func (i *Project) FindByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, keyword *string, sort *project.SortType, p *usecasex.Pagination, operator *usecase.Operator) ([]*project.Project, *usecasex.PageInfo, error) {
	return i.projectRepo.FindByWorkspace(ctx, id, repo.ProjectFilter{
		Pagination: p,
		Sort:       sort,
		Keyword:    keyword,
	})
}

func (i *Project) FindStarredByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, operator *usecase.Operator) ([]*project.Project, error) {
	return i.projectRepo.FindStarredByWorkspace(ctx, id)
}

func (i *Project) FindDeletedByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, operator *usecase.Operator) ([]*project.Project, error) {
	return i.projectRepo.FindDeletedByWorkspace(ctx, id)
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
	if p.Core != nil {
		pb = pb.Core(*p.Core)
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

	if p.Starred != nil {
		prj.SetStarred(*p.Starred)
	}

	if p.Deleted != nil {
		prj.SetDeleted(*p.Deleted)
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

	currentTime := time.Now().UTC()
	prj.SetUpdatedAt(currentTime)

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
	core := prj.Core()
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
		if prj2, err := i.projectRepo.FindByPublicName(ctx, *params.Alias); err != nil && !errors.Is(err, rerror.ErrNotFound) {
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
				false,
			).ForScene(s).WithNLSLayers(&nlsLayers).WithLayerStyle(layerStyles).Build(ctx, w, time.Now(), core, enableGa, trackingId)
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

func (i *Project) ExportProject(ctx context.Context, projectID id.ProjectID, zipWriter *zip.Writer, operator *usecase.Operator) (*project.Project, error) {

	prj, err := i.projectRepo.FindByID(ctx, projectID)
	if err != nil {
		return nil, errors.New("project " + err.Error())
	}
	if prj.IsDeleted() {
		fmt.Printf("Error Deleted project: %v\n", prj.ID())
		return nil, errors.New("This project is deleted")
	}

	// project image
	if prj.ImageURL() != nil {
		trimmedName := strings.TrimPrefix(prj.ImageURL().Path, "/assets/")
		stream, err := i.file.ReadAsset(ctx, trimmedName)
		if err != nil {
			return prj, nil // skip if external URL
			// return nil, errors.New("assets " + err.Error())
		}
		defer func() {
			if cerr := stream.Close(); cerr != nil {
				fmt.Printf("Error closing file: %v\n", cerr)
			}
		}()
		zipEntryPath := fmt.Sprintf("assets/%s", trimmedName)
		zipEntry, err := zipWriter.Create(zipEntryPath)
		if err != nil {
			return nil, err
		}
		_, err = io.Copy(zipEntry, stream)
		if err != nil {
			_ = stream.Close()
			return nil, err
		}
	}

	return prj, nil
}

func (i *Project) UploadExportProjectZip(ctx context.Context, zipWriter *zip.Writer, zipFile afero.File, data map[string]interface{}, prj *project.Project) error {
	fileWriter, err := zipWriter.Create("project.json")
	if err != nil {
		return err
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	if _, err = fileWriter.Write(jsonData); err != nil {
		return err
	}

	if err := zipWriter.Close(); err != nil {
		return err
	}

	if _, err := zipFile.Seek(0, 0); err != nil {
		return err
	}
	defer func() {
		if err := zipFile.Close(); err != nil {
			fmt.Println("Failed to close zip file:", err)
		}
	}()
	if err := i.file.UploadExportProjectZip(ctx, zipFile); err != nil {
		return err
	}
	return nil
}

func (i *Project) ImportProject(ctx context.Context, teamID string, projectData map[string]interface{}) (*project.Project, usecasex.Tx, error) {

	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	var p = jsonmodel.ToProjectFromJSON(projectData)

	workspaceID, err := accountdomain.WorkspaceIDFrom(teamID)
	if err != nil {
		return nil, nil, err
	}

	prjBuilder := project.New().
		ID(project.NewID()).
		Workspace(workspaceID).
		IsArchived(p.IsArchived).
		IsBasicAuthActive(p.IsBasicAuthActive).
		BasicAuthUsername(p.BasicAuthUsername).
		BasicAuthPassword(p.BasicAuthPassword).
		Name(p.Name).
		Description(p.Description).
		Alias(p.Alias).
		PublicTitle(p.PublicTitle).
		PublicDescription(p.PublicDescription).
		PublicImage(p.PublicImage).
		PublicNoIndex(p.PublicNoIndex).
		Core(p.Core).
		EnableGA(p.EnableGa).
		TrackingID(p.TrackingID).
		Starred(p.Starred)

	if !p.CreatedAt.IsZero() {
		prjBuilder = prjBuilder.UpdatedAt(p.CreatedAt)
	}
	if p.PublishedAt != nil {
		prjBuilder = prjBuilder.PublishedAt(*p.PublishedAt)
	}

	if p.ImageURL != nil {
		if p.ImageURL.Host == "localhost:8080" || strings.HasSuffix(p.ImageURL.Host, ".reearth.dev") || strings.HasSuffix(p.ImageURL.Host, ".reearth.io") {
			currentHost := adapter.CurrentHost(ctx)
			currentHost = strings.TrimPrefix(currentHost, "https://")
			currentHost = strings.TrimPrefix(currentHost, "http://")
			if currentHost == "localhost:8080" {
				p.ImageURL.Scheme = "http"
			} else {
				p.ImageURL.Scheme = "https"
			}
			p.ImageURL.Host = currentHost
		}
		prjBuilder = prjBuilder.ImageURL(p.ImageURL)
	}

	prjBuilder = prjBuilder.Visualizer(visualizer.Visualizer(p.Visualizer))
	prjBuilder = prjBuilder.PublishmentStatus(gqlmodel.FromPublishmentStatus(p.PublishmentStatus))

	prj, err := prjBuilder.Build()
	if err != nil {
		return nil, nil, err
	}
	if err := i.projectRepo.Save(ctx, prj); err != nil {
		return nil, nil, err
	}
	prj, err = i.projectRepo.FindByID(ctx, prj.ID())
	if err != nil {
		return nil, nil, err
	}
	return prj, tx, nil
}

func updateProjectUpdatedAt(ctx context.Context, prj *project.Project, r repo.Project) error {
	currentTime := time.Now().UTC()
	prj.SetUpdatedAt(currentTime)

	if err := r.Save(ctx, prj); err != nil {
		return err
	}
	return nil
}

func updateProjectUpdatedAtByID(ctx context.Context, projectID id.ProjectID, r repo.Project) error {
	prj, err := r.FindByID(ctx, projectID)
	if err != nil {
		return err
	}
	return updateProjectUpdatedAt(ctx, prj, r)
}

func updateProjectUpdatedAtByScene(ctx context.Context, sceneID id.SceneID, r repo.Project, s repo.Scene) error {
	scene, err := s.FindByID(ctx, sceneID)
	if err != nil {
		return err
	}
	err = updateProjectUpdatedAtByID(ctx, scene.Project(), r)
	if err != nil {
		return err
	}
	return nil
}
