package idx

import (
	"errors"
	"strings"
	"time"

	"github.com/oklog/ulid"
	"github.com/reearth/reearth/server/pkg/util"
	"github.com/samber/lo"
)

var ErrInvalidID = errors.New("invalid ID")

type Type interface {
	Type() string
}

type ID[T Type] struct {
	id ulid.ULID
}

func New[T Type]() ID[T] {
	return ID[T]{id: generateID()}
}

func NewAll[T Type](n int) (l List[T]) {
	if n <= 0 {
		return
	}
	if n == 1 {
		return List[T]{New[T]()}
	}
	return lo.Map(generateAllID(n), func(id ulid.ULID, _ int) ID[T] {
		return ID[T]{id: id}
	})
}

func From[T Type](id string) (ID[T], error) {
	parsedID, e := parseID(id)
	if e != nil {
		return ID[T]{}, ErrInvalidID
	}
	return ID[T]{id: parsedID}, nil
}

func Must[T Type](id string) ID[T] {
	return util.Must(From[T](id))
}

func FromRef[T Type](id *string) *ID[T] {
	if id == nil {
		return nil
	}
	nid, err := From[T](*id)
	if err != nil {
		return nil
	}
	return &nid
}

func (id ID[T]) Ref() *ID[T] {
	return &id
}

func (id ID[T]) Clone() ID[T] {
	return ID[T]{id: id.id}
}

func (id *ID[T]) CloneRef() *ID[T] {
	if id == nil {
		return nil
	}
	i := id.Clone()
	return &i
}

func (id *ID[T]) CopyRef() *ID[T] {
	return id.CloneRef()
}

func (ID[T]) Type() string {
	var t T
	return t.Type()
}

func (id ID[T]) Timestamp() time.Time {
	return ulid.Time(id.id.Time())
}

// String implements fmt.Stringer interface.
func (id ID[T]) String() string {
	if id.IsEmpty() {
		return ""
	}
	return strings.ToLower(ulid.ULID(id.id).String())
}

func (id *ID[T]) StringRef() *string {
	if id == nil {
		return nil
	}
	s := id.String()
	return &s
}

// GoString implements fmt.GoStringer interface.
func (id ID[T]) GoString() string {
	return id.Type() + "ID(" + id.String() + ")"
}

func (id ID[T]) Compare(id2 ID[T]) int {
	return id.id.Compare(id2.id)
}

func (i ID[T]) Equal(i2 ID[T]) bool {
	return i.id.Compare(i2.id) == 0
}

func (id ID[T]) IsEmpty() bool {
	return id.id.Compare(ulid.ULID{}) == 0
}

func (id *ID[T]) IsNil() bool {
	return id == nil || (*id).IsEmpty()
}

// MarshalText implements encoding.TextMarshaler interface
func (d *ID[T]) MarshalText() ([]byte, error) {
	if d.IsNil() {
		return nil, nil
	}
	return []byte(d.String()), nil
}

// UnmarshalText implements encoding.TextUnmarshaler interface
func (id *ID[T]) UnmarshalText(b []byte) (err error) {
	*id, err = From[T](string(b))
	return
}
