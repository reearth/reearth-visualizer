package internalapi

import (
	"archive/zip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/reearth/reearthx/log"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/adapter/internalapi/internalapimodel"
	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/visualizer"

	"github.com/reearth/reearthx/usecasex"
	"github.com/spf13/afero"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type server struct {
	pb.UnimplementedReEarthVisualizerServer
}

func NewServer() pb.ReEarthVisualizerServer {
	return &server{}
}

func (s server) GetProjectList(ctx context.Context, req *pb.GetProjectListRequest) (*pb.GetProjectListResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	sort := internalapimodel.ToProjectSortType(req.Sort)
	pagination := internalapimodel.ToProjectPagination(req.Pagination)

	var res []*project.Project
	var info *usecasex.PageInfo
	var param *interfaces.ProjectListParam
	if req.Pagination != nil {
		if req.Pagination.Offset != nil && req.Pagination.Limit != nil {
			param = &interfaces.ProjectListParam{
				Offset: req.Pagination.Offset,
				Limit:  req.Pagination.Limit,
			}
		}
	}

	var err error
	if req.WorkspaceId == nil {

		res, info, err = uc.Project.FindVisibilityByUser(
			ctx,
			adapter.User(ctx),
			req.Authenticated,
			op,
			req.Keyword,
			sort,
			pagination,
			param,
		)
		if err != nil {
			return nil, err
		}

	} else {

		wId, err := accountsID.WorkspaceIDFrom(*req.WorkspaceId)
		if err != nil {
			return nil, err
		}

		param := &interfaces.ProjectListParam{}
		if req.Pagination != nil {
			param.Limit = req.Pagination.Limit
			param.Offset = req.Pagination.Offset
		}

		res, info, err = uc.Project.FindVisibilityByWorkspace(
			ctx,
			wId,
			req.Authenticated,
			op,
			req.Keyword,
			sort,
			pagination,
			param,
		)
		if err != nil {
			return nil, err
		}

	}

	projects, err := s.getScenesAndStorytellings(ctx, res)
	if err != nil {
		return nil, err
	}

	return &pb.GetProjectListResponse{
		Projects: projects,
		PageInfo: internalapimodel.ToProjectPageInfo(info),
	}, nil

}

func (s server) GetAllProjects(ctx context.Context, req *pb.GetAllProjectsRequest) (*pb.GetAllProjectsResponse, error) {
	uc := adapter.Usecases(ctx)
	// Create a pagination object if one wasn't provided
	if req.Pagination == nil {
		defaultLimit := int32(100)
		req.Pagination = &pb.Pagination{
			First: &defaultLimit,
		}
	}

	maxLimit := int64(100)
	if req.Pagination.Limit != nil && *req.Pagination.Limit > maxLimit {
		req.Pagination.Limit = &maxLimit
	}

	// Parse the sort type from the request
	sort := internalapimodel.ToProjectSortType(req.Sort)

	var pagination *usecasex.Pagination
	var param *interfaces.ProjectListParam
	if req.Pagination != nil && req.Pagination.Offset != nil && req.Pagination.Limit != nil {
		param = &interfaces.ProjectListParam{
			Offset: req.Pagination.Offset,
			Limit:  req.Pagination.Limit,
		}
		pagination = nil
	} else {
		pagination = internalapimodel.ToProjectPagination(req.Pagination)
		if pagination == nil {
			defaultLimit := int32(100)
			req.Pagination = &pb.Pagination{
				First: &defaultLimit,
			}
			pagination = internalapimodel.ToProjectPagination(req.Pagination)
		}
	}

	// Convert ProjectVisibility to string
	var visibility *string
	if req.GetVisibility() == pb.ProjectVisibility_PROJECT_VISIBILITY_PRIVATE {
		v := "private"
		visibility = &v
		log.Infof("GetAllProjects: Filtering for private projects")
	} else {
		v := "public"
		visibility = &v
	}

	// Handle topics filter
	var topics *[]string
	if len(req.Topics) > 0 {
		topics = &req.Topics
	}

	res, info, err := uc.Project.FindAll(ctx, req.Keyword, sort, pagination, param, topics, visibility)

	if err != nil {
		log.Errorf("GetAllProjects: Database query failed: %v", err)
		return nil, err
	}

	projects := make([]*pb.Project, 0, len(res))
	for _, pj := range res {
		project := internalapimodel.ToInternalProject(ctx, pj, nil)
		if project != nil {
			projects = append(projects, project)
		}
	}

	return &pb.GetAllProjectsResponse{
		Projects: projects,
		PageInfo: internalapimodel.ToProjectPageInfo(info),
	}, nil
}

func (s server) GetProject(ctx context.Context, req *pb.GetProjectRequest) (*pb.GetProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	pj, err := uc.Project.FindActiveById(ctx, pId, op)
	if err != nil {
		return nil, err
	}

	prj, err := s.getSceneAndStorytelling(ctx, pj)
	if err != nil {
		return nil, err
	}

	return &pb.GetProjectResponse{
		Project: prj,
	}, nil
}

func (s server) GetProjectByAlias(ctx context.Context, req *pb.GetProjectByAliasRequest) (*pb.GetProjectByAliasResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pj, err := uc.Project.FindActiveByAlias(ctx, req.Alias, op)
	if err != nil {
		return nil, err
	}

	prj, err := s.getSceneAndStorytelling(ctx, pj)
	if err != nil {
		return nil, err
	}

	return &pb.GetProjectByAliasResponse{
		Project: prj,
	}, nil
}

func (s server) ValidateProjectAlias(ctx context.Context, req *pb.ValidateProjectAliasRequest) (*pb.ValidateProjectAliasResponse, error) {
	uc := adapter.Usecases(ctx)

	wsid, err := accountsID.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}

	available, err := uc.Project.CheckProjectAlias(ctx, req.Alias, wsid, id.ProjectIDFromRef(req.ProjectId))
	if err != nil {
		errorMessage := err.Error()
		return &pb.ValidateProjectAliasResponse{
			WorkspaceId:  req.WorkspaceId,
			Available:    available,
			ErrorMessage: &errorMessage,
		}, nil
	}

	return &pb.ValidateProjectAliasResponse{
		WorkspaceId: req.WorkspaceId,
		Available:   available,
	}, nil
}

