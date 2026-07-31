package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
)

// TestStyle_CrossTenantIDOR is a regression test for SEC-01
// (eukarya-inc/compliance#50): AddStyle/UpdateStyle/RemoveStyle/
// DuplicateStyle must reject an operator that has no write access to the
// style's scene, even though the scene/style ID came straight from the
// client. Before the fix, the CanWriteScene check was commented out (or,
// for UpdateStyle, missing entirely), so any authenticated operator could
// mutate a style belonging to a scene/workspace they had no role in.
func TestStyle_CrossTenantIDOR(t *testing.T) {
	ctx := context.Background()
	db := memory.New()

	prj, _ := project.New().NewID().Build()
	_ = db.Project.Save(ctx, prj)
	victimScene, _ := scene.New().NewID().Workspace(accountsID.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, victimScene)

	uc := NewStyle(db)

	attacker := &usecase.Operator{
		WritableScenes: id.SceneIDList{id.NewSceneID()}, // some other scene, not victimScene
	}
	owner := &usecase.Operator{
		WritableScenes: id.SceneIDList{victimScene.ID()},
	}

	t.Run("AddStyle denies an operator with no write access to the target scene", func(t *testing.T) {
		s, err := uc.AddStyle(ctx, interfaces.AddStyleInput{
			SceneID: victimScene.ID(),
			Name:    "attacker style",
		}, attacker)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
		assert.Nil(t, s)
	})

	// Seed a legitimate style in the victim's scene for the remaining cases.
	victimStyle, err := uc.AddStyle(ctx, interfaces.AddStyleInput{
		SceneID: victimScene.ID(),
		Name:    "victim style",
	}, owner)
	assert.NoError(t, err)

	t.Run("UpdateStyle denies an operator with no write access to the style's scene", func(t *testing.T) {
		newName := "renamed by attacker"
		s, err := uc.UpdateStyle(ctx, interfaces.UpdateStyleInput{
			StyleID: victimStyle.ID(),
			Name:    &newName,
		}, attacker)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
		assert.Nil(t, s)
	})

	t.Run("DuplicateStyle denies an operator with no write access to the style's scene", func(t *testing.T) {
		s, err := uc.DuplicateStyle(ctx, victimStyle.ID(), attacker)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
		assert.Nil(t, s)
	})

	t.Run("RemoveStyle denies an operator with no write access to the style's scene", func(t *testing.T) {
		_, err := uc.RemoveStyle(ctx, victimStyle.ID(), attacker)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
	})

	t.Run("the legitimate owner can still write", func(t *testing.T) {
		newName := "renamed by owner"
		s, err := uc.UpdateStyle(ctx, interfaces.UpdateStyleInput{
			StyleID: victimStyle.ID(),
			Name:    &newName,
		}, owner)
		assert.NoError(t, err)
		assert.Equal(t, newName, s.Name())
	})
}
