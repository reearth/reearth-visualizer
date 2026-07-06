package app

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/project"
)

func newTestManager(t *testing.T) *SplitUploadManager {
	t.Helper()
	return &SplitUploadManager{
		sessions:  make(map[string]*uploadSession),
		tempDir:   t.TempDir(),
		chunkSize: 4, // small chunk size keeps test data tiny
		jobs:      make(chan importJob, 1),
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
	session.updatedAt = time.Now().Add(-25 * time.Hour)

	m.cleanupStaleSessions()

	m.mgrMu.Lock()
	_, exists := m.sessions["stale"]
	m.mgrMu.Unlock()
	if exists {
		t.Error("stale session should have been cleaned up")
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
