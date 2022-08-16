package idx

import (
	"math/rand"
	"sync"
	"time"

	"github.com/oklog/ulid"
	"github.com/reearth/reearth-backend/pkg/util"
)

var (
	entropyLock sync.Mutex
	// not safe for concurrent
	entropy = ulid.Monotonic(rand.New(rand.NewSource(time.Now().UnixNano())), 0)
)

func generateID() ulid.ULID {
	entropyLock.Lock()
	newID := ulid.MustNew(ulid.Timestamp(time.Now().UTC()), entropy)
	entropyLock.Unlock()
	return newID
}

func generateAllID(n int) []ulid.ULID {
	ids := make([]ulid.ULID, 0, n)
	entropyLock.Lock()
	for i := 0; i < n; i++ {
		newID := ulid.MustNew(ulid.Timestamp(time.Now().UTC()), entropy)
		ids = append(ids, newID)
	}
	entropyLock.Unlock()
	return ids
}

func parseID(id string) (parsedID ulid.ULID, e error) {
	if includeUpperCase(id) {
		return parsedID, ErrInvalidID
	}
	return ulid.Parse(id)
}

func includeUpperCase(s string) bool {
	for _, c := range s {
		if 'A' <= c && c <= 'Z' {
			return true
		}
	}
	return false
}

func mustParseID(id string) ulid.ULID {
	return util.Must(parseID(id))
}
