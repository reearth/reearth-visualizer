package dashbord

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

type Subscription struct {
	ContractedPlan ContractedPlan `json:"contracted_plan"`
	ID             string         `json:"id"`
	Seat           Seat           `json:"seat"`
}

type ContractedPlan struct {
	Description string   `json:"description"`
	Features    Features `json:"features"`
	ID          string   `json:"id"`
	Interval    string   `json:"interval"`
	Name        string   `json:"name"`
	PlanType    string   `json:"plan_type"`
	Price       int      `json:"price"`
	PriceUnit   string   `json:"price_unit"`
}

type Features struct {
	CMS        CMSFeatures        `json:"cms"`
	General    GeneralFeatures    `json:"general"`
	Visualizer VisualizerFeatures `json:"visualizer"`
}

type CMSFeatures struct {
	ModelNumberPerProject int    `json:"model_number_per_project"`
	PrivateDownloadSize   string `json:"private_download_size"`
	PrivateUploadSize     string `json:"private_upload_size"`
	PublicDownloadSize    string `json:"public_download_size"`
	PublicUploadSize      string `json:"public_upload_size"`
	UploadAssetSizeFromUI string `json:"upload_asset_size_from_ui"`
}

type GeneralFeatures struct {
	PrivateProject bool `json:"private_project"`
	PublicProject  bool `json:"public_project"`
}

type VisualizerFeatures struct {
	AssetSize          string `json:"asset_size"`
	CustomDomainNumber int    `json:"custom_domain_number"`
}

type Seat struct {
	Total int `json:"total"`
	Used  int `json:"used"`
}

type DashboardClient struct {
	BaseURL    string
	HTTPClient *http.Client
	AuthToken  string
}

func NewDashboardClient(ctx context.Context) *DashboardClient {
	dashboardApi := adapter.DashboardApi(ctx)
	authInfo := adapter.GetAuthInfo(ctx)
	return &DashboardClient{
		BaseURL: dashboardApi,
		HTTPClient: &http.Client{
			Timeout: time.Second * 30,
		},
		AuthToken: authInfo.Token,
	}
}
func (c *DashboardClient) GetSubscription(workspaceID workspace.ID) (*Subscription, error) {
	url := fmt.Sprintf("%s/api/workspaces/%s/subscription", c.BaseURL, workspaceID.String())

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("request error: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", c.AuthToken)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request error: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("response error: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("http: status code %d, response error: %s", resp.StatusCode, string(body))
	}

	var subscription Subscription
	if err := json.Unmarshal(body, &subscription); err != nil {
		return nil, fmt.Errorf("json response error: %w", err)
	}

	return &subscription, nil
}

type PlanConstraintCheckRequest struct {
	CheckType string      `json:"check_type"`
	Value     interface{} `json:"value"`
}

type PlanConstraintCheckResponse struct {
	Allowed      bool        `json:"allowed"`
	CheckType    string      `json:"check_type"`
	CurrentLimit string      `json:"current_limit"`
	Message      string      `json:"message"`
	Value        interface{} `json:"value"`
}

type PlanConstraintCheckError struct {
	Description string `json:"description"`
	FieldErrors []struct {
		Description string `json:"description"`
		Field       string `json:"field"`
		Message     string `json:"message"`
	} `json:"field_errors"`
	Message     string `json:"message"`
	Status      int    `json:"status"`
	SystemError string `json:"system_error"`
}

func (c *DashboardClient) CheckPlanConstraints(workspaceID workspace.ID, reqData PlanConstraintCheckRequest) (*PlanConstraintCheckResponse, error) {
	url := fmt.Sprintf("%s/api/workspaces/%s/check-plan-constraints", c.BaseURL, workspaceID.String())

	bodyBytes, err := json.Marshal(reqData)
	if err != nil {
		return nil, fmt.Errorf("marshal error: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("request creation error: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", c.AuthToken)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request error: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("response read error: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errResp PlanConstraintCheckError
		if err := json.Unmarshal(respBody, &errResp); err != nil {
			return nil, fmt.Errorf("unexpected error (status %d): %s", resp.StatusCode, string(respBody))
		}
		return nil, fmt.Errorf("api error (status %d): %s", errResp.Status, errResp.Message)
	}

	var result PlanConstraintCheckResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("json response error: %w", err)
	}

	return &result, nil
}
