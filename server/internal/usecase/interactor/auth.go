package interactor

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/caos/oidc/pkg/oidc"
	"github.com/caos/oidc/pkg/op"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/auth"
	config2 "github.com/reearth/reearth-backend/pkg/config"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/user"
	"gopkg.in/square/go-jose.v2"
)

type AuthStorage struct {
	appConfig        *StorageConfig
	getUserBySubject func(context.Context, string) (*user.User, error)
	clients          map[string]op.Client
	requests         repo.AuthRequest
	keySet           jose.JSONWebKeySet
	key              *rsa.PrivateKey
	sigKey           jose.SigningKey
}

type StorageConfig struct {
	Domain       string `default:"http://localhost:8080"`
	ClientDomain string `default:"http://localhost:8080"`
	Debug        bool
	DN           *AuthDNConfig
}

type AuthDNConfig struct {
	CommonName         string
	Organization       []string
	OrganizationalUnit []string
	Country            []string
	Province           []string
	Locality           []string
	StreetAddress      []string
	PostalCode         []string
}

var dummyName = pkix.Name{
	CommonName:         "Dummy company, INC.",
	Organization:       []string{"Dummy company, INC."},
	OrganizationalUnit: []string{"Dummy OU"},
	Country:            []string{"US"},
	Province:           []string{"Dummy"},
	Locality:           []string{"Dummy locality"},
	StreetAddress:      []string{"Dummy street"},
	PostalCode:         []string{"1"},
}

func NewAuthStorage(ctx context.Context, cfg *StorageConfig, request repo.AuthRequest, config repo.Config, getUserBySubject func(context.Context, string) (*user.User, error)) (op.Storage, error) {
	client := auth.NewLocalClient(cfg.Debug, cfg.ClientDomain)

	name := dummyName
	if cfg.DN != nil {
		name = pkix.Name{
			CommonName:         cfg.DN.CommonName,
			Organization:       cfg.DN.Organization,
			OrganizationalUnit: cfg.DN.OrganizationalUnit,
			Country:            cfg.DN.Country,
			Province:           cfg.DN.Province,
			Locality:           cfg.DN.Locality,
			StreetAddress:      cfg.DN.StreetAddress,
			PostalCode:         cfg.DN.PostalCode,
		}
	}
	c, err := config.LockAndLoad(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not load auth config: %w\n", err)
	}
	defer func() {
		if err := config.Unlock(ctx); err != nil {
			log.Errorf("auth: could not release config lock: %s\n", err)
		}
	}()

	var keyBytes, certBytes []byte
	if c.Auth != nil {
		keyBytes = []byte(c.Auth.Key)
		certBytes = []byte(c.Auth.Cert)
	} else {
		keyBytes, certBytes, err = generateCert(name)
		if err != nil {
			return nil, fmt.Errorf("could not generate raw cert: %w\n", err)
		}
		c.Auth = &config2.Auth{
			Key:  string(keyBytes),
			Cert: string(certBytes),
		}

		if err := config.Save(ctx, c); err != nil {
			return nil, fmt.Errorf("could not save raw cert: %w\n", err)
		}
		log.Info("auth: init a new private key and certificate")
	}

	key, sigKey, keySet, err := initKeys(keyBytes, certBytes)
	if err != nil {
		return nil, fmt.Errorf("could not init keys: %w\n", err)
	}

	return &AuthStorage{
		appConfig:        cfg,
		getUserBySubject: getUserBySubject,
		requests:         request,
		key:              key,
		sigKey:           *sigKey,
		keySet:           *keySet,
		clients: map[string]op.Client{
			client.GetID(): client,
		},
	}, nil
}

func initKeys(keyBytes, certBytes []byte) (*rsa.PrivateKey, *jose.SigningKey, *jose.JSONWebKeySet, error) {
	keyBlock, _ := pem.Decode(keyBytes)
	if keyBlock == nil {
		return nil, nil, nil, fmt.Errorf("failed to decode the key bytes")
	}
	key, err := x509.ParsePKCS1PrivateKey(keyBlock.Bytes)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to parse the private key bytes: %w\n", err)
	}

	var certActualBytes []byte
	certBlock, _ := pem.Decode(certBytes)
	if certBlock == nil {
		certActualBytes = certBytes // backwards compatibility
	} else {
		certActualBytes = certBlock.Bytes
	}

	var cert *x509.Certificate
	cert, err = x509.ParseCertificate(certActualBytes)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to parse the cert bytes: %w\n", err)
	}

	keyID := "RE01"
	sk := jose.SigningKey{
		Algorithm: jose.RS256,
		Key:       jose.JSONWebKey{Key: key, Use: "sig", Algorithm: string(jose.RS256), KeyID: keyID, Certificates: []*x509.Certificate{cert}},
	}

	return key, &sk, &jose.JSONWebKeySet{
		Keys: []jose.JSONWebKey{
			{Key: key.Public(), Use: "sig", Algorithm: string(jose.RS256), KeyID: keyID, Certificates: []*x509.Certificate{cert}},
		},
	}, nil
}

