package e2e

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestDashboardClient_GetSubscription ./e2e/...

func TestDashboardClient_GetSubscription(t *testing.T) {

	expected := config.Subscription{
		ID: "sub_1234",
		ContractedPlan: config.ContractedPlan{
			ID:          "plan_001",
			Name:        "Pro Plan",
			PlanType:    "pro",
			Description: "Advanced features",
			Interval:    "monthly",
			Price:       1000,
			PriceUnit:   "JPY",
			Features: config.Features{
				CMS: config.CMSFeatures{
					ModelNumberPerProject: 100,
					PrivateDownloadSize:   "1GB",
					PrivateUploadSize:     "500MB",
					PublicDownloadSize:    "2GB",
					PublicUploadSize:      "1GB",
					UploadAssetSizeFromUI: "100MB",
				},
				General: config.GeneralFeatures{
					PrivateProject: true,
					PublicProject:  true,
				},
				Visualizer: config.VisualizerFeatures{
					AssetSize:          "5GB",
					CustomDomainNumber: 3,
				},
			},
		},
		Seat: config.Seat{
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

	client := &config.DashboardClient{
		BaseURL: ts.URL,
		HTTPClient: &http.Client{
			Timeout: http.DefaultClient.Timeout,
		},
		AuthToken: "Bearer test-token",
	}

	workspaceID, err := accountdomain.WorkspaceIDFrom(wID.String())
	assert.Nil(t, err)

	sub, err := client.GetSubscription(workspaceID)
	assert.NoError(t, err)

	assert.Equal(t, expected.ID, sub.ID)
	assert.Equal(t, expected.Seat.Total, sub.Seat.Total)
	assert.Equal(t, expected.ContractedPlan.Features.CMS.ModelNumberPerProject, sub.ContractedPlan.Features.CMS.ModelNumberPerProject)
}
