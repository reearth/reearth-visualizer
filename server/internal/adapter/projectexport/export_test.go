package projectexport

import (
	"strings"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestUniqueExportObjectName_DiffersAcrossCalls is a regression test for
// REL-11: ToStorage's deterministic "<project ID>.zip" name is shared by
// every export of the same project, so the REST API's export endpoint --
// which removes its copy as soon as its own response finishes -- could
// delete a concurrent GraphQL/gRPC export's file out from under it. This
// confirms repeated calls for the same project never collide on a name.
func TestUniqueExportObjectName_DiffersAcrossCalls(t *testing.T) {
	pid := id.NewProjectID()

	seen := map[string]bool{}
	for i := 0; i < 20; i++ {
		name, err := uniqueExportObjectName(pid)
		require.NoError(t, err)
		assert.True(t, strings.HasPrefix(name, pid.String()+"-"), "name %q must start with the project ID", name)
		assert.True(t, strings.HasSuffix(name, ".zip"), "name %q must end in .zip", name)
		assert.False(t, seen[name], "name %q must not repeat across calls", name)
		seen[name] = true
	}
}
