package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/workspace"
)

var (
	ErrOwnerCannotLeaveWorkspace = errors.New("owner user cannot leave from the workspace")
	ErrCannotChangeOwnerRole     = errors.New("cannot change the role of the workspace owner")
	ErrCannotDeleteWorkspace     = errors.New("cannot delete the workspace because at least one project is left")
)

type Workspace interface {
	Fetch(context.Context, []workspace.ID, *usecase.Operator) ([]*workspace.Workspace, error)
	FindByUser(context.Context, workspace.UserID, *usecase.Operator) ([]*workspace.Workspace, error)
	Create(context.Context, string, workspace.UserID, *usecase.Operator) (*workspace.Workspace, error)
	Update(context.Context, workspace.ID, string, *usecase.Operator) (*workspace.Workspace, error)
	AddMember(context.Context, workspace.ID, workspace.UserID, workspace.Role, *usecase.Operator) (*workspace.Workspace, error)
	RemoveMember(context.Context, workspace.ID, workspace.UserID, *usecase.Operator) (*workspace.Workspace, error)
	UpdateMember(context.Context, workspace.ID, workspace.UserID, workspace.Role, *usecase.Operator) (*workspace.Workspace, error)
	Remove(context.Context, workspace.ID, *usecase.Operator) error
}
