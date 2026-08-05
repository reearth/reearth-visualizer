package app

import (
	"context"
	"testing"

	accountsGateway "github.com/reearth/reearth-accounts/server/pkg/gateway"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"go.uber.org/mock/gomock"
)

// TestBuildUsecases_FiltersAccountsWorkspaceRepo is a regression test: BuildUsecases used to read
// the operator's AcOperator via adapter.AcOperator(ctx), which type-asserted the wrong concrete
// type out of the "contextOperator" context key (AttachOperator stores a *usecase.Operator, not a
// *accountsWorkspace.Operator) and so always returned nil. As a result, the accounts-side
// Workspace repo (ar2) was never filtered by the requesting operator, for any request, regardless
// of whether one was actually authenticated.
//
// This confirms Filtered is actually invoked on the accounts Workspace repo when a real operator
// with a populated AcOperator is present on the context, and is not invoked when no operator (or
// no AcOperator) is present.
func TestBuildUsecases_FiltersAccountsWorkspaceRepo(t *testing.T) {
	r := memory.New()
	g := &gateway.Container{}
	ag := &accountsGateway.Container{}
	config := interactor.ContainerConfig{}

	t.Run("operator with AcOperator present: Workspace repo is filtered", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockWorkspaceRepo := accountsWorkspace.NewMockRepo(ctrl)
		mockWorkspaceRepo.EXPECT().Filtered(gomock.Any()).Return(mockWorkspaceRepo).Times(1)
		ar := &accountsInfra.Container{Workspace: mockWorkspaceRepo}

		op := &usecase.Operator{
			AcOperator: &accountsWorkspace.Operator{
				OwningWorkspaces: accountsID.WorkspaceIDList{accountsID.NewWorkspaceID()},
			},
		}
		ctx := adapter.AttachOperator(context.Background(), op)

		BuildUsecases(ctx, r, g, ar, ag, config)
	})

	t.Run("no operator on context: Workspace repo is not filtered", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockWorkspaceRepo := accountsWorkspace.NewMockRepo(ctrl)
		// No EXPECT().Filtered(...) set: an unexpected call fails the test immediately.
		ar := &accountsInfra.Container{Workspace: mockWorkspaceRepo}

		BuildUsecases(context.Background(), r, g, ar, ag, config)
	})
}
