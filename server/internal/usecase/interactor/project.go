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
	"slices"
	"strings"
	"time"

	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth/server/internal/adapter"
	jsonmodel "github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/usecasex"
	"github.com/spf13/afero"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type Project struct {
	common
	commonSceneLock
	transaction         usecasex.Transaction
	userRepo            accountrepo.User
	workspaceRepo       accountrepo.Workspace
	assetRepo           repo.Asset
	projectRepo         repo.Project
	projectMetadataRepo repo.ProjectMetadata
	storytellingRepo    repo.Storytelling
	sceneRepo           repo.Scene
	propertyRepo        repo.Property
	propertySchemaRepo  repo.PropertySchema
	policyRepo          repo.Policy
	nlsLayerRepo        repo.NLSLayer
	layerStyles         repo.Style
	pluginRepo          repo.Plugin
	file                gateway.File
	policyChecker       gateway.PolicyChecker
}

func NewProject(r *repo.Container, gr *gateway.Container) interfaces.Project {
	return &Project{
		commonSceneLock:     commonSceneLock{sceneLockRepo: r.SceneLock},
		userRepo:            r.User,
		workspaceRepo:       r.Workspace,
		assetRepo:           r.Asset,
		projectRepo:         r.Project,
		projectMetadataRepo: r.ProjectMetadata,
		storytellingRepo:    r.Storytelling,
		sceneRepo:           r.Scene,
		propertyRepo:        r.Property,
		transaction:         r.Transaction,
		policyRepo:          r.Policy,
		nlsLayerRepo:        r.NLSLayer,
		layerStyles:         r.Style,
		pluginRepo:          r.Plugin,
		propertySchemaRepo:  r.PropertySchema,
		file:                gr.File,
		policyChecker:       gr.PolicyChecker,
	}
}

// GetProject invoked by loader
func (i *Project) Fetch(ctx context.Context, ids []id.ProjectID, op *usecase.Operator) ([]*project.Project, error) {

	projects, err := i.projectRepo.FindByIDs(ctx, ids)
	if err != nil {
		return []*project.Project{}, err
	}

	projects, err = i.addMetadatas(ctx, projects, false, op)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

// GetProjects invoked by loader
func (i *Project) FindByWorkspace(ctx context.Context, wid accountsID.WorkspaceID, keyword *string, sort *project.SortType, p *usecasex.Pagination, op *usecase.Operator) ([]*project.Project, *usecasex.PageInfo, error) {

	projects, pInfo, err := i.projectRepo.FindByWorkspace(ctx, wid, repo.ProjectFilter{
		Pagination: p,
		Sort:       sort,
		Keyword:    keyword,
	})
	if err != nil {
		return projects, pInfo, err
	}

	projects, err = i.addMetadatas(ctx, projects, true, op)
	if err != nil {
		return projects, pInfo, err
	}

	return projects, pInfo, nil
}

func (i *Project) addMetadatas(ctx context.Context, projects []*project.Project, exclude bool, op *usecase.Operator) ([]*project.Project, error) {

	ids := make(id.ProjectIDList, 0, len(projects))
	for _, p := range projects {
		if p != nil {
			ids = append(ids, p.ID())
		}
	}

	if len(ids) == 0 {
		return []*project.Project{}, nil
	}

	metadatas, err := i.projectMetadataRepo.FindByProjectIDList(ctx, ids)
	if err != nil {
		return nil, err
	}

	// projects with a FAILED status will be deleted and excluded.
	excludedProjects := make([]*project.Project, 0)
	for _, p := range projects {
		metadata := matchMetadata(p.ID(), metadatas)
		if metadata == nil {
			continue
		}
		if *metadata.ImportStatus() == project.ProjectImportStatusFailed {
			if err := i.Delete(ctx, p.ID(), op); err != nil {
				return nil, err
			}
			if exclude {
				continue
			}
		}
		p.SetMetadata(metadata)
		excludedProjects = append(excludedProjects, p)
	}

	return excludedProjects, nil
}

func matchMetadata(pid id.ProjectID, metadatas []*project.ProjectMetadata) *project.ProjectMetadata {
	for _, metadata := range metadatas {
		if pid == metadata.Project() {
			return metadata
		}
	}
	return nil
}

func (i *Project) FindStarredByWorkspace(ctx context.Context, id accountsID.WorkspaceID, operator *usecase.Operator) ([]*project.Project, error) {
	return i.projectRepo.FindStarredByWorkspace(ctx, id)
}

func (i *Project) FindDeletedByWorkspace(ctx context.Context, id accountsID.WorkspaceID, operator *usecase.Operator) ([]*project.Project, error) {
	return i.projectRepo.FindDeletedByWorkspace(ctx, id)
}

func (i *Project) FindActiveById(ctx context.Context, pid id.ProjectID, operator *usecase.Operator) (*project.Project, error) {
	pj, err := i.projectRepo.FindActiveById(ctx, pid)
	if err != nil {
		return nil, err
	}

	if operator == nil && pj.Visibility() == string(project.VisibilityPrivate) {
		return nil, errors.New("project is private")
	}

	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, pj.ID())
	if err != nil {
		return nil, err
	}

	pj.SetMetadata(meta)
	return pj, nil
}

