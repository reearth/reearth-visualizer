package idx

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestStringID_Ref(t *testing.T) {
	assert.Equal(t, lo.ToPtr(StringID[T]("a")), StringID[T]("a").Ref())
}

func TestStringID_CloneRef(t *testing.T) {
	s := lo.ToPtr(StringID[T]("a"))
	res := s.CloneRef()
	assert.Equal(t, s, res)
	assert.NotSame(t, s, res)
	assert.Nil(t, (*StringID[T])(nil).CloneRef())
}

func TestStringID_String(t *testing.T) {
	assert.Equal(t, "a", StringID[T]("a").String())
}

func TestStringID_StringRef(t *testing.T) {
	assert.Equal(t, lo.ToPtr("a"), lo.ToPtr(StringID[T]("a")).StringRef())
	assert.Nil(t, (*StringID[T])(nil).StringRef())
}
