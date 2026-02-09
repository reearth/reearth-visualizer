package gateway

import (
	"context"

	"github.com/reearth/reearth/server/pkg/project"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type PolicyCheckType string

const (
	PolicyCheckUploadAssetsSize              PolicyCheckType = "visualizer_asset_size"
	PolicyCheckCustomDomainCreation          PolicyCheckType = "visualizer_custom_domain_creation"
	PolicyCheckCustomDomainCount             PolicyCheckType = "visualizer_custom_domain_count"
	PolicyCheckGeneralPrivateProjectCreation PolicyCheckType = "general_private_project_creation"
	PolicyCheckGeneralPublicProjectCreation  PolicyCheckType = "general_public_project_creation"
	PolicyCheckGeneralOperationAllowed       PolicyCheckType = "general_operation_allowed"
)

type PolicyCheckRequest struct {
	WorkspaceID accountsID.WorkspaceID `json:"workspace_id"`
	CheckType   PolicyCheckType        `json:"check_type"`
	Value       int64                  `json:"value"`
}

type PolicyCheckResponse struct {
	Allowed      bool
	CheckType    PolicyCheckType
	CurrentLimit string
	Message      string
	Value        int64
}

type PolicyChecker interface {
	CheckPolicy(ctx context.Context, req PolicyCheckRequest) (*PolicyCheckResponse, error)
}

func CreateGeneralPolicyCheckRequest(workspaceID accountsID.WorkspaceID, visibility project.Visibility) PolicyCheckRequest {
	var checkType PolicyCheckType
	if visibility == project.VisibilityPublic {
		checkType = PolicyCheckGeneralPublicProjectCreation
	} else {
		checkType = PolicyCheckGeneralPrivateProjectCreation
	}

	return PolicyCheckRequest{
		WorkspaceID: workspaceID,
		CheckType:   checkType,
		Value:       1,
	}
}

func CreateGeneralOperationAllowedCheckRequest(workspaceID accountsID.WorkspaceID) PolicyCheckRequest {
	return PolicyCheckRequest{
		WorkspaceID: workspaceID,
		CheckType:   PolicyCheckGeneralOperationAllowed,
		Value:       1,
	}
}

func CreateCustomDomainCreationCheckRequest(workspaceID accountsID.WorkspaceID) PolicyCheckRequest {
	return PolicyCheckRequest{
		WorkspaceID: workspaceID,
		CheckType:   PolicyCheckCustomDomainCreation,
		Value:       1,
	}
}

func CreateCustomDomainCountCheckRequest(workspaceID accountsID.WorkspaceID) PolicyCheckRequest {
	return PolicyCheckRequest{
		WorkspaceID: workspaceID,
		CheckType:   PolicyCheckCustomDomainCount,
		Value:       1,
	}
}
