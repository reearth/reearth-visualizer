package scene

import (
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/id"

	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestScene_SetUpdatedAt(t *testing.T) {
	s := New().NewID().Workspace(accountsID.NewWorkspaceID()).UpdatedAt(time.Date(1999, 1, 1, 00, 00, 1, 1, time.UTC)).MustBuild()
	s.SetUpdatedAt(time.Date(2021, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.Equal(t, time.Date(2021, 1, 1, 00, 00, 1, 1, time.UTC), s.UpdatedAt())
	s = nil
	s.SetUpdatedAt(time.Date(2020, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.NotEqual(t, time.Date(2020, 1, 1, 00, 00, 1, 1, time.UTC), s.UpdatedAt())
}

func TestScene_Properties(t *testing.T) {
	pid1 := id.NewPropertyID()
	pid2 := id.NewPropertyID()
	s := New().
		NewID().
		Workspace(accountsID.NewWorkspaceID()).
		Property(pid1).
		Widgets(
			NewWidgets([]*Widget{
				MustWidget(id.NewWidgetID(), id.MustPluginID("xxx~1.1.1"), "eee", pid2, true, false),
			}, nil),
		).
		MustBuild()

	assert.Equal(t, []id.PropertyID{pid1, pid2}, s.Properties())
}

func TestSceneNil(t *testing.T) {
	var s *Scene
	assert.Nil(t, s.Properties())
	assert.True(t, s.ID().IsEmpty())
	assert.Nil(t, s.Widgets())
	assert.True(t, s.Project().IsEmpty())
	assert.True(t, s.Workspace().IsEmpty())
	assert.True(t, s.CreatedAt().IsZero())
	assert.Nil(t, s.Plugins())
	assert.True(t, s.Property().IsEmpty())
}
