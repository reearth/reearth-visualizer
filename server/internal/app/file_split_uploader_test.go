package app

import (
	"archive/zip"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
)

// fakeProjectUsecase implements only the two interfaces.Project methods the
// import pipeline's timeout paths exercise (REL-03); every other method
// panics via the nil-embedded interface if a test accidentally reaches it.
type fakeProjectUsecase struct {
	interfaces.Project
	importProjectData  func(ctx context.Context, wsID string, sceneID *string, data *[]byte, op *usecase.Operator) (*project.Project, error)
	updateImportStatus func(ctx context.Context, pid id.ProjectID, status project.ProjectImportStatus, msg *map[string]any, op *usecase.Operator) (*project.ProjectMetadata, error)
}

func (f *fakeProjectUsecase) ImportProjectData(ctx context.Context, wsID string, sceneID *string, data *[]byte, op *usecase.Operator) (*project.Project, error) {
	return f.importProjectData(ctx, wsID, sceneID, data, op)
}

func (f *fakeProjectUsecase) UpdateImportStatus(ctx context.Context, pid id.ProjectID, status project.ProjectImportStatus, msg *map[string]any, op *usecase.Operator) (*project.ProjectMetadata, error) {
	return f.updateImportStatus(ctx, pid, status, msg, op)
}

// writeTestExportZip builds the minimal zip UncompressExportZip accepts —
// just a project.json containing valid JSON — so runImportJob tests can
// reach ImportProject without needing a real exported project.
func writeTestExportZip(t *testing.T) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "export.zip")
	f, err := os.Create(path)
	if err != nil {
		t.Fatalf("failed to create zip: %v", err)
	}
	zw := zip.NewWriter(f)
	w, err := zw.Create("project.json")
	if err != nil {
		t.Fatalf("failed to create zip entry: %v", err)
	}
	if _, err := w.Write([]byte(`{}`)); err != nil {
		t.Fatalf("failed to write zip entry: %v", err)
	}
	if err := zw.Close(); err != nil {
		t.Fatalf("failed to close zip writer: %v", err)
	}
	if err := f.Close(); err != nil {
		t.Fatalf("failed to close zip file: %v", err)
	}
	return path
}

// setUpdatedAtForTest mutates updatedAt under the session's own lock, so
// tests exercising staleness don't have to reach past uploadSession's
// locking methods and break the invariant the type exists to enforce.
func (s *uploadSession) setUpdatedAtForTest(t time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.updatedAt = t
}

func newTestManager(t *testing.T) *SplitUploadManager {
	t.Helper()
	return &SplitUploadManager{
		sessions:            make(map[string]*uploadSession),
		tempDir:             t.TempDir(),
		chunkSize:           4, // small chunk size keeps test data tiny
		jobs:                make(chan importJob, 1),
		importJobTimeout:    importJobTimeout,
		dispatchWaitTimeout: dispatchWaitTimeout,
	}
}

// TestUploadSession_ConcurrentChunkWrites verifies that concurrent chunk
// requests for the same fileID — the normal case, since the frontend
// uploads chunk 0 then the rest with concurrency 4 — never race on session
// state. Run with -race to catch any regression:
// go test -race -run TestUploadSession_ConcurrentChunkWrites
func TestUploadSession_ConcurrentChunkWrites(t *testing.T) {
	m := newTestManager(t)
	const fileID = "test-upload"
	const goroutines = 20

	var wg sync.WaitGroup
	wg.Add(goroutines)
	for range goroutines {
		go func() {
			defer wg.Done()
			session, err := m.getOrCreateSession(fileID, goroutines)
			if err != nil {
				t.Errorf("getOrCreateSession: %v", err)
				return
			}
			_ = session.snapshot()
			if _, err := session.writeChunk(0, strings.NewReader("data")); err != nil {
				t.Errorf("writeChunk: %v", err)
			}
		}()
	}
	wg.Wait()
}

