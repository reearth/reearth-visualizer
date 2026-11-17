package projectexport

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// denyingProject stubs only CheckProjectExportAccess, always denying.
type denyingProject struct {
	interfaces.Project
	checked bool
}

func (p *denyingProject) CheckProjectExportAccess(ctx context.Context, pid id.ProjectID, op *usecase.Operator) (*project.Project, error) {
	p.checked = true
	return nil, errors.New("unauthorized")
}

func TestToStorage_DeniesBeforeTouchingTheScratchFile(t *testing.T) {
	t.Chdir(t.TempDir())

	deny := &denyingProject{}
	uc := &interfaces.Container{Project: deny}
	pid := id.NewProjectID()

	_, err := ToStorage(context.Background(), uc, nil, pid)
	require.Error(t, err)
	assert.True(t, deny.checked, "CheckProjectExportAccess must be called")

	_, statErr := os.Stat(fmt.Sprintf("%s.zip", pid.String()))
	assert.True(t, os.IsNotExist(statErr), "a denied export must not create the scratch file")
}

func TestToStorageUnique_DeniesBeforeTouchingTheScratchFile(t *testing.T) {
	t.Chdir(t.TempDir())

	deny := &denyingProject{}
	uc := &interfaces.Container{Project: deny}
	pid := id.NewProjectID()

	_, err := ToStorageUnique(context.Background(), uc, nil, pid)
	require.Error(t, err)
	assert.True(t, deny.checked, "CheckProjectExportAccess must be called")

	entries, readErr := os.ReadDir(".")
	require.NoError(t, readErr)
	assert.Empty(t, entries, "a denied export must not create the scratch file")
}

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