func (s server) ValidateSceneAlias(ctx context.Context, req *pb.ValidateSceneAliasRequest) (*pb.ValidateSceneAliasResponse, error) {
	uc := adapter.Usecases(ctx)

	available, err := uc.Project.CheckSceneAlias(ctx, req.Alias, id.ProjectIDFromRef(req.ProjectId))
	if err != nil {
		errorMessage := err.Error()
		return &pb.ValidateSceneAliasResponse{
			ProjectId:    req.ProjectId,
			Available:    available,
			ErrorMessage: &errorMessage,
		}, nil
	}

	return &pb.ValidateSceneAliasResponse{
		ProjectId: req.ProjectId,
		Available: available,
	}, nil
}

func (s server) CreateProject(ctx context.Context, req *pb.CreateProjectRequest) (*pb.CreateProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountsID.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}

	var vis visualizer.Visualizer
	switch req.Visualizer {
	case pb.Visualizer_VISUALIZER_CESIUM:
		vis = visualizer.VisualizerCesium
	case pb.Visualizer_VISUALIZER_CESIUM_BETA:
		vis = visualizer.VisualizerCesiumBeta
	default:
		vis = visualizer.VisualizerCesium
	}

	pj, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  wId,
		Visualizer:   visualizer.Visualizer(strings.ToUpper(string(vis))),
		Name:         req.Name,
		Description:  req.Description,
		CoreSupport:  req.CoreSupport,
		Visibility:   req.Visibility,
		ProjectAlias: req.ProjectAlias,
		Readme:       req.Readme,
		License:      req.License,
		Topics: func() *[]string {
			if req.Topics == nil {
				return nil
			}
			return &req.Topics
		}(),
	},
		op,
	)
	if err != nil {
		return nil, err
	}

	sc, err := uc.Scene.Create(ctx, pj.ID(), true, op)
	if err != nil {
		return nil, err
	}

	pj.UpdateSceneID(sc.ID())
	if pj.Alias() == "" {
		pj.UpdateAlias(alias.ReservedReearthPrefixScene + sc.ID().String())
	}

	index := 0
	storyInput := interfaces.CreateStoryInput{
		SceneID: sc.ID(),
		Title:   "Default",
		Index:   &index,
	}
	st, err := uc.StoryTelling.Create(ctx, storyInput, op)
	if err != nil {
		return nil, err
	}

	title := "Page"
	swipeable := false
	pageParam := interfaces.CreatePageParam{
		SceneID:         sc.ID(),
		StoryID:         st.Id(),
		Title:           &title,
		Swipeable:       &swipeable,
		Layers:          &[]id.NLSLayerID{},
		SwipeableLayers: &[]id.NLSLayerID{},
		Index:           &index,
	}

	st, _, err = uc.StoryTelling.CreatePage(ctx, pageParam, op)
	if err != nil {
		return nil, err
	}
	storytellings := make(storytelling.StoryList, 0, 1)
	storytellings = append(storytellings, st)

	return &pb.CreateProjectResponse{
		Project: internalapimodel.ToInternalProject(ctx, pj, &storytellings),
	}, nil
}

