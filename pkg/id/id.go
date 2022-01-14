package id

import (
	"errors"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/oklog/ulid"
)

var (
	entropyLock sync.Mutex
	// not safe for concurrent
	entropy      = ulid.Monotonic(rand.New(rand.NewSource(time.Now().UnixNano())), 0)
	ErrInvalidID = errors.New("invalid ID")
)

type ID struct {
	id ulid.ULID
}

func New() ID {
	return ID{generateID()}
}

func NewAllID(n int) []ID {
	if n <= 0 {
		return []ID{}
	}
	if n == 1 {
		return []ID{New()}
	}
	ids := make([]ID, 0, n)
	generated := generateAllID(n)
	for _, id := range generated {
		ids = append(ids, ID{id})
	}
	return ids
}

func NewIDWith(id string) (ID, error) {
	return FromID(id)
}

func FromID(id string) (ID, error) {
	parsedID, e := parseID(id)
	if e != nil {
		return ID{}, ErrInvalidID
	}
	return ID{parsedID}, nil
}

func FromIDRef(id *string) *ID {
	if id == nil || *id == "" {
		return nil
	}
	parsedID, err := parseID(*id)
	if err != nil {
		return nil
	}
	nid := ID{parsedID}
	return &nid
}

func MustBeID(id string) ID {
	parsedID, err := parseID(id)
	if err != nil {
		panic("invalid id")
	}
	return ID{parsedID}
}

func (i ID) Copy() ID {
	return ID{i.id}
}

func (i ID) Timestamp() time.Time {
	return ulid.Time(i.id.Time())
}

// String implements fmt.Stringer interface.
func (i ID) String() string {
	return strings.ToLower(ulid.ULID(i.id).String())
}

// GoString implements fmt.GoStringer interface.
func (i ID) GoString() string {
	return "id.ID(" + i.String() + ")"
}

func (i ID) IsNil() bool {
	return i.id.Compare(ulid.ULID{}) == 0
}

func (i ID) Compare(i2 ID) int {
	return i.id.Compare(i2.id)
}

func (i ID) Equal(i2 ID) bool {
	return i.id.Compare(i2.id) == 0
}

func (i *ID) IsEmpty() bool {
	return i == nil || (*i).IsNil()
}

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