func (i *Project) FindActiveByAlias(ctx context.Context, alias string, operator *usecase.Operator) (*project.Project, error) {
	pj, err := i.projectRepo.FindActiveByAlias(ctx, alias)
	if err != nil {
		return nil, err
	}

	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, pj.ID())
	if err != nil {
		return nil, err
	}

	pj.SetMetadata(meta)
	return pj, nil
}

func (i *Project) FindByProjectAlias(ctx context.Context, alias string, operator *usecase.Operator) (*project.Project, error) {
	pj, err := i.projectRepo.FindByProjectAlias(ctx, alias)
	if err != nil {
		return nil, err
	}

	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, pj.ID())
	if err != nil {
		return nil, err
	}

	pj.SetMetadata(meta)
	return pj, nil
}

func (i *Project) MemberWorkspaces(ctx context.Context, uId accountsID.UserID) (wsList workspace.List, ownedWs []string, memberWs []string) {
	wsList, err := i.workspaceRepo.FindByUser(ctx, uId)
	if err != nil {
		return nil, nil, nil
	}
	ownedWs = []string{}
	memberWs = []string{}
	for _, ws := range wsList {
		for userId, member := range ws.Members().Users() {
			if uId.String() == userId.String() {
				if member.Role == workspace.RoleOwner {
					ownedWs = append(ownedWs, ws.ID().String())
				}
				if member.Role == workspace.RoleWriter || member.Role == workspace.RoleReader || member.Role == workspace.RoleMaintainer {
					memberWs = append(memberWs, ws.ID().String())

				}
			}
		}
	}
	return
}

func toIdStrings(wsList accountsID.WorkspaceIDList) []string {
	var ret []string
	for _, wsID := range wsList {
		ret = append(ret, wsID.String())
	}
	return ret
}

func (i *Project) FindVisibilityByUser(
	ctx context.Context,
	u *user.User,
	authenticated bool,
	operator *usecase.Operator,
	keyword *string,
	sort *project.SortType,
	pagination *usecasex.Pagination,
	param *interfaces.ProjectListParam,
) ([]*project.Project, *usecasex.PageInfo, error) {

	pFilter := repo.ProjectFilter{
		Keyword:    keyword,
		Sort:       sort,
		Pagination: pagination,
	}

	if param != nil {
		pFilter.Limit = param.Limit
		pFilter.Offset = param.Offset
	}

	wsList, ownedWs, memberWs := i.MemberWorkspaces(ctx, u.ID())

	targetWsList := make(accountsID.WorkspaceIDList, 0, len(wsList))
	for _, ws := range wsList {
		wsId, err := workspace.IDFrom(ws.ID().String())
		if err != nil {
			return nil, nil, err
		}
		targetWsList = append(targetWsList, wsId)
	}

	prjList, pInfo, err := i.projectRepo.FindByWorkspaces(ctx, authenticated, pFilter, ownedWs, memberWs, toIdStrings(targetWsList))
	if err != nil {
		return nil, nil, err
	}

	result, err := i.getMetadata(ctx, prjList)
	if err != nil {
		return nil, nil, err
	}

	return result, pInfo, err
}

