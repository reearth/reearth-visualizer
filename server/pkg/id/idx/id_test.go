package idx

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

type TID = ID[T]

// T is a dummy ID type for unit tests
type T struct{}

func (T) Type() string { return "_" }

var idstr = mustParseID("01fzxycwmq7n84q8kessktvb8z")

func TestID_String(t *testing.T) {
	assert.Equal(t, "01fzxycwmq7n84q8kessktvb8z", TID{id: idstr}.String())
	assert.Equal(t, "", ID[T]{}.String())
}

func TestID_GoString(t *testing.T) {
	assert.Equal(t, "_ID(01fzxycwmq7n84q8kessktvb8z)", TID{id: idstr}.GoString())
	assert.Equal(t, "_ID()", TID{}.GoString())
}