func generateCert(name pkix.Name) (keyPem, certPem []byte, err error) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		err = fmt.Errorf("failed to generate key: %w\n", err)
		return
	}

	keyPem = pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	})

	cert := &x509.Certificate{
		SerialNumber: big.NewInt(1),
		Subject:      name,
		NotBefore:    time.Now(),
		NotAfter:     time.Now().AddDate(100, 0, 0),
		IsCA:         true,
		KeyUsage:     x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign | x509.KeyUsageCRLSign,
	}

	certBytes, err := x509.CreateCertificate(rand.Reader, cert, cert, key.Public(), key)
	if err != nil {
		err = fmt.Errorf("failed to create the cert: %w\n", err)
	}

	certPem = pem.EncodeToMemory(&pem.Block{
		Type:  "CERTIFICATE",
		Bytes: certBytes,
	})
	return
}

func (s *AuthStorage) Health(_ context.Context) error {
	return nil
}

func (s *AuthStorage) CreateAuthRequest(ctx context.Context, authReq *oidc.AuthRequest, _ string) (op.AuthRequest, error) {
	audiences := []string{
		s.appConfig.Domain,
	}
	if s.appConfig.Debug {
		audiences = append(audiences, "http://localhost:8080")
	}

	var cc *oidc.CodeChallenge
	if authReq.CodeChallenge != "" {
		cc = &oidc.CodeChallenge{
			Challenge: authReq.CodeChallenge,
			Method:    authReq.CodeChallengeMethod,
		}
	}
	var request = auth.NewRequest().
		NewID().
		ClientID(authReq.ClientID).
		State(authReq.State).
		ResponseType(authReq.ResponseType).
		Scopes(authReq.Scopes).
		Audiences(audiences).
		RedirectURI(authReq.RedirectURI).
		Nonce(authReq.Nonce).
		CodeChallenge(cc).
		CreatedAt(time.Now().UTC()).
		AuthorizedAt(nil).
		MustBuild()

	if err := s.requests.Save(ctx, request); err != nil {
		return nil, err
	}
	return request, nil
}

func (s *AuthStorage) AuthRequestByID(ctx context.Context, requestID string) (op.AuthRequest, error) {
	if requestID == "" {
		return nil, errors.New("invalid id")
	}
	reqId, err := id.AuthRequestIDFrom(requestID)
	if err != nil {
		return nil, err
	}
	request, err := s.requests.FindByID(ctx, reqId)
	if err != nil {
		return nil, err
	}
	return request, nil
}

func (s *AuthStorage) AuthRequestByCode(ctx context.Context, code string) (op.AuthRequest, error) {
	if code == "" {
		return nil, errors.New("invalid code")
	}
	return s.requests.FindByCode(ctx, code)
}

func (s *AuthStorage) AuthRequestBySubject(ctx context.Context, subject string) (op.AuthRequest, error) {
	if subject == "" {
		return nil, errors.New("invalid subject")
	}

	return s.requests.FindBySubject(ctx, subject)
}

func (s *AuthStorage) SaveAuthCode(ctx context.Context, requestID, code string) error {
	request, err := s.AuthRequestByID(ctx, requestID)
	if err != nil {
		return err
	}
	request2 := request.(*auth.Request)
	request2.SetCode(code)
	err = s.updateRequest(ctx, requestID, *request2)
	return err
}

func (s *AuthStorage) DeleteAuthRequest(_ context.Context, requestID string) error {
	delete(s.clients, requestID)
	return nil
}

func (s *AuthStorage) CreateAccessToken(_ context.Context, _ op.TokenRequest) (string, time.Time, error) {
	return "id", time.Now().UTC().Add(5 * time.Hour), nil
}

