package apiv1

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth/server/internal/adapter/projectexport"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
)

// ExportProject builds the export zip in the export storage, as the web app's
// export does, and streams it back. The stored zip is a single-use handoff, so
// it is removed once the response has been written.
func (s Server) ExportProject(ctx context.Context, req ExportProjectRequestObject) (ExportProjectResponseObject, error) {
	if s.file == nil {
		return nil, errors.New("api v1: no file storage for exports")
	}
	uc, op := usecases(ctx)
	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, invalidInput("invalid project ID %q", req.ProjectId)
	}
	prj, err := fetchProject(ctx, uc, pid)
	if err != nil {
		return nil, err
	}
	if prj.IsDeleted() {
		return nil, conflict("project %s is in the trash; restore it first", pid)
	}

	filename, err := projectexport.ToStorage(ctx, uc, op, pid)
	if err != nil {
		return nil, err
	}
	r, err := s.file.ReadExportProjectZip(ctx, filename)
	if err != nil {
		return nil, err
	}
	return ExportProject200ApplicationzipResponse{
		Body: &exportReader{ReadCloser: r, ctx: ctx, file: s.file, name: filename},
	}, nil
}

// exportReader removes the stored export once the response is done with it.
type exportReader struct {
	io.ReadCloser
	ctx  context.Context
	file gateway.File
	name string
}

func (r *exportReader) Close() error {
	err := r.ReadCloser.Close()
	// The request context may be ending as the response finishes.
	if rerr := r.file.RemoveExportProjectZip(context.WithoutCancel(r.ctx), r.name); rerr != nil {
		log.Warnfc(r.ctx, "api v1: could not remove export %s: %v", r.name, rerr)
	}
	return err
}
