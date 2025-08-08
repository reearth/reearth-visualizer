package gateway

import (
	"context"

	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
)

type PolicyCheckType string

const (
	PolicyCheckPrivateDataTransferUpload     PolicyCheckType = "cms_private_data_transfer_upload_size"
	PolicyCheckPrivateDataTransferDownload   PolicyCheckType = "cms_private_data_transfer_download_size"
	PolicyCheckPublicDataTransferUpload      PolicyCheckType = "cms_public_data_transfer_upload_size"
	PolicyCheckPublicDataTransferDownload    PolicyCheckType = "cms_public_data_transfer_download_size"
	PolicyCheckUploadAssetsSize              PolicyCheckType = "cms_upload_assets_size_from_ui"
	PolicyCheckModelCountPerProject          PolicyCheckType = "cms_model_count_per_project"
	PolicyCheckGeneralPrivateProjectCreation PolicyCheckType = "general_private_project_creation"
	PolicyCheckGeneralPublicProjectCreation  PolicyCheckType = "general_public_project_creation"
)

type PolicyCheckRequest struct {
	WorkspaceID accountdomain.WorkspaceID `json:"workspace_id"`
	CheckType   PolicyCheckType           `json:"check_type"`
	Value       int64                     `json:"value"`
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

func CreateGeneralPolicyCheckRequest(workspaceID accountdomain.WorkspaceID, visibility project.Visibility) PolicyCheckRequest {
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
