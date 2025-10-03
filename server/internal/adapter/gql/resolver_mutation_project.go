package gql

import (
	"archive/zip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/spf13/afero"
)

func (r *mutationResolver) CreateProject(ctx context.Context, input gqlmodel.CreateProjectInput) (*gqlmodel.ProjectPayload, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  tid,
		Visualizer:   visualizer.Visualizer(input.Visualizer),
		Name:         input.Name,
		Description:  input.Description,
		CoreSupport:  input.CoreSupport,
		Visibility:   input.Visibility,
		ImportStatus: project.ProjectImportStatusNone,
		ProjectAlias: input.ProjectAlias,
		Readme:       input.Readme,
		License:      input.License,
		Topics:       &input.Topics,
	},
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectPayload{Project: gqlmodel.ToProject(res)}, nil
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input gqlmodel.UpdateProjectInput) (*gqlmodel.ProjectPayload, error) {
	deletePublicImage := false
	if input.DeletePublicImage != nil {
		deletePublicImage = *input.DeletePublicImage
	}

	deleteImageURL := false
	if input.DeleteImageURL != nil {
		deleteImageURL = *input.DeleteImageURL
	}

	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:             pid,
		Name:           input.Name,
		Description:    input.Description,
		ImageURL:       input.ImageURL,
		Archived:       input.Archived,
		DeleteImageURL: deleteImageURL,
		Starred:        input.Starred,
		Deleted:        input.Deleted,
		SceneID:        gqlmodel.ToIDRef[id.Scene](input.SceneID),
		Visibility:     input.Visibility,
		ProjectAlias:   input.ProjectAlias,

		// publishment
		PublicTitle:       input.PublicTitle,
		PublicDescription: input.PublicDescription,
		PublicImage:       input.PublicImage,
		PublicNoIndex:     input.PublicNoIndex,
		DeletePublicImage: deletePublicImage,
		IsBasicAuthActive: input.IsBasicAuthActive,
		BasicAuthUsername: input.BasicAuthUsername,
		BasicAuthPassword: input.BasicAuthPassword,
		EnableGa:          input.EnableGa,
		TrackingID:        input.TrackingID,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectPayload{Project: gqlmodel.ToProject(res)}, nil
}

func (r *mutationResolver) UpdateProjectMetadata(ctx context.Context, input gqlmodel.UpdateProjectMetadataInput) (*gqlmodel.ProjectMetadataPayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.Project)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).ProjectMetadata.Update(ctx, interfaces.UpdateProjectMetadataParam{
		ID:      pid,
		Readme:  input.Readme,
		License: input.License,
		Topics:  &input.Topics,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectMetadataPayload{Metadata: gqlmodel.ToProjectMetadata(res)}, nil
}

func (r *mutationResolver) PublishProject(ctx context.Context, input gqlmodel.PublishProjectInput) (*gqlmodel.ProjectPayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Project.Publish(ctx, interfaces.PublishProjectParam{
		ID:     pid,
		Alias:  input.Alias,
		Status: gqlmodel.FromPublishmentStatus(input.Status),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectPayload{Project: gqlmodel.ToProject(res)}, nil
}

func (r *mutationResolver) DeleteProject(ctx context.Context, input gqlmodel.DeleteProjectInput) (*gqlmodel.DeleteProjectPayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Project.Delete(ctx, pid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteProjectPayload{ProjectID: input.ProjectID}, nil
}

func (r *mutationResolver) ExportProject(ctx context.Context, input gqlmodel.ExportProjectInput) (*gqlmodel.ExportProjectPayload, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
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
		"host":      adapter.CurrentHost(ctx),
		"project":   prj.ID().String(),
		"timestamp": time.Now().Format(time.RFC3339),
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

	return &gqlmodel.ExportProjectPayload{
		ProjectDataPath: "/export/" + zipFile.Name(),
	}, nil
}