func (i *Project) FindVisibilityByWorkspace(
	ctx context.Context,
	aid accountsID.WorkspaceID,
	authenticated bool,
	operator *usecase.Operator,
	keyword *string,
	sort *project.SortType,
	pagination *usecasex.Pagination,
	param *interfaces.ProjectListParam,
) ([]*project.Project, *usecasex.PageInfo, error) {

	pFilter := repo.ProjectFilter{
		Keyword:    keyword,
		Sort:       sort,
		Pagination: pagination,
	}

	if param != nil {
		pFilter.Limit = param.Limit
		pFilter.Offset = param.Offset
	}

	ownedWs := []string{}
	memberWs := []string{}

	if operator != nil && operator.AcOperator != nil {
		_, ownedWs, memberWs = i.MemberWorkspaces(ctx, *operator.AcOperator.User)
	}

	targetWsList := accountsID.WorkspaceIDList{aid}

	pList, pInfo, err := i.projectRepo.FindByWorkspaces(ctx, authenticated, pFilter, ownedWs, memberWs, toIdStrings(targetWsList))
	if err != nil {
		return nil, nil, err
	}

	result, err := i.getMetadata(ctx, pList)
	if err != nil {
		return nil, nil, err
	}

	return result, pInfo, err
}

func (i *Project) FindAll(ctx context.Context, keyword *string, sort *project.SortType, pagination *usecasex.Pagination, param *interfaces.ProjectListParam, topics *[]string, visibility *string) ([]*project.Project, *usecasex.PageInfo, error) {
	topicsFilter := []string{}
	if topics != nil {
		topicsFilter = *topics
	}

	pFilter := repo.ProjectFilter{
		Keyword:    keyword,
		Sort:       sort,
		Pagination: pagination,
		Topics:     topicsFilter,
		Visibility: visibility,
	}

	if param != nil {
		pFilter.Limit = param.Limit
		pFilter.Offset = param.Offset
	}

	pList, pInfo, err := i.projectRepo.FindAll(ctx, pFilter)
	if err != nil {
		return nil, nil, err
	}

	result, err := i.getMetadata(ctx, pList)
	if err != nil {
		return nil, nil, err
	}

	return result, pInfo, nil
}

func (i *Project) getMetadata(ctx context.Context, pList []*project.Project) ([]*project.Project, error) {
	ids := make(id.ProjectIDList, 0, len(pList))
	for _, p := range pList {
		ids = append(ids, p.ID())
	}

	metadatas, err := i.projectMetadataRepo.FindByProjectIDList(ctx, ids)
	if err != nil {
		return nil, err
	}

	for _, p := range pList {
		for _, metadata := range metadatas {
			if p.ID() == metadata.Project() {
				p.SetMetadata(metadata)
				break
			}
		}
	}

	return pList, err
}

func (i *Project) Create(ctx context.Context, input interfaces.CreateProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	visibility := project.VisibilityPublic

	if i.policyChecker != nil {
		operationAllowed, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralOperationAllowedCheckRequest(input.WorkspaceID))
		if err != nil {
			return nil, err
		}
		if !operationAllowed.Allowed {
			return nil, visualizer.ErrorWithCallerLogging(ctx, "operation is disabled by overused seat", errors.New("operation is disabled by overused seat"))
		}

		errPrivate := i.checkGeneralPolicy(ctx, input.WorkspaceID, project.VisibilityPrivate)
		if errPrivate != nil {
			visibility = project.VisibilityPublic
		} else {
			if input.Visibility != nil {
				visibility = project.Visibility(*input.Visibility)
			}
		}
	}

	return i.createProject(ctx, createProjectInput{
		WorkspaceID:  input.WorkspaceID,
		Visualizer:   input.Visualizer,
		Name:         input.Name,
		Description:  input.Description,
		CoreSupport:  input.CoreSupport,
		IsDeleted:    input.IsDeleted,
		Visibility:   &visibility,
		ImportStatus: input.ImportStatus,
		ProjectAlias: input.ProjectAlias,
		Readme:       input.Readme,
		License:      input.License,
		Topics:       input.Topics,
	}, operator)
}