func (s server) UpdateProjectMetadata(ctx context.Context, req *pb.UpdateProjectMetadataRequest) (*pb.UpdateProjectMetadataResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	meta, err := uc.ProjectMetadata.Update(ctx, interfaces.UpdateProjectMetadataParam{
		ID:      pid,
		Readme:  req.Readme,
		License: req.License,
		Topics: func() *[]string {
			if req.Topics == nil {
				return nil
			}
			return &req.Topics.Values
		}(),
	}, op)
	if err != nil {
		return nil, err
	}

	return &pb.UpdateProjectMetadataResponse{
		Metadata: internalapimodel.ToProjectMetadata(meta),
	}, nil
}

func (s server) UpdateProject(ctx context.Context, req *pb.UpdateProjectRequest) (*pb.UpdateProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	var imageURL *url.URL
	if req.ImageUrl != nil {
		parsedURL, err := url.Parse(*req.ImageUrl)
		if err != nil {
			return nil, fmt.Errorf("invalid image_url: %w", err)
		}
		imageURL = parsedURL
	}

	pj, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:             pId,
		Name:           req.Name,
		Description:    req.Description,
		Archived:       req.Archived,
		ImageURL:       imageURL,
		DeleteImageURL: req.DeleteImageUrl != nil && *req.DeleteImageUrl,
		SceneID:        id.SceneIDFromRef(req.SceneId),
		Starred:        req.Starred,
		Deleted:        req.Deleted,
		Visibility:     req.Visibility,
		ProjectAlias:   req.ProjectAlias,

		// publishment
		PublicTitle:       req.PublicTitle,
		PublicDescription: req.PublicDescription,
		PublicImage:       req.PublicImage,
		PublicNoIndex:     req.PublicNoIndex,
		DeletePublicImage: req.DeletePublicImage != nil && *req.DeletePublicImage,
		IsBasicAuthActive: req.IsBasicAuthActive,
		BasicAuthUsername: req.BasicAuthUsername,
		BasicAuthPassword: req.BasicAuthPassword,
		EnableGa:          req.EnableGa,
		TrackingID:        req.TrackingId,
	}, op)
	if err != nil {
		return nil, err
	}

	prj, err := s.getSceneAndStorytelling(ctx, pj)
	if err != nil {
		return nil, err
	}

	return &pb.UpdateProjectResponse{
		Project: prj,
	}, nil

}

func (s server) PublishProject(ctx context.Context, req *pb.PublishProjectRequest) (*pb.PublishProjectResponse, error) {

	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := id.ProjectIDFrom(req.ProjectId)

	if err != nil {
		return nil, err
	}

	pj, err := uc.Project.Publish(ctx, interfaces.PublishProjectParam{
		ID:     pId,
		Alias:  req.Alias,
		Status: gqlmodel.FromPublishmentStatus(gqlmodel.PublishmentStatus(req.PublishmentStatus.String())),
	}, op)
	if err != nil {
		return nil, err
	}

	prj, err := s.getSceneAndStorytelling(ctx, pj)
	if err != nil {
		return nil, err
	}

	return &pb.PublishProjectResponse{
		Project: prj,
	}, nil

}

