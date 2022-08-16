package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/stretchr/testify/assert"
)

func TestWorkspace_Create(t *testing.T) {
	ctx := context.Background()

	db := memory.New()

	u := user.New().NewID().Email("aaa@bbb.com").Team(workspace.NewID()).MustBuild()
	uc := NewWorkspace(db)
	op := &usecase.Operator{User: u.ID()}
	ws, err := uc.Create(ctx, "workspace name", u.ID(), op)

	assert.Nil(t, err)
	assert.NotNil(t, ws)

	resultTeams, _ := uc.Fetch(ctx, []workspace.ID{ws.ID()}, &usecase.Operator{
		ReadableTeams: []workspace.ID{ws.ID()},
	})

	assert.NotNil(t, resultTeams)
	assert.NotEmpty(t, resultTeams)
	assert.Equal(t, resultTeams[0].ID(), ws.ID())
	assert.Equal(t, resultTeams[0].Name(), "workspace name")
	assert.Equal(t, user.TeamIDList{resultTeams[0].ID()}, op.OwningTeams)
}