func (i *Project) Update(ctx context.Context, p interfaces.UpdateProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	log.Debugfc(ctx, "Update project: %v", p)
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "failed to begin transaction", err)
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	prj, err := i.projectRepo.FindByID(ctx, p.ID)
	if err != nil {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "failed to find project", err)
	}

	operationAllowed, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralOperationAllowedCheckRequest(prj.Workspace()))

	if err != nil {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "failed to check policy", err)
	}
	if !operationAllowed.Allowed {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "operation is disabled by over used seat", errors.New("operation is disabled by over used seat"))
	}

	if err := i.CanWriteWorkspace(prj.Workspace(), operator); err != nil {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "failed to check policy", err)
	}

	if p.Name != nil {
		prj.UpdateName(*p.Name)

	}

	if p.Description != nil {
		prj.UpdateDescription(*p.Description)
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

	if p.Visibility != nil {

		visibility := project.Visibility(*p.Visibility)

		if i.policyChecker != nil {

			// If the visibility is going to change
			if !strings.EqualFold(*p.Visibility, prj.Visibility()) {
				if err = i.checkGeneralPolicy(ctx, prj.Workspace(), visibility); err != nil {
					return nil, err
				}
			}

		}

		if err := prj.UpdateVisibility(*p.Visibility); err != nil {
			return nil, err
		}

	}

	if p.ProjectAlias != nil {

		_, err = i.CheckProjectAlias(ctx, *p.ProjectAlias, prj.Workspace(), prj.ID().Ref())
		if err != nil {
			return nil, err
		}

		prj.UpdateProjectAlias(*p.ProjectAlias)
	}

	if !adapter.IsInternal(ctx) {
		if errs := graphql.GetErrors(ctx); len(errs) > 0 {
			return prj, nil
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

func (i *Project) UpdateVisibility(ctx context.Context, pid id.ProjectID, visibility string, operator *usecase.Operator) (*project.Project, error) {

	prj, err := i.projectRepo.FindByID(ctx, pid)
	if err != nil {
		return nil, err
	}
	operationAllowed, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralOperationAllowedCheckRequest(prj.Workspace()))
	if err != nil {
		return nil, err
	}
	if !operationAllowed.Allowed {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "operation is disabled by over used seat", errors.New("operation is disabled by over used seat"))
	}

	if err := i.CanWriteWorkspace(prj.Workspace(), operator); err != nil {
		return nil, err
	}

	if len(operator.AcOperator.OwningWorkspaces) == 0 || operator.AcOperator.OwningWorkspaces[0] != prj.Workspace() {
		return nil, errors.New("operation that only the owner is allowed to perform.")
	}

	if err := prj.UpdateVisibility(visibility); err != nil {
		return nil, err
	}
	if i.policyChecker != nil {
		if err = i.checkGeneralPolicy(ctx, prj.Workspace(), project.Visibility(visibility)); err != nil {
			return nil, err
		}
	}

	currentTime := time.Now().UTC()
	prj.SetUpdatedAt(currentTime)

	if err := i.projectRepo.Save(ctx, prj); err != nil {
		return nil, err
	}
	return prj, nil

}

func (i *Project) UpdateImportStatus(ctx context.Context, pid id.ProjectID, importStatus project.ProjectImportStatus, importResultLog *map[string]any, operator *usecase.Operator) (*project.ProjectMetadata, error) {

	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, pid)
	if err != nil {
		return nil, err
	}

	if meta != nil {
		currentTime := time.Now().UTC()
		meta.SetImportStatus(&importStatus)
		meta.SetImportResultLog(importResultLog)
		meta.SetUpdatedAt(&currentTime)
	}

	if err := i.projectMetadataRepo.Save(ctx, meta); err != nil {
		return nil, err
	}
	return meta, nil

}

