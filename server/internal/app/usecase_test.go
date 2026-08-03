package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	accountsGateway "github.com/reearth/reearth-accounts/server/pkg/gateway"
)

// TestUsecaseMiddleware_WorkspaceScoping is a regression test for SEC-01: any authenticated
// user could read another workspace's projects (including private ones) because the
// workspace/scene filters were never applied to the repos.
//
// UsecaseMiddleware only filters by workspace when an operator is already present on the
// context (see usecase.go). In production this is only true on apiPrivateRoute, after the
// auth middleware has run — see the two registrations of newUsecaseMiddleware in app.go. This
// test exercises that exact conditional directly: it proves that once an operator is on the
// context, cross-tenant reads are denied, while same-tenant reads still work.
func TestUsecaseMiddleware_WorkspaceScoping(t *testing.T) {
	repos := memory.New()
	ar := repos.AccountRepos()
	g := &gateway.Container{}
	ag := &accountsGateway.Container{}

	myWorkspace := accountsID.NewWorkspaceID()
	otherWorkspace := accountsID.NewWorkspaceID()

	myProject := project.New().NewID().Workspace(myWorkspace).Name("my own project").CoreSupport(true).MustBuild()
	require.NoError(t, repos.Project.Save(context.Background(), myProject))

	otherProject := project.New().NewID().Workspace(otherWorkspace).Name("other tenant's private project").CoreSupport(true).Visibility(project.VisibilityPrivate).MustBuild()
	require.NoError(t, repos.Project.Save(context.Background(), otherProject))

	middleware := UsecaseMiddleware(repos, g, ar, ag, interactor.ContainerConfig{})

	// runMiddleware simulates one request through UsecaseMiddleware and returns the usecase
	// container it attaches to the context, so tests can inspect how it behaves.
	runMiddleware := func(ctx context.Context) *interfaces.Container {
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/", nil).WithContext(ctx)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		var captured context.Context
		next := func(c echo.Context) error {
			captured = c.Request().Context()
			return nil
		}
		require.NoError(t, middleware(next)(c))

		uc := adapter.Usecases(captured)
		require.NotNil(t, uc)
		return uc
	}

	t.Run("no operator on context (mirrors the global, pre-auth registration): unfiltered", func(t *testing.T) {
		uc := runMiddleware(context.Background())

		got, _, err := uc.Project.FindByWorkspace(context.Background(), otherWorkspace, nil, nil, nil, nil)
		assert.NoError(t, err)
		require.Len(t, got, 1)
		assert.Equal(t, otherProject.ID(), got[0].ID())
	})

	t.Run("operator present on context (mirrors apiPrivateRoute after auth): scoped to the operator's own workspaces", func(t *testing.T) {
		op := &usecase.Operator{
			AcOperator: &accountsWorkspace.Operator{
				OwningWorkspaces: accountsID.WorkspaceIDList{myWorkspace},
			},
		}
		ctx := adapter.AttachOperator(context.Background(), op)
		uc := runMiddleware(ctx)

		t.Run("cross-tenant read of another workspace's private project is denied", func(t *testing.T) {
			got, _, err := uc.Project.FindByWorkspace(context.Background(), otherWorkspace, nil, nil, nil, op)
			assert.NoError(t, err)
			assert.Empty(t, got, "SEC-01 regression: an authenticated user must not be able to read another workspace's projects")
		})

		t.Run("read of the operator's own workspace still works", func(t *testing.T) {
			got, _, err := uc.Project.FindByWorkspace(context.Background(), myWorkspace, nil, nil, nil, op)
			assert.NoError(t, err)
			require.Len(t, got, 1)
			assert.Equal(t, myProject.ID(), got[0].ID())
		})
	})
}
