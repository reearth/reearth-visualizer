package e2e

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth/server/internal/app/dashbord"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestDashboardClient ./e2e/...

func buildClient(URL string) *dashbord.DashboardClient {
	return &dashbord.DashboardClient{
		BaseURL: URL,
		HTTPClient: &http.Client{
			Timeout: http.DefaultClient.Timeout,
		},
		AuthToken: "Bearer test-token",
	}
}

func TestDashboardClient_GetSubscription(t *testing.T) {

	expected := dashbord.Subscription{
		ID: "sub_1234",
		ContractedPlan: dashbord.ContractedPlan{
			ID:          "plan_001",
			Name:        "Pro Plan",
			PlanType:    "pro",
			Description: "Advanced features",
			Interval:    "monthly",
			Price:       1000,
			PriceUnit:   "JPY",
			Features: dashbord.Features{
				CMS: dashbord.CMSFeatures{
					ModelNumberPerProject: 100,
					PrivateDownloadSize:   "1GB",
					PrivateUploadSize:     "500MB",
					PublicDownloadSize:    "2GB",
					PublicUploadSize:      "1GB",
					UploadAssetSizeFromUI: "100MB",
				},
				General: dashbord.GeneralFeatures{
					PrivateProject: true,
					PublicProject:  true,
				},
				Visualizer: dashbord.VisualizerFeatures{
					AssetSize:          "5GB",
					CustomDomainNumber: 3,
				},
			},
		},
		Seat: dashbord.Seat{
			Total: 10,
			Used:  5,
		},
	}

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/api/workspaces/"+wID.String()+"/subscription", r.URL.Path)
		assert.Equal(t, "Bearer test-token", r.Header.Get("Authorization"))
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(expected)
		assert.Nil(t, err)
	}))
	defer ts.Close()

	workspaceID, err := accountdomain.WorkspaceIDFrom(wID.String())
	assert.Nil(t, err)

	client := buildClient(ts.URL)
	sub, err := client.GetSubscription(workspaceID)
	assert.NoError(t, err)

	assert.Equal(t, expected.ID, sub.ID)
	assert.Equal(t, expected.Seat.Total, sub.Seat.Total)
	assert.Equal(t, expected.ContractedPlan.Features.CMS.ModelNumberPerProject, sub.ContractedPlan.Features.CMS.ModelNumberPerProject)
}

func TestDashboardClient_CheckPlanConstraints(t *testing.T) {

	expectedResp := dashbord.PlanConstraintCheckResponse{
		Allowed:      true,
		CheckType:    "cms_private_data_transfer_upload_size",
		CurrentLimit: "500MB",
		Message:      "OK",
		Value:        float64(100),
	}
	expectedReq := dashbord.PlanConstraintCheckRequest{
		CheckType: "cms_private_data_transfer_upload_size",
		Value:     float64(100),
	}

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t,
			"/api/workspaces/"+wID.String()+"/check-plan-constraints",
			r.URL.Path,
		)
		assert.Equal(t, http.MethodPost, r.Method)
		assert.Equal(t, "Bearer test-token", r.Header.Get("Authorization"))

		var gotReq dashbord.PlanConstraintCheckRequest
		err := json.NewDecoder(r.Body).Decode(&gotReq)
		assert.NoError(t, err)
		assert.Equal(t, expectedReq, gotReq)

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(expectedResp)
		assert.NoError(t, err)
	}))
	defer ts.Close()

	client := buildClient(ts.URL)
	res, err := client.CheckPlanConstraints(wID, expectedReq)
	assert.NoError(t, err)

	assert.Equal(t, expectedResp.Allowed, res.Allowed)
	assert.Equal(t, expectedResp.CurrentLimit, res.CurrentLimit)
	assert.Equal(t, expectedResp.Message, res.Message)
	assert.Equal(t, expectedResp.Value, res.Value)
}
