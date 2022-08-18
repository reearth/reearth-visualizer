package mongo

import (
	"context"
	"testing"

	"github.com/caos/oidc/pkg/oidc"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/auth"
	"github.com/stretchr/testify/assert"
)

func TestAuthRequestRepo(t *testing.T) {
	tests := []struct {
		Name     string
		Expected struct {
			Name        string
			AuthRequest *auth.Request
		}
	}{
		{
			Expected: struct {
				Name        string
				AuthRequest *auth.Request
			}{
				AuthRequest: auth.NewRequest().
					NewID().
					ClientID("client id").
					State("state").
					ResponseType("response type").
					Scopes([]string{"scope"}).
					Audiences([]string{"audience"}).
					RedirectURI("redirect uri").
					Nonce("nonce").
					CodeChallenge(&oidc.CodeChallenge{
						Challenge: "challenge",
						Method:    "S256",
					}).
					AuthorizedAt(nil).
					MustBuild(),
			},
		},
	}

	init := connect(t)

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()

			client := init(t)
			repo := NewAuthRequest(mongodoc.NewClientWithDatabase(client))

			ctx := context.Background()
			err := repo.Save(ctx, tt.Expected.AuthRequest)
			assert.NoError(t, err)

			got, err := repo.FindByID(ctx, tt.Expected.AuthRequest.ID())
			assert.NoError(t, err)
			assert.Equal(t, tt.Expected.AuthRequest.ID(), got.ID())
			assert.Equal(t, tt.Expected.AuthRequest.GetClientID(), got.GetClientID())
			assert.Equal(t, tt.Expected.AuthRequest.GetState(), got.GetState())
			assert.Equal(t, tt.Expected.AuthRequest.GetResponseType(), got.GetResponseType())
			assert.Equal(t, tt.Expected.AuthRequest.GetScopes(), got.GetScopes())
			assert.Equal(t, tt.Expected.AuthRequest.GetAudience(), got.GetAudience())
			assert.Equal(t, tt.Expected.AuthRequest.GetRedirectURI(), got.GetRedirectURI())
			assert.Equal(t, tt.Expected.AuthRequest.GetNonce(), got.GetNonce())
			assert.Equal(t, tt.Expected.AuthRequest.GetCodeChallenge(), got.GetCodeChallenge())
			assert.Equal(t, tt.Expected.AuthRequest.AuthorizedAt(), got.AuthorizedAt())
		})
	}
}