// TestUploadSession_WriteChunk_CompletionDetection checks that a session is
// only reported complete once every chunk index has arrived AND the
// project (set from chunk 0) is known.
func TestUploadSession_WriteChunk_CompletionDetection(t *testing.T) {
	m := newTestManager(t)

	prj, err := project.New().NewID().Build()
	if err != nil {
		t.Fatalf("failed to build project: %v", err)
	}

	session, err := m.getOrCreateSession("f1", 3)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}
	session.setProject(prj)

	completed, err := session.writeChunk(0, strings.NewReader("aaaa"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if completed {
		t.Error("should not be completed after first chunk")
	}

	completed, err = session.writeChunk(1, strings.NewReader("bbbb"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if completed {
		t.Error("should not be completed after second chunk")
	}

	completed, err = session.writeChunk(2, strings.NewReader("cc"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !completed {
		t.Error("should be completed after all chunks received")
	}

	snap := session.snapshot()
	if snap.ProjectID == nil {
		t.Fatal("project should be set on session snapshot")
	}

	// Chunks are written at their byte offset directly into one file, so
	// the assembled content is correct without any separate concat step.
	data, err := os.ReadFile(snap.FilePath)
	if err != nil {
		t.Fatalf("failed to read assembled file: %v", err)
	}
	if got := string(data); got != "aaaabbbbcc" {
		t.Errorf("assembled content = %q, want %q", got, "aaaabbbbcc")
	}
}

// TestUploadSession_WriteChunk_CompletesOnlyOnce is a regression test:
// once a session has been reported complete, a retried/duplicate write of
// an already-received chunk (e.g. a client retrying the final chunk after
// a flaky response) must not report completed a second time. Otherwise
// the caller would dispatch a second import job for the same fileID,
// racing the first job's cleanup of the session and its backing file.
func TestUploadSession_WriteChunk_CompletesOnlyOnce(t *testing.T) {
	m := newTestManager(t)

	prj, err := project.New().NewID().Build()
	if err != nil {
		t.Fatalf("failed to build project: %v", err)
	}

	session, err := m.getOrCreateSession("f5", 1)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}
	session.setProject(prj)

	completed, err := session.writeChunk(0, strings.NewReader("data"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !completed {
		t.Fatal("should be completed after the only chunk is received")
	}

	// Retry of the same chunk after completion.
	completed, err = session.writeChunk(0, strings.NewReader("data"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if completed {
		t.Error("must not report completed a second time for the same session")
	}
}

// TestUploadSession_WriteChunk_MissingChunkZero is the REL-01 regression
// test: a session must never be reported completed while chunk 0 (which
// creates the session's Project) was never received, even once every other
// chunk index has arrived and the total count matches.
func TestUploadSession_WriteChunk_MissingChunkZero(t *testing.T) {
	m := newTestManager(t)

	// A malformed/1-indexed client sends chunk_num=1 with total_chunks=1 and
	// never sends chunk 0, so the project is never set.
	session, err := m.getOrCreateSession("f2", 1)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}

	completed, err := session.writeChunk(1, strings.NewReader("data"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if completed {
		t.Error("session must not be completed when chunk 0 was never received")
	}
	if session.snapshot().ProjectID != nil {
		t.Error("project should still be nil without chunk 0")
	}
}

// TestUploadSession_WriteChunk_RejectsShortNonFinalChunk verifies that a
// non-final chunk shorter than chunkSize is rejected and not marked
// received, rather than leaving a zero-filled gap in the assembled file
// that would silently corrupt it.
func TestUploadSession_WriteChunk_RejectsShortNonFinalChunk(t *testing.T) {
	m := newTestManager(t) // chunkSize is 4 bytes

	session, err := m.getOrCreateSession("f6", 2)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}

	// Chunk 0 of 2 is non-final and must be exactly chunkSize (4) bytes.
	_, err = session.writeChunk(0, strings.NewReader("ab"))
	if err == nil {
		t.Fatal("expected an error for a short non-final chunk")
	}
	if _, ok := session.received[0]; ok {
		t.Error("short chunk must not be marked received")
	}
}

// TestUploadSession_WriteChunk_RejectsOversizedChunk verifies that a chunk
// larger than chunkSize is rejected rather than silently overwriting the
// next chunk's offset in the backing file.
func TestUploadSession_WriteChunk_RejectsOversizedChunk(t *testing.T) {
	m := newTestManager(t) // chunkSize is 4 bytes

	session, err := m.getOrCreateSession("f7", 2)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}

	_, err = session.writeChunk(0, strings.NewReader("abcde")) // 5 bytes > chunkSize
	if err == nil {
		t.Fatal("expected an error for an oversized chunk")
	}
	if _, ok := session.received[0]; ok {
		t.Error("oversized chunk must not be marked received")
	}
}

// TestSplitUploadManager_CleanupSession verifies that cleanupSession removes
// the session from the map and deletes its backing file on disk.
func TestSplitUploadManager_CleanupSession(t *testing.T) {
	m := newTestManager(t)

	session, err := m.getOrCreateSession("f1", 1)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}
	filePath := session.snapshot().FilePath

	m.cleanupSession("f1")

	m.mgrMu.Lock()
	_, exists := m.sessions["f1"]
	m.mgrMu.Unlock()
	if exists {
		t.Error("session should have been removed after cleanup")
	}

	if _, err := os.Stat(filePath); !os.IsNotExist(err) {
		t.Errorf("backing file should have been removed, stat err = %v", err)
	}
}

// TestSplitUploadManager_CleanupStaleSessions verifies the 24h sweep removes
// sessions that haven't been touched recently, without needing them to have
// completed.
func TestSplitUploadManager_CleanupStaleSessions(t *testing.T) {
	m := newTestManager(t)

	session, err := m.getOrCreateSession("stale", 2)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}
	session.setUpdatedAtForTest(time.Now().Add(-25 * time.Hour))

	m.cleanupStaleSessions()

	m.mgrMu.Lock()
	_, exists := m.sessions["stale"]
	m.mgrMu.Unlock()
	if exists {
		t.Error("stale session should have been cleaned up")
	}
}

// TestSplitUploadManager_GetSession_DoesNotCreate is the SCA-03 regression
// test for the read-only lookup used by non-zero chunks: it must report
// "not found" for an unseen fileID rather than creating a session (and the
// fd/tmpfs file that comes with it).
func TestSplitUploadManager_GetSession_DoesNotCreate(t *testing.T) {
	m := newTestManager(t)

	if _, ok := m.getSession("never-started"); ok {
		t.Fatal("getSession should not find a session that was never created")
	}

	m.mgrMu.Lock()
	_, exists := m.sessions["never-started"]
	m.mgrMu.Unlock()
	if exists {
		t.Error("getSession must not create a session as a side effect")
	}

	if _, err := os.Stat(filepath.Join(m.tempDir, "never-started")); !os.IsNotExist(err) {
		t.Errorf("getSession must not create a backing file, stat err = %v", err)
	}
}

// TestSplitUploadManager_GetOrCreateSession_CapEnforced is the SCA-03
// regression test for the concurrent-session ceiling: once
// maxConcurrentSessions sessions are open, a new fileID must be rejected
// (bounding worst-case fd/tmpfs exposure) while re-requesting an existing
// fileID still succeeds (a legitimate client's chunk 0 retry must not be
// punished by other sessions filling the cap).
func TestSplitUploadManager_GetOrCreateSession_CapEnforced(t *testing.T) {
	m := newTestManager(t)

	// Each session opens a real fd; close them all once the test is done
	// rather than leaking hundreds of open files onto the test process
	// (caught in review).
	var sessions []*uploadSession
	t.Cleanup(func() {
		for _, s := range sessions {
			s.close()
		}
	})

	for i := range maxConcurrentSessions {
		fileID := fmt.Sprintf("session-%d", i)
		s, err := m.getOrCreateSession(fileID, 1)
		if err != nil {
			t.Fatalf("getOrCreateSession(%d): unexpected error before cap: %v", i, err)
		}
		sessions = append(sessions, s)
	}

	if _, err := m.getOrCreateSession("one-too-many", 1); err == nil {
		t.Fatal("expected an error once maxConcurrentSessions is reached")
	}

	// An already-open session must still be reachable at the cap.
	if _, err := m.getOrCreateSession("session-0", 1); err != nil {
		t.Errorf("getOrCreateSession for an existing fileID should succeed at the cap: %v", err)
	}
}

func TestUploadSession_WriteChunk_OutOfOrderOffsets(t *testing.T) {
	m := newTestManager(t)

	session, err := m.getOrCreateSession("f3", 2)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}

	// Chunk 1 arrives before chunk 0 — must land at the correct offset
	// regardless of arrival order.
	if _, err := session.writeChunk(1, strings.NewReader("bbbb")); err != nil {
		t.Fatalf("writeChunk(1): %v", err)
	}
	if _, err := session.writeChunk(0, strings.NewReader("aaaa")); err != nil {
		t.Fatalf("writeChunk(0): %v", err)
	}

	f, err := os.Open(session.snapshot().FilePath)
	if err != nil {
		t.Fatalf("failed to open file: %v", err)
	}
	defer func() { _ = f.Close() }()

	data, err := io.ReadAll(f)
	if err != nil {
		t.Fatalf("failed to read file: %v", err)
	}
	if got := string(data); got != "aaaabbbb" {
		t.Errorf("content = %q, want %q", got, "aaaabbbb")
	}
}

func TestUploadSession_FilePathIsUnderTempDir(t *testing.T) {
	m := newTestManager(t)
	session, err := m.getOrCreateSession("f4", 1)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}
	if dir := filepath.Dir(session.snapshot().FilePath); dir != m.tempDir {
		t.Errorf("file path dir = %q, want %q", dir, m.tempDir)
	}
	if !bytes.Contains([]byte(session.snapshot().FilePath), []byte("f4")) {
		t.Errorf("file path %q should contain fileID", session.snapshot().FilePath)
	}
}

// TestValidateChunkRequest covers the request-level validation that keeps
// fileID and chunkNum from ever reaching the filesystem unchecked: fileID
// flows into filepath.Join(tempDir, fileID), so an unrestricted value is a
// path-traversal vector, and an unbounded/negative chunkNum could force
// writes at arbitrary offsets in the backing file.
// TestSplitUploadManager_DispatchImport_TimesOutWhenPoolWedged is the
// REL-03 regression test: if every worker is stuck (modeled here by an
// unbuffered jobs channel with no worker draining it), dispatchImport must
// give up after dispatchWaitTimeout instead of blocking the caller
// forever, and must mark the import failed and clean up the session
// rather than silently dropping it.
func TestSplitUploadManager_DispatchImport_TimesOutWhenPoolWedged(t *testing.T) {
	m := newTestManager(t)
	m.jobs = make(chan importJob) // unbuffered, nothing ever reads it
	m.dispatchWaitTimeout = 20 * time.Millisecond

	prj, err := project.New().NewID().Build()
	if err != nil {
		t.Fatalf("failed to build project: %v", err)
	}
	session, err := m.getOrCreateSession("wedged", 1)
	if err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}
	session.setProject(prj)

	done := make(chan struct{})
	var gotStatus project.ProjectImportStatus
	var gotMessage string
	fake := &fakeProjectUsecase{
		updateImportStatus: func(ctx context.Context, pid id.ProjectID, status project.ProjectImportStatus, msg *map[string]any, op *usecase.Operator) (*project.ProjectMetadata, error) {
			gotStatus = status
			gotMessage = (*msg)["message"].(string)
			close(done)
			return nil, nil
		},
	}

	job := importJob{
		usecases:  &interfaces.Container{Project: fake},
		fileID:    "wedged",
		projectID: prj.ID(),
	}

	start := time.Now()
	m.dispatchImport(job) // must return immediately — the wait happens in its own goroutine

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for dispatchImport's timeout branch to run")
	}
	if elapsed := time.Since(start); elapsed > time.Second {
		t.Errorf("dispatch timeout took %v, want close to dispatchWaitTimeout (%v)", elapsed, m.dispatchWaitTimeout)
	}

	if gotStatus != project.ProjectImportStatusFailed {
		t.Errorf("status = %v, want %v", gotStatus, project.ProjectImportStatusFailed)
	}
	if !strings.Contains(gotMessage, "did not accept job in time") {
		t.Errorf("message = %q, want it to mention the pool not accepting the job", gotMessage)
	}

	if _, ok := m.getSession("wedged"); ok {
		t.Error("session should have been cleaned up after a dispatch timeout")
	}
}

// TestSplitUploadManager_DispatchImport_SucceedsWithinTimeout is the
// complement to the above: when a worker slot is available, the job must
// be handed off normally and the timeout/failure path must never fire.
func TestSplitUploadManager_DispatchImport_SucceedsWithinTimeout(t *testing.T) {
	m := newTestManager(t)
	m.jobs = make(chan importJob, 1) // room for one job, so the send succeeds immediately
	m.dispatchWaitTimeout = 2 * time.Second

	fake := &fakeProjectUsecase{
		updateImportStatus: func(ctx context.Context, pid id.ProjectID, status project.ProjectImportStatus, msg *map[string]any, op *usecase.Operator) (*project.ProjectMetadata, error) {
			t.Error("UpdateImportStatus must not be called when the job is dispatched successfully")
			return nil, nil
		},
	}

	job := importJob{
		usecases: &interfaces.Container{Project: fake},
		fileID:   "healthy",
	}
	m.dispatchImport(job)

	select {
	case got := <-m.jobs:
		if got.fileID != "healthy" {
			t.Errorf("dispatched job fileID = %q, want %q", got.fileID, "healthy")
		}
	case <-time.After(time.Second):
		t.Fatal("job was never delivered to the worker channel")
	}
}

// TestSplitUploadManager_DispatchImport_RecoversFromPanic guards against
// reintroducing the REL-01 failure class in the new dispatch goroutine:
// dispatchImport's timeout branch is itself a detached goroutine, so a
// panic inside it (e.g. a nil usecases dependency) must be recovered
// rather than crashing the whole process, the same way runImportJob
// already protects its own worker goroutine.
func TestSplitUploadManager_DispatchImport_RecoversFromPanic(t *testing.T) {
	m := newTestManager(t)
	m.jobs = make(chan importJob) // unbuffered, nothing reads it, forcing the timeout branch
	m.dispatchWaitTimeout = 20 * time.Millisecond

	// job.usecases is nil on purpose: UpdateImportStatus dereferences it,
	// which panics — exercising the recover path instead of crashing.
	job := importJob{fileID: "panicky"}

	done := make(chan struct{})
	go func() {
		defer close(done)
		m.dispatchImport(job)
	}()

	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("dispatchImport should have returned immediately regardless of the goroutine it spawns")
	}

	// Give the spawned goroutine time to hit the timeout branch and panic;
	// if the panic isn't recovered, it crashes the whole test binary, so
	// reaching this line at all is the real assertion.
	time.Sleep(100 * time.Millisecond)
}

