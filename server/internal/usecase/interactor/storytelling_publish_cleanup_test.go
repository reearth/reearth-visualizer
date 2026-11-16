package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestStorytelling_Publish_UnpublishRemovesStoryFile(t *testing.T) {
	ctx := context.Background()

	mockPolicyChecker := new(MockPolicyChecker)
	mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
		Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
		Maybe()

	db := memory.New()
	wsID := accountsID.NewWorkspaceID()
	ws := accountsWorkspace.New().ID(wsID).MustBuild()
	require.NoError(t, db.Workspace.Save(ctx, ws))

	repos := &repo.Container{
		User:            db.User,
		Workspace:       db.Workspace,
		Project:         db.Project,
		ProjectMetadata: db.ProjectMetadata,
		Scene:           db.Scene,
		Property:        db.Property,
		PropertySchema:  db.PropertySchema,
		Asset:           db.Asset,
		Plugin:          db.Plugin,
		NLSLayer:        db.NLSLayer,
		Style:           db.Style,
		Storytelling:    db.Storytelling,
		SceneLock:       db.SceneLock,
		Transaction:     &usecasex.NopTransaction{},
	}

	fileGateway := lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com"))
	gateways := &gateway.Container{
		File:          fileGateway,
		PolicyChecker: mockPolicyChecker,
	}

	storytellingUC := NewStorytelling(repos, gateways)

	prj := project.New().NewID().Workspace(wsID).Name("Test Project").MustBuild()
	require.NoError(t, db.Project.Save(ctx, prj))
	sc := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
	require.NoError(t, db.Scene.Save(ctx, sc))

	operator := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{wsID},
			OwningWorkspaces:   accountsID.WorkspaceIDList{wsID},
		},
		WritableScenes: []id.SceneID{sc.ID()},
	}

	story := storytelling.NewStory().NewID().Scene(sc.ID()).Title("Test Story").MustBuild()
	require.NoError(t, db.Storytelling.Save(ctx, *story))

	published, err := storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
		ID:     story.Id(),
		Status: storytelling.PublishmentStatusPublic,
	}, operator)
	require.NoError(t, err)
	storyAlias := published.Alias()
	require.NotEmpty(t, storyAlias)

	r, err := fileGateway.ReadStoryFile(ctx, storyAlias)
	require.NoError(t, err, "story file should exist right after publishing")
	_ = r.Close()

	_, err = storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
		ID:     story.Id(),
		Status: storytelling.PublishmentStatusPrivate,
	}, operator)
	require.NoError(t, err)

	_, err = fileGateway.ReadStoryFile(ctx, storyAlias)
	assert.ErrorIs(t, err, rerror.ErrNotFound, "story file must be removed from storage after unpublish")
}
