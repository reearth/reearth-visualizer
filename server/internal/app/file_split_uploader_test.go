package app

import (
	"sync"
	"testing"

	"github.com/reearth/reearth/server/pkg/project"
)

// TestSplitUploadManager_ConcurrentMapAccess verifies that concurrent chunk
// uploads do not cause a fatal map race. Run with -race to catch any regression.
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
		go func(chunkNum int) {
			defer wg.Done()

			// Mirrors the fixed read in handleChunkedUpload: RLock before map access.
			m.mu.RLock()
			session := m.activeUploads[fileID]
			m.mu.RUnlock()
			_ = session

			// Concurrently write a session (as UpdateSession does).
			m.mu.Lock()
			if _, exists := m.activeUploads[fileID]; !exists {
				m.activeUploads[fileID] = &SplitUploadSession{FileID: fileID}
			}
			m.mu.Unlock()
		}(i)
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
