package app

import (
	"sync"
	"testing"

	"github.com/reearth/reearth/server/pkg/project"
)

// TestSplitUploadManager_ConcurrentMapAccess verifies that concurrent calls to
// readSession and UpdateSession do not cause a fatal map race.
// Run with -race to catch any regression: go test -race -run TestSplitUploadManager
//
// Before the fix, handleChunkedUpload read activeUploads without holding the
// mutex while UpdateSession wrote under it — triggering a Go runtime fatal crash.
func TestSplitUploadManager_ConcurrentMapAccess(t *testing.T) {
	m := &SplitUploadManager{
		activeUploads: make(map[string]*SplitUploadSession),
	}

	const fileID = "test-upload"
	const goroutines = 20

	var wg sync.WaitGroup
	wg.Add(goroutines)

	for i := 0; i < goroutines; i++ {
		go func() {
			defer wg.Done()

			// Exercise the same read path used by handleChunkedUpload.
			pid := m.readSessionProjectID(fileID)
			_ = pid

			// Concurrently write a session (as UpdateSession does).
			_, _, _ = m.UpdateSession(fileID, 0, goroutines, nil)
		}()
	}

	wg.Wait()
}

// TestSplitUploadManager_UpdateSession checks that UpdateSession correctly
// tracks chunks and detects completion.
func TestSplitUploadManager_UpdateSession(t *testing.T) {
	m := &SplitUploadManager{
		activeUploads: make(map[string]*SplitUploadSession),
	}

	prj, err := project.New().NewID().Build()
	if err != nil {
		t.Fatalf("failed to build project: %v", err)
	}

	// First chunk — creates the session.
	session, completed, err := m.UpdateSession("f1", 0, 3, prj)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if completed {
		t.Error("should not be completed after first chunk")
	}
	if session.Project == nil {
		t.Error("project should be set on session")
	}

	// Second chunk.
	_, completed, err = m.UpdateSession("f1", 1, 3, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if completed {
		t.Error("should not be completed after second chunk")
	}

	// Third and final chunk.
	_, completed, err = m.UpdateSession("f1", 2, 3, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !completed {
		t.Error("should be completed after all chunks received")
	}
}

// TestSplitUploadManager_UpdateSession_MissingChunkZero verifies the REL-01
// fix: a session must never be reported completed while chunk 0 (which
// creates the session's Project) was never received, even once every other
// chunk index has arrived and the total count matches. Before the fix,
// complete-by-count alone let this trigger a nil-pointer panic in the
// detached import goroutine that assembles the upload.
func TestSplitUploadManager_UpdateSession_MissingChunkZero(t *testing.T) {
	m := &SplitUploadManager{
		activeUploads: make(map[string]*SplitUploadSession),
	}

	// A malformed/1-indexed client sends chunk_num=1 with total_chunks=1 and
	// never sends chunk 0, so prj is nil for every call.
	session, completed, err := m.UpdateSession("f2", 1, 1, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if completed {
		t.Error("session must not be completed when chunk 0 was never received")
	}
	if session.Project != nil {
		t.Error("project should still be nil without chunk 0")
	}
}

// TestSplitUploadManager_CleanupSession verifies that CleanupSession removes
// the session from the map under the lock.
func TestSplitUploadManager_CleanupSession(t *testing.T) {
	m := &SplitUploadManager{
		activeUploads: make(map[string]*SplitUploadSession),
	}

	m.mu.Lock()
	m.activeUploads["f1"] = &SplitUploadSession{FileID: "f1"}
	m.mu.Unlock()

	m.CleanupSession("f1")

	m.mu.RLock()
	_, exists := m.activeUploads["f1"]
	m.mu.RUnlock()

	if exists {
		t.Error("session should have been removed after cleanup")
	}
}