func (i *Project) dedicatedID(ctx context.Context, pid *id.ProjectID) (*project.Project, string, string, error) {

	prj, err := i.projectRepo.FindByID(ctx, *pid)
	if err != nil {
		return nil, "", "", err
	}

	sce, err := i.sceneRepo.FindByProject(ctx, *pid)
	if err != nil {
		return nil, "", "", err
	}

	dedicatedID1 := alias.ReservedReearthPrefixScene + sce.ID().String()
	dedicatedID2 := sce.ID().String()

	return prj, dedicatedID1, dedicatedID2, err
}

func (i *Project) CheckProjectAlias(ctx context.Context, newAlias string, wsid accountsID.WorkspaceID, pid *id.ProjectID) (bool, error) {

	if pid != nil {
		if alias.ReservedReearthPrefixProject+pid.String() == newAlias || pid.String() == newAlias {
			return true, nil
		}

		prj, err := i.projectRepo.FindByID(ctx, *pid)
		if err != nil {
			return false, err
		}

		if prj.ProjectAlias() == newAlias {
			return true, nil
		}
	}

	ok := util.IsSafePathName(newAlias)
	if !ok {
		return false, alias.ErrProjectInvalidProjectAlias.AddTemplateData("aliasName", newAlias)
	}

	err := i.projectRepo.CheckProjectAliasUnique(ctx, wsid, newAlias, pid)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (i *Project) CheckSceneAlias(ctx context.Context, newAlias string, pid *id.ProjectID) (bool, error) {
	aliasName := strings.ToLower(newAlias)
	if pid == nil {

		if err := alias.CheckAliasPatternScene(aliasName); err != nil {
			return false, err
		}
		if err := i.projectRepo.CheckSceneAliasUnique(ctx, aliasName); err != nil {
			return false, err
		}
		if err := i.storytellingRepo.CheckStorytellingAlias(ctx, aliasName); err != nil {
			return false, err
		}

		if strings.HasPrefix(aliasName, alias.ReservedReearthPrefixScene) || strings.HasPrefix(aliasName, alias.ReservedReearthPrefixStory) {
			return false, alias.ErrInvalidProjectInvalidPrefixAlias.AddTemplateData("aliasName", aliasName)
		}

	} else {

		prj, dedicatedID1, dedicatedID2, err := i.dedicatedID(ctx, pid)
		if err != nil {
			return false, err
		}

		if aliasName == dedicatedID1 || aliasName == dedicatedID2 || aliasName == prj.Alias() {
			// allow self sceneId or current alias
			return true, nil
		}

		// story prefix check
		if _, found := strings.CutPrefix(aliasName, alias.ReservedReearthPrefixStory); found {
			// error 's-' prefix
			return false, alias.ErrInvalidProjectInvalidPrefixAlias.AddTemplateData("aliasName", aliasName)
		}

		// scene prefix check
		if _, found := strings.CutPrefix(aliasName, alias.ReservedReearthPrefixScene); found {
			// error 'c-' prefix
			return false, alias.ErrInvalidProjectInvalidPrefixAlias.AddTemplateData("aliasName", aliasName)
		}

		if err := alias.CheckAliasPatternScene(aliasName); err != nil {
			return false, err
		}
		if err := i.projectRepo.CheckSceneAliasUnique(ctx, aliasName); err != nil {
			return false, err
		}
		if err = i.storytellingRepo.CheckStorytellingAlias(ctx, aliasName); err != nil {
			return false, err
		}

	}

	return true, nil
}

func (i *Project) Publish(ctx context.Context, params interfaces.PublishProjectParam, op *usecase.Operator) (_ *project.Project, err error) {
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

	prj, dedicatedID1, dedicatedID2, err := i.dedicatedID(ctx, &params.ID)
	if err != nil {
		return nil, err
	}

	if err := i.CanWriteWorkspace(prj.Workspace(), op); err != nil {
		return nil, err
	}

	operationAllowed, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralOperationAllowedCheckRequest(prj.Workspace()))
	if err != nil {
		return nil, err
	}
	if !operationAllowed.Allowed {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "operation is disabled by over used seat", errors.New("operation is disabled by over used seat"))
	}

	sc, err := i.sceneRepo.FindByProject(ctx, prj.ID())
	if err != nil {
		return nil, err
	}

	prevAlias := prj.Alias()

	// if ProjectID is not specified
	if params.Alias == nil || *params.Alias == "" {
		// if you don't have an alias, set it to default alias
		if prj.Alias() == "" {
			prj.UpdateAlias(dedicatedID1)
		}
		// if anything is set, do nothing
	} else {

		newAlias := strings.ToLower(*params.Alias)

		if newAlias == dedicatedID1 || newAlias == dedicatedID2 || prevAlias == newAlias {

			// allow self sceneId or current alias

		} else {

			// story prefix check
			if _, found := strings.CutPrefix(newAlias, alias.ReservedReearthPrefixStory); found {
				// error 's-' prefix
				return nil, alias.ErrInvalidProjectInvalidPrefixAlias.AddTemplateData("aliasName", newAlias)
			}

			// scene prefix check
			if _, found := strings.CutPrefix(newAlias, alias.ReservedReearthPrefixScene); found {
				// error 'c-' prefix
				return nil, alias.ErrInvalidProjectInvalidPrefixAlias.AddTemplateData("aliasName", newAlias)
			}

			if err := alias.CheckAliasPatternScene(newAlias); err != nil {
				return nil, err
			}
			if err := i.projectRepo.CheckSceneAliasUnique(ctx, newAlias); err != nil {
				return nil, err
			}
			if err = i.storytellingRepo.CheckStorytellingAlias(ctx, newAlias); err != nil {
				return nil, err
			}
		}

		prj.UpdateAlias(newAlias)
	}

	prj.UpdatePublishmentStatus(params.Status)

	// publish
	if prj.PublishmentStatus() != project.PublishmentStatusPrivate {
		if err := i.uploadPublishScene(ctx, prj, sc, op); err != nil {
			return nil, err
		}
		prj.SetPublishedAt(time.Now())
	}

	// unpublish
	if prj.PublishmentStatus() == project.PublishmentStatusPrivate || prevAlias != prj.Alias() {
		// always delete previous aliase
		if err = i.file.RemoveBuiltScene(ctx, prevAlias); err != nil {
			return prj, err
		}
	}

	if err := i.projectRepo.Save(ctx, prj); err != nil {
		return nil, err
	}

	sc.UpdateAlias(prj.Alias())

	if err := i.sceneRepo.Save(ctx, sc); err != nil {
		return nil, err
	}

	tx.Commit()
	return prj, nil
}

