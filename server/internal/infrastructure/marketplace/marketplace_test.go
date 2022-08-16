package marketplace

import (
	"context"
	"io"
	"net/http"
	"net/url"
	"os"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
	"golang.org/x/oauth2/clientcredentials"
)

func TestMarketplace_FetchPluginPackage(t *testing.T) {
	ac := "xxxxx"
	pid := id.MustPluginID("testplugin~1.0.1")

	f, err := os.Open("testdata/test.zip")
	assert.NoError(t, err)
	defer func() {
		_ = f.Close()
	}()
	z, err := io.ReadAll(f)
	assert.NoError(t, err)

	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder(
		"POST", "https://marketplace.example.com/oauth/token",
		func(req *http.Request) (*http.Response, error) {
			_ = req.ParseForm()
			if req.Form.Get("grant_type") != "client_credentials" {
				return httpmock.NewStringResponse(http.StatusUnauthorized, ""), nil
			}
			if req.Form.Get("audience") != "d" {
				return httpmock.NewStringResponse(http.StatusUnauthorized, ""), nil
			}
			if req.Form.Get("client_id") != "x" {
				return httpmock.NewStringResponse(http.StatusUnauthorized, ""), nil
			}
			if req.Form.Get("client_secret") != "y" {
				return httpmock.NewStringResponse(http.StatusUnauthorized, ""), nil
			}

			resp, err := httpmock.NewJsonResponse(200, map[string]any{
				"access_token": ac,
				"token_type":   "Bearer",
				"expires_in":   86400,
			})
			if err != nil {
				return httpmock.NewStringResponse(http.StatusInternalServerError, ""), nil
			}
			return resp, nil
		},
	)

	/*
		httpmock.RegisterResponder(
			"POST", "https://marketplace.example.com/graphql",
			func(req *http.Request) (*http.Response, error) {
				if req.Header.Get("Authorization") != "Bearer "+ac {
					return httpmock.NewStringResponse(http.StatusUnauthorized, ""), nil
				}
				if req.Header.Get("Content-Type") != "application/json" {
					return httpmock.NewStringResponse(http.StatusBadRequest, ""), nil
				}
				resp, err := httpmock.NewJsonResponse(200, map[string]any{
					"data": map[string]any{
						"node": map[string]string{
							"url": "https://marketplace.example.com/aaa.zip",
						},
					},
				})
				if err != nil {
					return httpmock.NewStringResponse(http.StatusInternalServerError, ""), nil
				}
				return resp, nil
			},
		)
	*/

	httpmock.RegisterResponder(
		"GET", "https://marketplace.example.com/api/plugins/testplugin/1.0.1.zip",
		func(req *http.Request) (*http.Response, error) {
			if req.Header.Get("Authorization") != "Bearer "+ac {
				return httpmock.NewStringResponse(http.StatusUnauthorized, ""), nil
			}
			return httpmock.NewBytesResponse(http.StatusOK, z), nil
		},
	)

	m := New("https://marketplace.example.com/", clientcredentials.Config{
		ClientID:     "x",
		ClientSecret: "y",
		TokenURL:     "https://marketplace.example.com/oauth/token",
		EndpointParams: url.Values{
			"audience": []string{"d"},
		},
	})
	got, err := m.FetchPluginPackage(context.Background(), pid)
	assert.NoError(t, err)
	// no need to test pluginpack in detail here
	assert.Equal(t, id.MustPluginID("testplugin~1.0.1"), got.Manifest.Plugin.ID())
}
