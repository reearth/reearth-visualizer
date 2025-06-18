package config

import (
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
		return nil, fmt.Errorf("Request Error: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", c.AuthToken)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Request Error: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("Response Error: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP: Status code %d, Response Error: %s", resp.StatusCode, string(body))
	}

	var subscription Subscription
	if err := json.Unmarshal(body, &subscription); err != nil {
		return nil, fmt.Errorf("JSON Response Error: %w", err)
	}

	return &subscription, nil
}