func (s *AuthStorage) CreateAccessAndRefreshTokens(_ context.Context, request op.TokenRequest, _ string) (accessTokenID string, newRefreshToken string, expiration time.Time, err error) {
	authReq := request.(*auth.Request)
	return "id", authReq.GetID(), time.Now().UTC().Add(5 * time.Minute), nil
}

func (s *AuthStorage) TokenRequestByRefreshToken(ctx context.Context, refreshToken string) (op.RefreshTokenRequest, error) {
	r, err := s.AuthRequestByID(ctx, refreshToken)
	if err != nil {
		return nil, err
	}
	return r.(op.RefreshTokenRequest), err
}

func (s *AuthStorage) TerminateSession(_ context.Context, _, _ string) error {
	return errors.New("not implemented")
}

func (s *AuthStorage) GetSigningKey(_ context.Context, keyCh chan<- jose.SigningKey) {
	keyCh <- s.sigKey
}

func (s *AuthStorage) GetKeySet(_ context.Context) (*jose.JSONWebKeySet, error) {
	return &s.keySet, nil
}

func (s *AuthStorage) GetKeyByIDAndUserID(_ context.Context, kid, _ string) (*jose.JSONWebKey, error) {
	return &s.keySet.Key(kid)[0], nil
}

func (s *AuthStorage) GetClientByClientID(_ context.Context, clientID string) (op.Client, error) {

	if clientID == "" {
		return nil, errors.New("invalid client id")
	}

	client, exists := s.clients[clientID]
	if !exists {
		return nil, errors.New("not found")
	}

	return client, nil
}

func (s *AuthStorage) AuthorizeClientIDSecret(_ context.Context, _ string, _ string) error {
	return nil
}

func (s *AuthStorage) SetUserinfoFromToken(ctx context.Context, userinfo oidc.UserInfoSetter, _, _, _ string) error {
	return s.SetUserinfoFromScopes(ctx, userinfo, "", "", []string{})
}

func (s *AuthStorage) SetUserinfoFromScopes(ctx context.Context, userinfo oidc.UserInfoSetter, subject, _ string, _ []string) error {

	request, err := s.AuthRequestBySubject(ctx, subject)
	if err != nil {
		return err
	}

	u, err := s.getUserBySubject(ctx, subject)
	if err != nil {
		return err
	}

	userinfo.SetSubject(request.GetSubject())
	userinfo.SetEmail(u.Email(), true)
	userinfo.SetName(u.Name())
	userinfo.AppendClaims("lang", u.Lang())
	userinfo.AppendClaims("theme", u.Theme())

	return nil
}

func (s *AuthStorage) GetPrivateClaimsFromScopes(_ context.Context, _, _ string, _ []string) (map[string]interface{}, error) {
	return map[string]interface{}{"private_claim": "test"}, nil
}

func (s *AuthStorage) SetIntrospectionFromToken(ctx context.Context, introspect oidc.IntrospectionResponse, _, subject, clientID string) error {
	if err := s.SetUserinfoFromScopes(ctx, introspect, subject, clientID, []string{}); err != nil {
		return err
	}
	request, err := s.AuthRequestBySubject(ctx, subject)
	if err != nil {
		return err
	}
	introspect.SetClientID(request.GetClientID())
	return nil
}

func (s *AuthStorage) ValidateJWTProfileScopes(_ context.Context, _ string, scope []string) ([]string, error) {
	return scope, nil
}

func (s *AuthStorage) RevokeToken(_ context.Context, _ string, _ string, _ string) *oidc.Error {
	// TODO implement me
	panic("implement me")
}

func (s *AuthStorage) CompleteAuthRequest(ctx context.Context, requestId, sub string) error {
	request, err := s.AuthRequestByID(ctx, requestId)
	if err != nil {
		return err
	}
	req := request.(*auth.Request)
	req.Complete(sub)
	err = s.updateRequest(ctx, requestId, *req)
	return err
}

func (s *AuthStorage) updateRequest(ctx context.Context, requestID string, req auth.Request) error {
	if requestID == "" {
		return errors.New("invalid id")
	}
	reqId, err := id.AuthRequestIDFrom(requestID)
	if err != nil {
		return err
	}

	if _, err := s.requests.FindByID(ctx, reqId); err != nil {
		return err
	}

	if err := s.requests.Save(ctx, &req); err != nil {
		return err
	}

	return nil
}
