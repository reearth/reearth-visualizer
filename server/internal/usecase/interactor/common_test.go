package interactor

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestReplaceIDsInPlace is a regression test for SCA-05: nlslayer.go, style.go, and scene.go
// each used to call bytes.Replace once per imported item, and bytes.Replace always allocates
// and copies the whole buffer even for one small match -- so an import's total memory traffic
// scaled with item count * buffer size. This confirms replaceIDsInPlace applies every old/new ID
// pair correctly in a single pass, with no leftover old IDs and no cross-contamination between
// pairs.
func TestReplaceIDsInPlace(t *testing.T) {
	t.Run("replaces multiple pairs correctly", func(t *testing.T) {
		data := []byte(`{"layers":[{"id":"old-1","ref":"old-1"},{"id":"old-2","ref":"old-2"},{"id":"old-3","ref":"old-3"}]}`)
		replaceIDsInPlace(&data, []string{
			"old-1", "new-1",
			"old-2", "new-2",
			"old-3", "new-3",
		})

		s := string(data)
		assert.NotContains(t, s, "old-1")
		assert.NotContains(t, s, "old-2")
		assert.NotContains(t, s, "old-3")
		assert.Equal(t, `{"layers":[{"id":"new-1","ref":"new-1"},{"id":"new-2","ref":"new-2"},{"id":"new-3","ref":"new-3"}]}`, s)
	})

	t.Run("no-op on an empty pair list", func(t *testing.T) {
		data := []byte(`{"id":"old-1"}`)
		replaceIDsInPlace(&data, nil)
		assert.Equal(t, `{"id":"old-1"}`, string(data))
	})

	t.Run("a new ID is not itself replaced by a later pair", func(t *testing.T) {
		// If pair order or overlap were handled incorrectly, replacing "a"->"b" then "b"->"c"
		// could cascade and turn the first replacement's own output into "c".
		data := []byte(`{"id":"a"}`)
		replaceIDsInPlace(&data, []string{"a", "b", "b", "c"})
		assert.Equal(t, `{"id":"b"}`, string(data))
	})

	t.Run("panics on an odd-length pair list", func(t *testing.T) {
		data := []byte(`{"id":"a"}`)
		assert.Panics(t, func() {
			replaceIDsInPlace(&data, []string{"a"})
		})
	})
}