// TestSplitUploadManager_RunImportJob_ContextTimesOut is the REL-03
// regression test for worker execution: a downstream call that hangs (here,
// ImportProjectData blocking until its context is done) must not wedge the
// worker forever — importJobTimeout bounds it, the job is marked failed,
// and the worker is free to return to runWorker's loop for the next job.
func TestSplitUploadManager_RunImportJob_ContextTimesOut(t *testing.T) {
	m := newTestManager(t)
	m.importJobTimeout = 20 * time.Millisecond

	prj, err := project.New().NewID().Build()
	if err != nil {
		t.Fatalf("failed to build project: %v", err)
	}
	if _, err := m.getOrCreateSession("stuck-import", 1); err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}

	var sawDeadline bool
	fake := &fakeProjectUsecase{
		importProjectData: func(ctx context.Context, wsID string, sceneID *string, data *[]byte, op *usecase.Operator) (*project.Project, error) {
			<-ctx.Done() // simulate a hung downstream (e.g. MongoDB) call
			sawDeadline = errors.Is(ctx.Err(), context.DeadlineExceeded)
			return nil, ctx.Err()
		},
		updateImportStatus: func(ctx context.Context, pid id.ProjectID, status project.ProjectImportStatus, msg *map[string]any, op *usecase.Operator) (*project.ProjectMetadata, error) {
			return nil, nil
		},
	}

	job := importJob{
		usecases:  &interfaces.Container{Project: fake},
		fileID:    "stuck-import",
		filePath:  writeTestExportZip(t),
		projectID: prj.ID(),
	}

	done := make(chan struct{})
	go func() {
		m.runImportJob(job) // must return once the bounded context expires
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("runImportJob did not return after its context should have timed out")
	}

	if !sawDeadline {
		t.Error("downstream call's context should have expired with context.DeadlineExceeded")
	}
	if _, ok := m.getSession("stuck-import"); ok {
		t.Error("session should have been cleaned up after the job finished (even on timeout)")
	}
}

