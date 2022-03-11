package auth

import (
	"time"

	"github.com/caos/oidc/pkg/oidc"
	"github.com/reearth/reearth-backend/pkg/id"
)

type RequestBuilder struct {
	r *Request
}

func NewRequest() *RequestBuilder {
	return &RequestBuilder{r: &Request{}}
}

func (b *RequestBuilder) Build() (*Request, error) {
	if id.ID(b.r.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	b.r.createdAt = time.Now()
	return b.r, nil
}

func (b *RequestBuilder) MustBuild() *Request {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *RequestBuilder) ID(id id.AuthRequestID) *RequestBuilder {
	b.r.id = id
	return b
}

func (b *RequestBuilder) NewID() *RequestBuilder {
	b.r.id = id.AuthRequestID(id.New())
	return b
}

func (b *RequestBuilder) ClientID(id string) *RequestBuilder {
	b.r.clientID = id
	return b
}

func (b *RequestBuilder) Subject(subject string) *RequestBuilder {
	b.r.subject = subject
	return b
}

func (b *RequestBuilder) Code(code string) *RequestBuilder {
	b.r.code = code
	return b
}

func (b *RequestBuilder) State(state string) *RequestBuilder {
	b.r.state = state
	return b
}

func (b *RequestBuilder) ResponseType(rt oidc.ResponseType) *RequestBuilder {
	b.r.responseType = rt
	return b
}

func (b *RequestBuilder) Scopes(scopes []string) *RequestBuilder {
	b.r.scopes = scopes
	return b
}

func (b *RequestBuilder) Audiences(audiences []string) *RequestBuilder {
	b.r.audiences = audiences
	return b
}

func (b *RequestBuilder) RedirectURI(redirectURI string) *RequestBuilder {
	b.r.redirectURI = redirectURI
	return b
}

func (b *RequestBuilder) Nonce(nonce string) *RequestBuilder {
	b.r.nonce = nonce
	return b
}

func (b *RequestBuilder) CodeChallenge(CodeChallenge *oidc.CodeChallenge) *RequestBuilder {
	b.r.codeChallenge = CodeChallenge
	return b
}

func (b *RequestBuilder) CreatedAt(createdAt time.Time) *RequestBuilder {
	b.r.createdAt = createdAt
	return b
}

func (b *RequestBuilder) AuthorizedAt(authorizedAt *time.Time) *RequestBuilder {
	b.r.authorizedAt = authorizedAt
	return b
}
