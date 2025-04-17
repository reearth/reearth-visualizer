package interactor

import (
	"archive/zip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth/server/internal/adapter"
	jsonmodel "github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/file"
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
	assetRepo          repo.Asset
	projectRepo        repo.Project
	storytellingRepo   repo.Storytelling
	userRepo           accountrepo.User
	workspaceRepo      accountrepo.Workspace
	sceneRepo          repo.Scene
	propertyRepo       repo.Property
	propertySchemaRepo repo.PropertySchema
	transaction        usecasex.Transaction
	policyRepo         repo.Policy
	file               gateway.File
	nlsLayerRepo       repo.NLSLayer
	layerStyles        repo.Style
	pluginRepo         repo.Plugin
}

func NewProject(r *repo.Container, gr *gateway.Container) interfaces.Project {
	return &Project{
		commonSceneLock:    commonSceneLock{sceneLockRepo: r.SceneLock},
		assetRepo:          r.Asset,
		projectRepo:        r.Project,
		storytellingRepo:   r.Storytelling,
		userRepo:           r.User,
		workspaceRepo:      r.Workspace,
		sceneRepo:          r.Scene,
		propertyRepo:       r.Property,
		transaction:        r.Transaction,
		policyRepo:         r.Policy,
		file:               gr.File,
		nlsLayerRepo:       r.NLSLayer,
		layerStyles:        r.Style,
		pluginRepo:         r.Plugin,
		propertySchemaRepo: r.PropertySchema,
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

func (i *Project) Create(ctx context.Context, input interfaces.CreateProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	return i.createProject(ctx, createProjectInput{
		WorkspaceID: input.WorkspaceID,
		Visualizer:  input.Visualizer,
		Name:        input.Name,
		Description: input.Description,
		CoreSupport: input.CoreSupport,
		Visibility:  input.Visibility,
	}, operator)
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
		if _, err := i.checkAlias(ctx, prj.ID(), *p.Alias); err != nil {
			graphql.AddError(ctx, err)
		} else {
			prj.UpdateAlias(*p.Alias)
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

	if p.Visibility != nil {
		if err := prj.UpdateVisibility(*p.Visibility); err != nil {
			return nil, err
		}
	}

	if len(graphql.GetErrors(ctx)) > 0 {
		return prj, nil
	}

	currentTime := time.Now().UTC()
	prj.SetUpdatedAt(currentTime)

	if err := i.projectRepo.Save(ctx, prj); err != nil {
		return nil, err
	}

	tx.Commit()
	return prj, nil
}

// NOTE: This function is currently incomplete.
// It should receive the caller's project ID as an argument,
// because if the calling project checks its own alias value,
// this method may incorrectly return an error (as if the alias is already used).
// However, since this behavior has existed for some time,
// we'll leave it as-is until all related refactoring is completed.
func (i *Project) CheckAlias(ctx context.Context, alias string) (bool, error) {
	return i.checkAlias(ctx, id.NewProjectID(), alias)
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
		if _, err := i.checkAlias(ctx, prj.ID(), *params.Alias); err != nil {
			graphql.AddError(ctx, err)
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
		go func() {
			var err error

			defer func() {
				_ = w.CloseWithError(err)
			}()

			err = builder.New(
				repo.PropertyLoaderFrom(i.propertyRepo),
				repo.NLSLayerLoaderFrom(i.nlsLayerRepo),
				false,
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
			Scene:          i.sceneRepo,
			SceneLock:      i.sceneLockRepo,
			Property:       i.propertyRepo,
			NLSLayer:       i.nlsLayerRepo,
			Plugin:         i.pluginRepo,
			Storytelling:   i.storytellingRepo,
			Style:          i.layerStyles,
			PropertySchema: i.propertySchemaRepo,
			File:           i.file,
		},
		File:    i.file,
		Project: i.projectRepo,
		Asset:   i.assetRepo,
	}
	if err := deleter.Delete(ctx, prj, true, operator); err != nil {
		return err
	}

	tx.Commit()
	return nil
}

func (i *Project) ExportProjectData(ctx context.Context, projectID id.ProjectID, zipWriter *zip.Writer, operator *usecase.Operator) (*project.Project, error) {

	prj, err := i.projectRepo.FindByID(ctx, projectID)
	if err != nil {
		return nil, errors.New("project " + err.Error())
	}
	if prj.IsDeleted() {
		fmt.Printf("Error Deleted project: %v\n", prj.ID())
		return nil, errors.New("This project is deleted")
	}

	return prj, nil
}

func SearchAssetURL(ctx context.Context, data any, assetRepo repo.Asset, file gateway.File, zipWriter *zip.Writer, assetNames map[string]string) error {
	switch v := data.(type) {
	case map[string]any:
		for _, value := range v {
			if err := SearchAssetURL(ctx, value, assetRepo, file, zipWriter, assetNames); err != nil {
				return err
			}
		}
	case []any:
		for _, item := range v {
			if err := SearchAssetURL(ctx, item, assetRepo, file, zipWriter, assetNames); err != nil {
				return err
			}
		}
	case string:
		cleanedStr := strings.Trim(v, "'")
		if strings.HasPrefix(cleanedStr, adapter.CurrentHost(ctx)) {
			if err := AddZipAsset(ctx, assetRepo, file, zipWriter, cleanedStr, assetNames); err != nil {
				return err
			}
		}
	default:

	}
	return nil
}

// If the given path is the URL of an Asset, it will be added to the ZIP.
func AddZipAsset(ctx context.Context, assetRepo repo.Asset, file gateway.File, zipWriter *zip.Writer, urlString string, assetNames map[string]string) error {

	if !IsCurrentHostAssets(ctx, urlString) {
		return nil
	}

	parts := strings.Split(urlString, "/")
	beforeUniversaName := parts[len(parts)-1]
	stream, err := file.ReadAsset(ctx, beforeUniversaName)
	if err != nil {
		return nil // skip if not available
	}
	defer func() {
		if cerr := stream.Close(); cerr != nil {
			fmt.Printf("Error closing file: %v\n", cerr)
		}
	}()

	zipEntryPath := fmt.Sprintf("assets/%s", beforeUniversaName)
	zipEntry, err := zipWriter.Create(zipEntryPath)
	if err != nil {
		return err
	}
	_, err = io.Copy(zipEntry, stream)
	if err != nil {
		_ = stream.Close()
		return err
	}
	if a, err := assetRepo.FindByURL(ctx, urlString); a != nil && err == nil {
		if parsedURL, err := url.Parse(urlString); err == nil {
			assetNames[path.Base(parsedURL.Path)] = a.Name()
		}
	}

	return nil
}

func (i *Project) UploadExportProjectZip(ctx context.Context, zipWriter *zip.Writer, zipFile afero.File, data map[string]interface{}, prj *project.Project) error {

	assetNames := make(map[string]string)
	if project, ok := data["project"].(map[string]interface{}); ok {
		if imageUrl, ok := project["imageUrl"].(map[string]interface{}); ok {
			if path, ok := imageUrl["Path"].(string); ok {
				err := AddZipAsset(ctx, i.assetRepo, i.file, zipWriter, adapter.CurrentHost(ctx)+path, assetNames)
				if err != nil {
					fmt.Printf("not notfound asset file: %v\n", err)
				}
			}
		}
	}
	err := SearchAssetURL(ctx, data, i.assetRepo, i.file, zipWriter, assetNames)
	if err != nil {
		fmt.Printf("not notfound asset file: %v\n", err)
	}
	data["assets"] = assetNames

	fileWriter, err := zipWriter.Create("project.json")
	if err != nil {
		return err
	}
	jsonData, err := json.MarshalIndent(data, "", "  ")
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
	// 500MB
	if err := file.FileSizeCheck(500, zipFile); err != nil {
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

func (i *Project) ImportProjectData(ctx context.Context, workspace string, data *[]byte, op *usecase.Operator) (*project.Project, error) {

	var d map[string]any
	if err := json.Unmarshal(*data, &d); err != nil {
		return nil, err
	}

	projectData, ok := d["project"].(map[string]any)
	if !ok {
		return nil, errors.New("project parse error")
	}

	var input = jsonmodel.ToProjectExportFromJSON(projectData)

	alias := ""
	archived := false
	coreSupport := true

	workspaceId, err := accountdomain.WorkspaceIDFrom(workspace)
	if err != nil {
		return nil, err
	}

	result, err := i.createProject(ctx, createProjectInput{
		WorkspaceID: workspaceId,
		Visualizer:  visualizer.Visualizer(input.Visualizer),
		Name:        &input.Name,
		Description: &input.Description,
		ImageURL:    input.ImageURL,
		Alias:       &alias,
		Archived:    &archived,
		CoreSupport: &coreSupport,
	}, op)
	if err != nil {
		return nil, err
	}

	return result, nil
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

func (i *Project) checkAlias(ctx context.Context, updatedProjectID id.ProjectID, newAlias string) (bool, error) {
	if !project.CheckAliasPattern(newAlias) {
		return false, project.ErrInvalidProjectAlias.AddTemplateData("aliasName", newAlias)
	}

	prj, err := i.projectRepo.FindByPublicName(ctx, newAlias)

	if prj == nil && err == nil || err != nil && errors.Is(err, rerror.ErrNotFound) {
		return true, nil
	}

	if prj.ID() == updatedProjectID {
		return true, nil
	}

	return false, interfaces.ErrProjectAliasAlreadyUsed
}

type createProjectInput struct {
	WorkspaceID accountdomain.WorkspaceID
	Visualizer  visualizer.Visualizer
	Name        *string
	Description *string
	ImageURL    *url.URL
	Alias       *string
	Archived    *bool
	CoreSupport *bool
	Visibility  *string
}

func (i *Project) createProject(ctx context.Context, input createProjectInput, operator *usecase.Operator) (_ *project.Project, err error) {
	if err := i.CanWriteWorkspace(input.WorkspaceID, operator); err != nil {
		return nil, err
	}

	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	txCtx := tx.Context()
	defer func() {
		if err2 := tx.End(txCtx); err == nil && err2 != nil {
			err = err2
		}
	}()

	ws, err := i.workspaceRepo.FindByID(txCtx, input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if policyID := operator.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(txCtx, *policyID)
		if err != nil {
			return nil, err
		}

		projectCount, err := i.projectRepo.CountByWorkspace(txCtx, ws.ID())
		if err != nil {
			return nil, err
		}

		if err := p.EnforceProjectCount(projectCount + 1); err != nil {
			return nil, err
		}
	}

	prjID := id.NewProjectID()
	prj := project.New().
		ID(prjID).
		Workspace(input.WorkspaceID).
		Visualizer(input.Visualizer)

	if input.Alias != nil {
		prj = prj.Alias(*input.Alias)
	} else {
		prj = prj.Alias(prjID.String())
	}

	if input.Archived != nil {
		prj = prj.IsArchived(*input.Archived)
	}

	if input.CoreSupport != nil {
		prj = prj.CoreSupport(*input.CoreSupport)
	}

	if input.Description != nil {
		prj = prj.Description(*input.Description)
	}

	if input.ImageURL != nil {
		prj = prj.ImageURL(input.ImageURL)
	}

	if input.Name != nil {
		prj = prj.Name(*input.Name)
	}

	if input.Visibility != nil {
		prj = prj.Visibility(*input.Visibility)
	} else {
		prj = prj.Visibility("private")
	}

	proj, err := prj.Build()
	if err != nil {
		return nil, err
	}

	err = i.projectRepo.Save(txCtx, proj)
	if err != nil {
		return nil, err
	}

	tx.Commit()

	return proj, nil
}
