package projectexport

import (
	"context"
	"errors"
	"fmt"
	"os"
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
