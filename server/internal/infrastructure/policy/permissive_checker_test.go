package policy

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestNewPermissiveChecker(t *testing.T) {
	checker := NewPermissiveChecker()
	assert.NotNil(t, checker)
}

func TestPermissiveChecker_CheckPolicy(t *testing.T) {
	ctx := context.Background()
	checker := NewPermissiveChecker()

	wid := accountdomain.NewWorkspaceID()

	tests := []struct {
		name string
		req  gateway.PolicyCheckRequest
		want *gateway.PolicyCheckResponse
	}{
		{
			name: "upload asset size check",
			req: gateway.PolicyCheckRequest{
				WorkspaceID: wid,
				CheckType:   gateway.PolicyCheckUploadAssetsSize,
				Value:       1024 * 1024 * 1024, // 1GB
			},
			want: &gateway.PolicyCheckResponse{
				Allowed:      true,
				CheckType:    gateway.PolicyCheckUploadAssetsSize,
				CurrentLimit: "unlimited",
				Message:      "No restrictions in OSS version",
				Value:        1024 * 1024 * 1024,
			},
		},
		{
			name: "private project creation check",
			req: gateway.PolicyCheckRequest{
				WorkspaceID: wid,
				CheckType:   gateway.PolicyCheckGeneralPrivateProjectCreation,
				Value:       1,
			},
			want: &gateway.PolicyCheckResponse{
				Allowed:      true,
				CheckType:    gateway.PolicyCheckGeneralPrivateProjectCreation,
				CurrentLimit: "unlimited",
				Message:      "No restrictions in OSS version",
				Value:        1,
			},
		},
		{
			name: "public project creation check",
			req: gateway.PolicyCheckRequest{
				WorkspaceID: wid,
				CheckType:   gateway.PolicyCheckGeneralPublicProjectCreation,
				Value:       1,
			},
			want: &gateway.PolicyCheckResponse{
				Allowed:      true,
				CheckType:    gateway.PolicyCheckGeneralPublicProjectCreation,
				CurrentLimit: "unlimited",
				Message:      "No restrictions in OSS version",
				Value:        1,
			},
		},
		{
			name: "model count per project check",
			req: gateway.PolicyCheckRequest{
				WorkspaceID: wid,
				CheckType:   gateway.PolicyCheckModelCountPerProject,
				Value:       100,
			},
			want: &gateway.PolicyCheckResponse{
				Allowed:      true,
				CheckType:    gateway.PolicyCheckModelCountPerProject,
				CurrentLimit: "unlimited",
				Message:      "No restrictions in OSS version",
				Value:        100,
			},
		},
		{
			name: "private data transfer upload check",
			req: gateway.PolicyCheckRequest{
				WorkspaceID: wid,
				CheckType:   gateway.PolicyCheckPrivateDataTransferUpload,
				Value:       1024 * 1024 * 1024 * 10, // 10GB
			},
			want: &gateway.PolicyCheckResponse{
				Allowed:      true,
				CheckType:    gateway.PolicyCheckPrivateDataTransferUpload,
				CurrentLimit: "unlimited",
				Message:      "No restrictions in OSS version",
				Value:        1024 * 1024 * 1024 * 10,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := checker.CheckPolicy(ctx, tt.req)
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestPermissiveChecker_AlwaysAllows(t *testing.T) {
	ctx := context.Background()
	checker := NewPermissiveChecker()

	// Test with extreme values to ensure it always allows
	req := gateway.PolicyCheckRequest{
		WorkspaceID: accountdomain.NewWorkspaceID(),
		CheckType:   gateway.PolicyCheckUploadAssetsSize,
		Value:       int64(1 << 62), // Extremely large value
	}

	resp, err := checker.CheckPolicy(ctx, req)
	assert.NoError(t, err)
	assert.True(t, resp.Allowed)
	assert.Equal(t, "unlimited", resp.CurrentLimit)
	assert.Equal(t, "No restrictions in OSS version", resp.Message)
}