func (i *Project) checkPublishPolicy(ctx context.Context, prj *project.Project, op *usecase.Operator) error {

	ws, err := i.workspaceRepo.FindByID(ctx, prj.Workspace())
	if err != nil {
		return err
	}

	if policyID := op.Policy(ws.Policy()); policyID != nil {

		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return err
		}

		projectCount, err := i.projectRepo.CountPublicByWorkspace(ctx, ws.ID())
		if err != nil {
			return err
		}

		// newrly published
		if prj.PublishmentStatus() != project.PublishmentStatusPrivate {
			projectCount += 1
		}

		if err := p.EnforcePublishedProjectCount(projectCount); err != nil {
			return err
		}
	}

	return nil
}

func (i *Project) uploadPublishScene(ctx context.Context, p *project.Project, s *scene.Scene, op *usecase.Operator) error {

	// enforce policy
	if err := i.checkPublishPolicy(ctx, p, op); err != nil {
		return err
	}

	if err := i.CheckSceneLock(ctx, s.ID()); err != nil {
		return err
	}

	if err := i.UpdateSceneLock(ctx, s.ID(), scene.LockModeFree, scene.LockModePublishing); err != nil {
		return err
	}

	defer i.ReleaseSceneLock(ctx, s.ID())

	nlsLayers, err := i.nlsLayerRepo.FindByScene(ctx, s.ID())
	if err != nil {
		return err
	}

	layerStyles, err := i.layerStyles.FindByScene(ctx, s.ID())
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
			Build(ctx, w, time.Now(), p.CoreSupport(), p.EnableGA(), p.TrackingID())
	}()

	// Save
	if err := i.file.UploadBuiltScene(ctx, r, p.Alias()); err != nil {
		return err
	}

	return nil
}

