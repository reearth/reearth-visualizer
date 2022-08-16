package mongodoc

import (
	"time"

	"github.com/caos/oidc/pkg/oidc"
	"github.com/reearth/reearth-backend/pkg/auth"
	"github.com/reearth/reearth-backend/pkg/id"
	"go.mongodb.org/mongo-driver/bson"
)

type AuthRequestDocument struct {
	ID            string
	ClientID      string
	Subject       string
	Code          string
	State         string
	ResponseType  string
	Scopes        []string
	Audiences     []string
	RedirectURI   string
	Nonce         string
	CodeChallenge *CodeChallengeDocument
	CreatedAt     time.Time
	AuthorizedAt  *time.Time
}

type CodeChallengeDocument struct {
	Challenge string
	Method    string
}

type AuthRequestConsumer struct {
	Rows []*auth.Request
}

func (a *AuthRequestConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc AuthRequestDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	request, err := doc.Model()
	if err != nil {
		return err
	}
	a.Rows = append(a.Rows, request)
	return nil
}

func NewAuthRequest(req *auth.Request) (*AuthRequestDocument, string) {
	if req == nil {
		return nil, ""
	}
	reqID := req.GetID()
	var cc *CodeChallengeDocument
	if req.GetCodeChallenge() != nil {
		cc = &CodeChallengeDocument{
			Challenge: req.GetCodeChallenge().Challenge,
			Method:    string(req.GetCodeChallenge().Method),
		}
	}
	return &AuthRequestDocument{
		ID:            reqID,
		ClientID:      req.GetClientID(),
		Subject:       req.GetSubject(),
		Code:          req.GetCode(),
		State:         req.GetState(),
		ResponseType:  string(req.GetResponseType()),
		Scopes:        req.GetScopes(),
		Audiences:     req.GetAudience(),
		RedirectURI:   req.GetRedirectURI(),
		Nonce:         req.GetNonce(),
		CodeChallenge: cc,
		CreatedAt:     req.CreatedAt(),
		AuthorizedAt:  req.AuthorizedAt(),
	}, reqID
}

func (d *AuthRequestDocument) Model() (*auth.Request, error) {
	if d == nil {
		return nil, nil
	}

	ulid, err := id.AuthRequestIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	var cc *oidc.CodeChallenge
	if d.CodeChallenge != nil {
		cc = &oidc.CodeChallenge{
			Challenge: d.CodeChallenge.Challenge,
			Method:    oidc.CodeChallengeMethod(d.CodeChallenge.Method),
		}
	}
	var req = auth.NewRequest().
		ID(ulid).
		ClientID(d.ClientID).
		Subject(d.Subject).
		Code(d.Code).
		State(d.State).
		ResponseType(oidc.ResponseType(d.ResponseType)).
		Scopes(d.Scopes).
		Audiences(d.Audiences).
		RedirectURI(d.RedirectURI).
		Nonce(d.Nonce).
		CodeChallenge(cc).
		CreatedAt(d.CreatedAt).
		AuthorizedAt(d.AuthorizedAt).
		MustBuild()
	return req, nil
}
