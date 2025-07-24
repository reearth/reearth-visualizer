package gateway

import (
	"context"

	"github.com/reearth/reearthx/account/accountdomain"
)

type PolicyCheckType string

const (
	PolicyCheckPrivateDataTransferUpload     PolicyCheckType = "visualizer_private_data_transfer_upload_size"
	PolicyCheckPrivateDataTransferDownload   PolicyCheckType = "visualizer_private_data_transfer_download_size"
	PolicyCheckPublicDataTransferUpload      PolicyCheckType = "visualizer_public_data_transfer_upload_size"
	PolicyCheckPublicDataTransferDownload    PolicyCheckType = "visualizer_public_data_transfer_download_size"
	PolicyCheckUploadAssetsSize              PolicyCheckType = "visualizer_upload_assets_size_from_ui"
	PolicyCheckModelCountPerProject          PolicyCheckType = "visualizer_model_count_per_project"
	PolicyCheckGeneralPrivateProjectCreation PolicyCheckType = "general_private_project_creation"
	PolicyCheckGeneralPublicProjectCreation  PolicyCheckType = "general_public_project_creation"
)

type PolicyCheckRequest struct {
	WorkspaceID accountdomain.WorkspaceID
	CheckType   PolicyCheckType
	Value       int64
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