func (i *Project) Delete(ctx context.Context, projectID id.ProjectID, operator *usecase.Operator) (err error) {
	log.Warnf("Deleting a project %s", projectID.String())

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

	operationAllowed, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralOperationAllowedCheckRequest(prj.Workspace()))
	if err != nil {
		return err
	}
	if !operationAllowed.Allowed {
		return visualizer.ErrorWithCallerLogging(ctx, "operation is disabled by over used seat", errors.New("operation is disabled by over used seat"))
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
		File:            i.file,
		Project:         i.projectRepo,
		ProjectMetadata: i.projectMetadataRepo,
		Asset:           i.assetRepo,
	}
	if err := deleter.Delete(ctx, prj, true, operator); err != nil {
		return err
	}

	tx.Commit()
	return nil
}

func (i *Project) ExportProjectData(ctx context.Context, pid id.ProjectID, zipWriter *zip.Writer, operator *usecase.Operator) (*project.Project, error) {

	prj, err := i.projectRepo.FindByID(ctx, pid)
	if err != nil {
		return nil, errors.New("project " + err.Error())
	}

	operationAllowed, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralOperationAllowedCheckRequest(prj.Workspace()))
	if err != nil {
		return nil, err
	}
	if !operationAllowed.Allowed {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "operation is disabled by over used seat", errors.New("operation is disabled by over used seat"))
	}

	if prj.IsDeleted() {
		fmt.Printf("Error Deleted project: %v\n", prj.ID())
		return nil, errors.New("This project is deleted")
	}

	// In the case of private, only the owner or members are allowed.
	if prj.Visibility() == string(project.VisibilityPrivate) {

		if operator == nil || operator.AcOperator == nil {
			return nil, errors.New("Unauthorized project : " + prj.Name())
		}

		_, ownedWs, memberWs := i.MemberWorkspaces(ctx, *operator.AcOperator.User)
		targetWs := prj.Workspace().String()

		if !slices.Contains(ownedWs, targetWs) {
			if !slices.Contains(memberWs, targetWs) {
				return nil, errors.New("Unauthorized project : " + prj.Name())
			}
		}

	}

	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, pid)
	if err != nil {
		return nil, errors.New("project metadate " + err.Error())
	}

	prj.SetMetadata(meta)

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

