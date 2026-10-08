package mongodoc

import (
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/stretchr/testify/assert"
)

func TestProjectDocument_CreatedByUpdatedBy_RoundTrip(t *testing.T) {
	creator := accountsID.NewUserID().String()
	editor := accountsID.NewUserID().String()

	p := project.New().
		NewID().
		Workspace(accountsID.NewWorkspaceID()).
		Name("round trip").
		CreatedBy(creator).
		UpdatedBy(editor).
		MustBuild()

	doc, _ := NewProject(p)
	assert.Equal(t, creator, doc.CreatedBy)
	assert.Equal(t, editor, doc.UpdatedBy)

	got, err := doc.Model()
	assert.NoError(t, err)
	assert.Equal(t, creator, got.CreatedBy())
	assert.Equal(t, editor, got.UpdatedBy())
}

func TestProjectDocument_CreatedByUpdatedBy_EmptyForLegacy(t *testing.T) {
	// Projects created before these fields existed have no actor recorded and
	// must round-trip as empty strings rather than failing.
	p := project.New().
		NewID().
		Workspace(accountsID.NewWorkspaceID()).
		Name("legacy").
		MustBuild()

	doc, _ := NewProject(p)
	assert.Equal(t, "", doc.CreatedBy)
	assert.Equal(t, "", doc.UpdatedBy)

	got, err := doc.Model()
	assert.NoError(t, err)
	assert.Equal(t, "", got.CreatedBy())
	assert.Equal(t, "", got.UpdatedBy())
}