func (s server) DeleteProject(ctx context.Context, req *pb.DeleteProjectRequest) (*pb.DeleteProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := id.ProjectIDFrom(req.ProjectId)

	if err != nil {
		return nil, err
	}

	if err := uc.Project.Delete(ctx, pId, op); err != nil {
		return nil, err
	}

	return &pb.DeleteProjectResponse{
		ProjectId: pId.String(),
	}, nil
}

func (s server) ExportProject(ctx context.Context, req *pb.ExportProjectRequest) (*pb.ExportProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	fs := afero.NewOsFs()

	zipFile, err := fs.Create(fmt.Sprintf("%s.zip", pid.String()))
	if err != nil {
		return nil, errors.New("Fail Zip Create :" + err.Error())
	}
	defer func() {
		if cerr := zipFile.Close(); cerr != nil && err == nil {
			err = cerr
		}
		//　delete after saving to storage
		if cerr := os.Remove(zipFile.Name()); cerr != nil && err == nil {
			err = cerr
		}
	}()

	zipWriter := zip.NewWriter(zipFile)
	defer func() {
		if cerr := zipWriter.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()

	prj, err := uc.Project.ExportProjectData(ctx, pid, zipWriter, op)
	if err != nil {
		return nil, errors.New("Fail ExportProject :" + err.Error())
	}

	sce, exportData, err := uc.Scene.ExportSceneData(ctx, prj)
	if err != nil {
		return nil, errors.New("Fail ExportSceneData :" + err.Error())
	}

	plugins, schemas, err := uc.Plugin.ExportPlugins(ctx, sce, zipWriter)
	if err != nil {
		return nil, errors.New("Fail ExportPlugins :" + err.Error())
	}

	exportData["project"] = gqlmodel.ToProjectExport(prj)
	exportData["plugins"] = gqlmodel.ToPlugins(plugins)
	exportData["schemas"] = gqlmodel.ToPropertySchemas(schemas)
	exportData["exportedInfo"] = map[string]string{
		"host":              adapter.CurrentHost(ctx),
		"project":           prj.ID().String(),
		"timestamp":         time.Now().Format(time.RFC3339),
		"exportDataVersion": file.EXPORT_DATA_VERSION,
	}
	b, err := json.Marshal(exportData)
	if err != nil {
		return nil, errors.New("failed normalize export data marshal: " + err.Error())
	}
	var data map[string]any
	if err := json.Unmarshal(b, &data); err != nil {
		return nil, errors.New("failed normalize export data unmarshal: " + err.Error())
	}
	err = uc.Project.SaveExportProjectZip(ctx, zipWriter, zipFile, data, prj)
	if err != nil {
		return nil, errors.New("Fail SaveExportProjectZip :" + err.Error())
	}

	return &pb.ExportProjectResponse{
		ProjectDataPath: "/export/" + zipFile.Name(),
	}, nil
}

func (s server) GetProjectByProjectAlias(ctx context.Context, req *pb.GetProjectByProjectAliasRequest) (*pb.GetProjectByProjectAliasResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pj, err := uc.Project.FindByProjectAlias(ctx, req.ProjectAlias, op)
	if err != nil {
		return nil, err
	}

	prj, err := s.getSceneAndStorytelling(ctx, pj)
	if err != nil {
		return nil, err
	}

	return &pb.GetProjectByProjectAliasResponse{
		Project: prj,
	}, nil
}

func (s server) UpdateByProjectAlias(ctx context.Context, req *pb.UpdateByProjectAliasRequest) (*pb.UpdateByProjectAliasResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pj, err := uc.Project.FindByProjectAlias(ctx, req.ProjectAlias, op)
	if err != nil {
		return nil, err
	}

	var imageURL *url.URL
	if req.ImageUrl != nil {
		parsedURL, err := url.Parse(*req.ImageUrl)
		if err != nil {
			return nil, fmt.Errorf("invalid image_url: %w", err)
		}
		imageURL = parsedURL
	}

	pj, err = uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:             pj.ID(),
		Name:           req.Name,
		Description:    req.Description,
		Archived:       req.Archived,
		ImageURL:       imageURL,
		DeleteImageURL: req.DeleteImageUrl != nil && *req.DeleteImageUrl,
		SceneID:        id.SceneIDFromRef(req.SceneId),
		Starred:        req.Starred,
		Deleted:        req.Deleted,
		Visibility:     req.Visibility,
		ProjectAlias:   req.NewProjectAlias,

		// publishment
		PublicTitle:       req.PublicTitle,
		PublicDescription: req.PublicDescription,
		PublicImage:       req.PublicImage,
		PublicNoIndex:     req.PublicNoIndex,
		DeletePublicImage: req.DeletePublicImage != nil && *req.DeletePublicImage,
		IsBasicAuthActive: req.IsBasicAuthActive,
		BasicAuthUsername: req.BasicAuthUsername,
		BasicAuthPassword: req.BasicAuthPassword,
		EnableGa:          req.EnableGa,
		TrackingID:        req.TrackingId,
	}, op)
	if err != nil {
		return nil, err
	}

	prj, err := s.getSceneAndStorytelling(ctx, pj)
	if err != nil {
		return nil, err
	}

	return &pb.UpdateByProjectAliasResponse{
		Project: prj,
	}, nil
}