func (i *Project) SaveExportProjectZip(ctx context.Context, zipWriter *zip.Writer, zipFile afero.File, data map[string]interface{}, prj *project.Project) error {

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

func (i *Project) ImportProjectData(ctx context.Context, workspace string, projectId *string, data *[]byte, op *usecase.Operator) (*project.Project, error) {
	log.Infof("[ImportProjectData] workspace: %s project: %s", workspace, *projectId)

	var d map[string]any
	if err := json.Unmarshal(*data, &d); err != nil {
		return nil, err
	}

	projectData, ok := d["project"].(map[string]any)
	if !ok {
		log.Errorf("[Import Error] project parse error")
		return nil, errors.New("project parse error")
	}

	var input = jsonmodel.ToProjectExportDataFromJSON(projectData)

	alias := ""
	archived := false
	coreSupport := true

	workspaceId, err := accountsID.WorkspaceIDFrom(workspace)
	if err != nil {
		return nil, err
	}

	var readme *string
	if ret, ok := projectData["readme"].(string); ok {
		readme = &ret
	}
	var license *string
	if ret, ok := projectData["license"].(string); ok {
		license = &ret
	}
	topics := input.Topics

	visibility := project.VisibilityPublic
	if i.policyChecker != nil {
		errPrivate := i.checkGeneralPolicy(ctx, workspaceId, project.VisibilityPrivate)
		if errPrivate == nil {
			if ret, ok := projectData["visibility"].(string); ok {
				vis := project.Visibility(ret)
				visibility = vis
			}
		} else {
			visibility = project.VisibilityPublic
		}
	}

	result, err := i.createProject(ctx, createProjectInput{
		WorkspaceID:  workspaceId,
		ProjectID:    projectId,
		Visualizer:   visualizer.Visualizer(input.Visualizer),
		ImportStatus: project.ProjectImportStatusProcessing,
		Name:         &input.Name,
		Description:  &input.Description,
		ImageURL:     input.ImageURL,
		Alias:        &alias,
		Archived:     &archived,
		CoreSupport:  &coreSupport,
		Readme:       readme,
		License:      license,
		Topics:       topics,
		Visibility:   &visibility,
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

type createProjectInput struct {
	WorkspaceID     accountsID.WorkspaceID
	ProjectID       *string
	Visualizer      visualizer.Visualizer
	ImportStatus    project.ProjectImportStatus
	ImportResultLog *map[string]any
	Name            *string
	Description     *string
	ImageURL        *url.URL
	Alias           *string
	IsDeleted       *bool
	Archived        *bool
	CoreSupport     *bool
	Visibility      *project.Visibility
	ProjectAlias    *string

	// metadata
	Readme  *string
	License *string
	Topics  *[]string
}

var (
	ErrProjectCreationLimitExceeded error = rerror.NewE(i18n.T("project creation limit exceeded"))
)

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

	var prjID idx.ID[id.Project]
	if input.ProjectID != nil {
		prjID, err = id.ProjectIDFrom(*input.ProjectID)
		if err != nil {
			return nil, err
		}
	} else {
		prjID = id.NewProjectID()
	}

	metadata, err := i.projectMetadataRepo.FindByProjectID(ctx, prjID)
	if metadata == nil || err != nil { // if not found
		starCount := int64(0)
		starredBy := []string{}
		metadata, err = project.NewProjectMetadata().
			NewID().
			Workspace(input.WorkspaceID).
			Project(prjID).
			ImportStatus(&input.ImportStatus).
			ImportResultLog(input.ImportResultLog).
			StarCount(&starCount).
			StarredBy(&starredBy).
			Build()
		if err != nil {
			return nil, err
		}
	}

	if input.Readme != nil {
		metadata.SetReadme(input.Readme)
	}
	if input.License != nil {
		metadata.SetLicense(input.License)
	}
	if input.Topics != nil {
		metadata.SetTopics(input.Topics)
	}

	err = i.projectMetadataRepo.Save(ctx, metadata)
	if err != nil {
		return nil, err
	}

	prj := project.New().
		ID(prjID).
		Workspace(input.WorkspaceID).
		Visualizer(input.Visualizer).
		Metadata(metadata)

	newProjectAlias := alias.ReservedReearthPrefixProject + prjID.String()
	if input.ProjectAlias != nil {

		newProjectAlias = *input.ProjectAlias

		err = i.projectRepo.CheckProjectAliasUnique(ctx, input.WorkspaceID, newProjectAlias, nil)
		if err != nil {
			return nil, err
		}

		ok := util.IsSafePathName(newProjectAlias)
		if !ok {
			return nil, alias.ErrProjectInvalidProjectAlias.AddTemplateData("aliasName", newProjectAlias)
		}
	}

	prj.ProjectAlias(newProjectAlias)

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
	}

	if input.IsDeleted != nil {
		prj = prj.Deleted(*input.IsDeleted)
	} else {
		prj = prj.Deleted(false) // default is false
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

func (i *Project) checkGeneralPolicy(ctx context.Context, workspaceID accountsID.WorkspaceID, visibility project.Visibility) error {

	var checkType gateway.PolicyCheckType
	if visibility == project.VisibilityPublic {
		checkType = gateway.PolicyCheckGeneralPublicProjectCreation
	} else {
		checkType = gateway.PolicyCheckGeneralPrivateProjectCreation
	}

	policyReq := gateway.PolicyCheckRequest{
		WorkspaceID: workspaceID,
		CheckType:   checkType,
		Value:       1,
	}

	policyResp, err := i.policyChecker.CheckPolicy(ctx, policyReq)
	if err != nil {
		return err
	}
	if !policyResp.Allowed {
		return ErrProjectCreationLimitExceeded
	}
	return nil
}
