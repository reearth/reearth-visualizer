package interactor

import (
	"context"
	"net/url"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestProject_Create(t *testing.T) {
	ctx := context.Background()

	po := workspace.NewPolicy(workspace.PolicyOption{
		ID:           workspace.PolicyID("policy"),
		ProjectCount: lo.ToPtr(1),
	})

	uc := &Project{
		projectRepo:   memory.NewProject(),
		workspaceRepo: memory.NewWorkspace(),
		transaction:   &usecasex.NopTransaction{},
		policyRepo:    memory.NewPolicyWith(po),
	}

	ws := workspace.New().NewID().Policy(workspace.PolicyID("policy").Ref()).MustBuild()
	wsid2 := workspace.NewID()
	_ = uc.workspaceRepo.Save(ctx, ws)
	pid := project.NewID()
	defer project.MockNewID(pid)()

	// normal
	got, err := uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
		Name:        lo.ToPtr("aaa"),
		Description: lo.ToPtr("bbb"),
		ImageURL:    lo.Must(url.Parse("https://example.com/hoge.gif")),
		Alias:       lo.ToPtr("aliasalias"),
		Archived:    lo.ToPtr(false),
	}, &usecase.Operator{
		WritableWorkspaces: workspace.IDList{ws.ID()},
	})
	want := project.New().
		ID(pid).
		Workspace(ws.ID()).
		Name("aaa").
		Description("bbb").
		ImageURL(lo.Must(url.Parse("https://example.com/hoge.gif"))).
		Alias("aliasalias").
		Visualizer(visualizer.VisualizerCesium).
		UpdatedAt(got.UpdatedAt()).
		MustBuild()
	assert.NoError(t, err)
	assert.Equal(t, want, got)
	assert.Equal(t, want, lo.Must(uc.projectRepo.FindByID(ctx, pid)))

	// nonexistent workspace
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: wsid2,
		Visualizer:  visualizer.VisualizerCesium,
	}, &usecase.Operator{
		WritableWorkspaces: workspace.IDList{wsid2},
	})
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	// operation denied
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
	}, &usecase.Operator{
		ReadableWorkspaces: workspace.IDList{ws.ID()},
	})
	assert.Same(t, interfaces.ErrOperationDenied, err)
	assert.Nil(t, got)

	// policy
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
	}, &usecase.Operator{
		WritableWorkspaces: workspace.IDList{ws.ID()},
	})
	assert.Same(t, workspace.ErrPolicyViolation, err)
	assert.Nil(t, got)
}