func (s server) DeleteByProjectAlias(ctx context.Context, req *pb.DeleteByProjectAliasRequest) (*pb.DeleteByProjectAliasResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pj, err := uc.Project.FindByProjectAlias(ctx, req.ProjectAlias, op)
	if err != nil {
		return nil, err
	}

	if err := uc.Project.Delete(ctx, pj.ID(), op); err != nil {
		return nil, err
	}

	return &pb.DeleteByProjectAliasResponse{
		ProjectAlias: req.ProjectAlias,
	}, nil

}

func (s server) getScenesAndStorytellings(ctx context.Context, res []*project.Project) ([]*pb.Project, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	var pids []id.ProjectID
	for _, pj := range res {
		pids = append(pids, pj.ID())
	}

	scenes, storytellings, err := uc.Scene.FindByProjectsWithStory(ctx, pids, op)
	if err != nil {
		return nil, err
	}

	projects := make([]*pb.Project, 0, len(res))
	for _, pj := range res {
		for _, sc := range scenes {
			if pj.ID() == sc.Project() {
				pj.UpdateSceneID(sc.ID())
				projects = append(projects, internalapimodel.ToInternalProject(ctx, pj, storytellings))
			}
		}
	}

	return projects, nil
}

func (s server) getSceneAndStorytelling(ctx context.Context, pj *project.Project) (*pb.Project, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	sc, err := uc.Scene.FindByProject(ctx, pj.ID(), op)
	if err != nil {
		return nil, err
	}

	pj.UpdateSceneID(sc.ID())

	sts, err := uc.StoryTelling.FetchByScene(ctx, pj.Scene(), op)
	if err != nil {
		return nil, err
	}

	return internalapimodel.ToInternalProject(ctx, pj, sts), nil
}

func (s server) PatchStarCount(ctx context.Context, req *pb.PatchStarCountRequest) (*pb.PatchStarCountResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)
	usr := adapter.User(ctx)

	if usr == nil {
		return nil, errors.New("user not found in context")
	}

	pj, err := uc.Project.FindByProjectAlias(ctx, req.ProjectAlias, op)
	if err != nil {
		return nil, err
	}

	pid := pj.ID()

	metadata, err := uc.ProjectMetadata.FindProjectByIDByAnyUser(ctx, pid)
	if err != nil {
		return nil, errors.New("failed to fetch project metadata: " + err.Error())
	}

	userID := usr.ID().String()
	starredBy := []string{}
	starCount := int64(0)

	if metadata.StarredBy() != nil {
		starredBy = *metadata.StarredBy()
	}

	if metadata.StarCount() != nil {
		starCount = *metadata.StarCount()
	}

	if slices.Contains(starredBy, userID) {
		starredBy = slices.Delete(starredBy, slices.Index(starredBy, userID), slices.Index(starredBy, userID)+1)
		starCount = starCount - 1

	} else {
		starredBy = append(starredBy, userID)
		starCount = starCount + 1

	}

	meta, err := uc.ProjectMetadata.UpdateProjectMetadataByAnyUser(ctx, interfaces.UpdateProjectMetadataByAnyUserParam{
		ID:        pid,
		StarCount: &starCount,
		StarredBy: &starredBy,
	})
	if err != nil {
		return nil, err
	}
	return &pb.PatchStarCountResponse{
		Projectmetadata: internalapimodel.ToProjectMetadata(meta),
	}, nil
}