// TestSplitUploadManager_RunImportJob_FastFailureIsNotTreatedAsTimeout
// checks the timeout wiring doesn't misfire on a normal, fast failure —
// the bounded context must still allow quick downstream errors through
// with their own message, not a spurious deadline error.
func TestSplitUploadManager_RunImportJob_FastFailureIsNotTreatedAsTimeout(t *testing.T) {
	m := newTestManager(t)
	m.importJobTimeout = 2 * time.Second // generous; the fake returns instantly

	prj, err := project.New().NewID().Build()
	if err != nil {
		t.Fatalf("failed to build project: %v", err)
	}
	if _, err := m.getOrCreateSession("fast-fail", 1); err != nil {
		t.Fatalf("getOrCreateSession: %v", err)
	}

	var gotMessage string
	done := make(chan struct{})
	fake := &fakeProjectUsecase{
		importProjectData: func(ctx context.Context, wsID string, sceneID *string, data *[]byte, op *usecase.Operator) (*project.Project, error) {
			return nil, errors.New("boom")
		},
		updateImportStatus: func(ctx context.Context, pid id.ProjectID, status project.ProjectImportStatus, msg *map[string]any, op *usecase.Operator) (*project.ProjectMetadata, error) {
			gotMessage = (*msg)["message"].(string)
			close(done)
			return nil, nil
		},
	}

	job := importJob{
		usecases:  &interfaces.Container{Project: fake},
		fileID:    "fast-fail",
		filePath:  writeTestExportZip(t),
		projectID: prj.ID(),
	}

	m.runImportJob(job)

	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("UpdateImportStatus was never called")
	}
	if strings.Contains(gotMessage, "deadline exceeded") {
		t.Errorf("message = %q, should be the fast failure, not a timeout", gotMessage)
	}
	if !strings.Contains(gotMessage, "boom") {
		t.Errorf("message = %q, want it to contain the underlying error", gotMessage)
	}
}

