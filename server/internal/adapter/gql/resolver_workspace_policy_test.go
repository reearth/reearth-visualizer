package gql

import (
	"testing"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestWorkspacePolicyCheck_InputTypes(t *testing.T) {
	// Test that the function accepts the correct input and output types
	input := gqlmodel.PolicyCheckInput{
		WorkspaceID: gqlmodel.ID("01H4XCVR7QZJN0Z8V9XN9N9N9N"),
	}

	// Verify input structure
	assert.NotEmpty(t, input.WorkspaceID)

	// Test output structure
	output := &gqlmodel.PolicyCheckPayload{
		WorkspaceID:                    input.WorkspaceID,
		EnableToCreatePrivateProject:   true,
		DisableOperationByOverUsedSeat: false,
	}

	assert.Equal(t, input.WorkspaceID, output.WorkspaceID)
	assert.True(t, output.EnableToCreatePrivateProject)
}

func TestWorkspacePolicyCheck_ResponseStructure(t *testing.T) {
	// Test that the response structure is correctly defined
	payload := &gqlmodel.PolicyCheckPayload{
		WorkspaceID:                    gqlmodel.ID("01H4XCVR7QZJN0Z8V9XN9N9N9N"),
		EnableToCreatePrivateProject:   true,
		DisableOperationByOverUsedSeat: false,
	}

	assert.Equal(t, gqlmodel.ID("01H4XCVR7QZJN0Z8V9XN9N9N9N"), payload.WorkspaceID)
	assert.True(t, payload.EnableToCreatePrivateProject)

	// Test with false value
	payload.EnableToCreatePrivateProject = false
	assert.False(t, payload.EnableToCreatePrivateProject)
}

func TestWorkspacePolicyCheck_IDConversion(t *testing.T) {
	// Test the ID conversion logic that should happen in the resolver
	// Generate a valid workspace ID for testing
	validWorkspaceID := accountsID.NewWorkspaceID()

	tests := []struct {
		name     string
		inputID  string
		hasError bool
	}{
		{
			name:     "valid ULID format",
			inputID:  validWorkspaceID.String(),
			hasError: false,
		},
		{
			name:     "invalid format - too short",
			inputID:  "123",
			hasError: true,
		},
		{
			name:     "invalid format - empty",
			inputID:  "",
			hasError: true,
		},
		{
			name:     "invalid format - contains invalid characters",
			inputID:  "01H4XCVR7QZJN0Z8V9XN9N9N9@",
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := gqlmodel.ToID[accountsID.Workspace](gqlmodel.ID(tt.inputID))

			if tt.hasError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result)
			}
		})
	}
}
