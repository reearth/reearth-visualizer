// Package projectexport builds a project's export zip, the file that project
// import reads back. The GraphQL API and the REST API both use it, so the
// format has a single definition.
package projectexport

import (
	"archive/zip"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/spf13/afero"
)

// ToStorage writes the export zip of a project to the export storage and
// returns its file name ("<project ID>.zip"), which the export storage is
// read and removed by.
//
// SaveExportProjectZip closes the zip writer and the file itself, so the
// deferred closes below fail by design on success; their errors are not
// returned, as before this was moved out of the GraphQL resolver.
func ToStorage(ctx context.Context, uc *interfaces.Container, op *usecase.Operator, pid id.ProjectID) (string, error) {
	fs := afero.NewOsFs()

	zipFile, err := fs.Create(fmt.Sprintf("%s.zip", pid.String()))
	if err != nil {
		return "", fmt.Errorf("failed to create zip file: %w", err)
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
		return "", fmt.Errorf("failed to export project: %w", err)
	}

	sce, exportData, err := uc.Scene.ExportSceneData(ctx, prj)
	if err != nil {
		return "", fmt.Errorf("failed to export scene data: %w", err)
	}

	plugins, schemas, err := uc.Plugin.ExportPlugins(ctx, sce, zipWriter)
	if err != nil {
		return "", fmt.Errorf("failed to export plugins: %w", err)
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
		return "", fmt.Errorf("failed normalize export data marshal: %w", err)
	}
	var data map[string]any
	if err := json.Unmarshal(b, &data); err != nil {
		return "", fmt.Errorf("failed normalize export data unmarshal: %w", err)
	}
	err = uc.Project.SaveExportProjectZip(ctx, zipWriter, zipFile, data, prj)
	if err != nil {
		return "", fmt.Errorf("failed to save export project zip: %w", err)
	}

	return zipFile.Name(), nil
}