func TestValidateChunkRequest(t *testing.T) {
	tests := []struct {
		name        string
		fileID      string
		chunkNum    int
		totalChunks int
		wantErr     bool
	}{
		{"valid uuid-like id", "550e8400-e29b-41d4-a716-446655440000", 0, 3, false},
		{"valid alphanumeric id", "upload_123", 2, 3, false},
		{"path traversal via dotdot", "../../etc/cron.d/evil", 0, 1, true},
		{"path traversal via slash", "sub/dir/file", 0, 1, true},
		{"empty file id", "", 0, 1, true},
		{"negative chunk num", "valid-id", -1, 3, true},
		{"chunk num equal to total", "valid-id", 3, 3, true},
		{"chunk num beyond total", "valid-id", 10, 3, true},
		{"zero total chunks", "valid-id", 0, 0, true},
		{"negative total chunks", "valid-id", 0, -5, true},
		{"total chunks over the cap", "valid-id", 0, maxChunkCount + 1, true},
		{"total chunks at the cap", "valid-id", 0, maxChunkCount, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateChunkRequest(tt.fileID, tt.chunkNum, tt.totalChunks)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateChunkRequest(%q, %d, %d) error = %v, wantErr %v",
					tt.fileID, tt.chunkNum, tt.totalChunks, err, tt.wantErr)
			}
		})
	}
}
