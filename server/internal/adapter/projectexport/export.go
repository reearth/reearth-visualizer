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

	"github.com/google/uuid"
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
// read and removed by. The GraphQL API hands this name out as a download URL
// the client fetches separately, and that download route parses the project
// ID back out of the name, so it has to stay this deterministic form.
func ToStorage(ctx context.Context, uc *interfaces.Container, op *usecase.Operator, pid id.ProjectID) (string, error) {
	return toStorage(ctx, uc, op, pid, fmt.Sprintf("%s.zip", pid.String()))
}

// ToStorageUnique is like ToStorage, but writes to a name that's unique per
// call instead of the deterministic "<project ID>.zip". Use this for a
// caller that reads the result back directly within the same request/response
// (never handing out a separate download URL for someone else to fetch
// later), such as the REST API's synchronous export endpoint.
//
// REL-11: that REST endpoint removes its copy as soon as its own response
// finishes. Sharing ToStorage's deterministic name meant a concurrent
// GraphQL or gRPC export of the same project could have its file truncated
// or deleted out from under it by an unrelated REST request finishing first.
func ToStorageUnique(ctx context.Context, uc *interfaces.Container, op *usecase.Operator, pid id.ProjectID) (string, error) {
	objectName, err := uniqueExportObjectName(pid)
	if err != nil {
		return "", err
	}
	return toStorage(ctx, uc, op, pid, objectName)
}

func uniqueExportObjectName(pid id.ProjectID) (string, error) {
	u, err := uuid.NewRandom()
	if err != nil {
		return "", fmt.Errorf("failed to generate unique export name: %w", err)
	}
	return fmt.Sprintf("%s-%s.zip", pid.String(), u.String()), nil
}

// SaveExportProjectZip closes the zip writer and the file itself, so the
// deferred closes below fail by design on success; their errors are not
// returned, as before this was moved out of the GraphQL resolver.
func toStorage(ctx context.Context, uc *interfaces.Container, op *usecase.Operator, pid id.ProjectID, objectName string) (string, error) {
	fs := afero.NewOsFs()

	zipFile, err := fs.Create(objectName)
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
