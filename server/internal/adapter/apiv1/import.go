package apiv1

import (
	"bytes"
	"context"
	"errors"
	"io"
	"strconv"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

// ImportChunkSize is the size of every import chunk but the last, as the
// web app's chunked upload expects.
const ImportChunkSize = 16 << 20

// ImportChunk is one chunk of an import upload.
type ImportChunk struct {
	WorkspaceID accountsID.WorkspaceID
	FileID      string
	ChunkNum    int
	TotalChunks int
	Data        []byte
}

// ImportChunkResult reports the upload's progress.
type ImportChunkResult struct {
	ProjectID string
	Received  int
	Total     int
	Completed bool
}

// Importer stores a chunk and starts the import once all have arrived. The
// app provides it: it is the web app's chunked upload, so both import the
// same way.
type Importer func(ctx context.Context, chunk ImportChunk) (ImportChunkResult, error)

func (s Server) ImportProject(ctx context.Context, req ImportProjectRequestObject) (ImportProjectResponseObject, error) {
	if s.importer == nil {
		return nil, errors.New("api v1: no importer")
	}
	wid, err := accountsID.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, invalidInput("invalid workspace ID %q", req.WorkspaceId)
	}
	// Checked here because the shared upload answers every failure to start
	// an import with 400.
	if _, op := usecases(ctx); !op.IsWritableWorkspace(wid) {
		return nil, permissionDenied("you cannot create projects in workspace %s", wid)
	}
	chunk, err := readImportChunk(req)
	if err != nil {
		return nil, err
	}
	chunk.WorkspaceID = wid

	res, err := s.importer(ctx, chunk)
	if err != nil {
		return nil, err
	}
	return ImportProject200JSONResponse(ImportChunkResponse{
		ProjectId: res.ProjectID,
		Received:  res.Received,
		Total:     res.Total,
		Completed: res.Completed,
	}), nil
}

func readImportChunk(req ImportProjectRequestObject) (ImportChunk, error) {
	var c ImportChunk
	if req.Body == nil {
		return c, invalidInput("the request must be multipart/form-data")
	}
	var haveFile, haveNum, haveTotal bool
	for {
		part, err := req.Body.NextPart()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return c, invalidInput("invalid multipart body: %v", err)
		}
		switch part.FormName() {
		case "file":
			// Read one byte more than a chunk may hold, to reject larger ones.
			b, err := io.ReadAll(io.LimitReader(part, ImportChunkSize+1))
			if err != nil {
				return c, invalidInput("could not read the chunk: %v", err)
			}
			if len(b) > ImportChunkSize {
				return c, invalidInput("a chunk can be at most %d bytes", ImportChunkSize)
			}
			c.Data, haveFile = b, true
		case "file_id", "chunk_num", "total_chunks":
			b, err := io.ReadAll(io.LimitReader(part, 256))
			if err != nil {
				return c, invalidInput("invalid %s: %v", part.FormName(), err)
			}
			v := string(bytes.TrimSpace(b))
			switch part.FormName() {
			case "file_id":
				c.FileID = v
			case "chunk_num":
				if c.ChunkNum, err = strconv.Atoi(v); err != nil {
					return c, invalidInput("invalid chunk_num %q", v)
				}
				haveNum = true
			case "total_chunks":
				if c.TotalChunks, err = strconv.Atoi(v); err != nil {
					return c, invalidInput("invalid total_chunks %q", v)
				}
				haveTotal = true
			}
		}
		_ = part.Close()
	}
	if c.FileID == "" || !haveNum || !haveTotal || !haveFile {
		return c, invalidInput("file_id, chunk_num, total_chunks and file are required")
	}
	return c, nil
}
