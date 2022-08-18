package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestWorkspace_Create(t *testing.T) {
	ctx := context.Background()
	db := memory.New()
	u := user.New().
		NewID().
		Email("aaa@bbb.com").
		Workspace(workspace.NewID()).
		MustBuild()
	uc := NewWorkspace(db)
	op := &usecase.Operator{User: u.ID()}
	ws, err := uc.Create(ctx, "workspace name", u.ID(), op)

	assert.Nil(t, err)
	assert.NotNil(t, ws)

	result, _ := uc.Fetch(
		ctx,
		[]workspace.ID{ws.ID()},
		&usecase.Operator{
			ReadableWorkspaces: []workspace.ID{ws.ID()},
		},
	)

	assert.NotNil(t, result)
	assert.NotEmpty(t, result)
	assert.Equal(t, result[0].ID(), ws.ID())
	assert.Equal(t, result[0].Name(), "workspace name")
	assert.Equal(t, user.WorkspaceIDList{result[0].ID()}, op.OwningWorkspaces)
}

func TestWorkspace_AddMember(t *testing.T) {
	ctx := context.Background()
	p := workspace.NewPolicy(workspace.PolicyOption{
		ID:          workspace.PolicyID("a"),
		MemberCount: lo.ToPtr(1),
	})
	u := user.New().
		NewID().
		Email("aaa@bbb.com").
		Workspace(workspace.NewID()).
		MustBuild()
	u2 := user.New().
		NewID().
		Email("aaa2@bbb.com").
		Workspace(workspace.NewID()).
		MustBuild()
	ws := workspace.New().
		NewID().
		MustBuild()
	wsid2 := workspace.NewID()
	uc := NewWorkspace(&repo.Container{
		Policy:      memory.NewPolicyWith(p),
		User:        memory.NewUserWith(u, u2),
		Workspace:   memory.NewWorkspaceWith(ws),
		Transaction: &memory.Transaction{},
	})

	// normal
	got, err := uc.AddMember(
		ctx,
		ws.ID(),
		u.ID(),
		workspace.RoleOwner,
		&usecase.Operator{
			OwningWorkspaces: []workspace.ID{ws.ID()},
		},
	)
	assert.Equal(t, workspace.New().
		ID(ws.ID()).
		Members(map[user.ID]workspace.Role{
			u.ID(): workspace.RoleOwner,
		}).
		MustBuild(), got)
	assert.NoError(t, err)

	// already added
	got, err = uc.AddMember(
		ctx,
		ws.ID(),
		u.ID(),
		workspace.RoleOwner,
		&usecase.Operator{
			OwningWorkspaces: []workspace.ID{ws.ID()},
		},
	)
	assert.Same(t, workspace.ErrUserAlreadyJoined, err)
	assert.Nil(t, got)

	// operation denied
	got, err = uc.AddMember(
		ctx,
		ws.ID(),
		u2.ID(),
		workspace.RoleOwner,
		&usecase.Operator{
			WritableWorkspaces: []workspace.ID{ws.ID()},
		},
	)
	assert.Same(t, interfaces.ErrOperationDenied, err)
	assert.Nil(t, got)

	// noexistent workspace
	got, err = uc.AddMember(
		ctx,
		wsid2,
		u2.ID(),
		workspace.RoleOwner,
		&usecase.Operator{
			OwningWorkspaces: []workspace.ID{wsid2},
		},
	)
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	// nonexistent user
	got, err = uc.AddMember(
		ctx,
		ws.ID(),
		user.NewID(),
		workspace.RoleOwner,
		&usecase.Operator{
			OwningWorkspaces: []workspace.ID{ws.ID()},
		},
	)
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	// enforce policy
	got, err = uc.AddMember(
		ctx,
		ws.ID(),
		u2.ID(),
		workspace.RoleOwner,
		&usecase.Operator{
			OwningWorkspaces: []workspace.ID{ws.ID()},
			DefaultPolicy:    workspace.PolicyID("a").Ref(),
		},
	)
	assert.Same(t, workspace.ErrOperationDenied, err)
	assert.Nil(t, got)
}
