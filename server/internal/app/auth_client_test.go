package app

import (
	"context"
	"testing"

	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildAccountDomainUserFromUserModel_HiddenEmail(t *testing.T) {
	in := accountsUser.New().NewID().Name("other").OptionalEmail("").Workspace(accountsUser.NewWorkspaceID()).MustBuild()

	u, err := buildAccountDomainUserFromUserModel(context.Background(), in)
	require.NoError(t, err)
	assert.Equal(t, in.ID(), u.ID())
	assert.Equal(t, "", u.Email())
}
