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

// ToStorage writes the export zip to export storage as "<project ID>.zip",
// the name the GraphQL download URL depends on.
//
// NOTE(SCA-02, AI compliance scan finding): the local scratch file below is
// created at a fixed "<projectID>.zip" path, so two concurrent exports of the
// same project race on it -- the second Create truncates the file the first
// is still streaming assets into, and the first export's deferred cleanup can
// then delete the second export's file out from under it, producing a
// corrupted zip that both callers see as a success. A complete fix (unique
// scratch filename per export, same deterministic served object name) was
// written and tested but its PR was closed unmerged (#2424) before this
// package existed. Accepting this as a tradeoff for now: exporting is a rare,
// deliberate action and the race needs two exports of the exact same project
// to overlap within the few-seconds-to-minutes an export takes, so real-world
// likelihood is low. Flagged repeatedly across monthly AI compliance scans
// (most recently as SCA-02 in eukarya-inc/compliance#263) -- each scan opens
// a fresh issue, so this comment is the durable record instead of a thread.
func ToStorage(ctx context.Context, uc *interfaces.Container, op *usecase.Operator, pid id.ProjectID) (string, error) {
	return toStorage(ctx, uc, op, pid, fmt.Sprintf("%s.zip", pid.String()))
}

// ToStorageUnique is ToStorage with a per-call unique name instead, for a
// caller like the REST API that reads the result back directly instead of
// handing out a download URL.
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
