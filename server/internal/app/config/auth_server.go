package config

import (
	"net/url"

	"github.com/reearth/reearthx/authserver"
	"github.com/samber/lo"
)

const AuthServerDefaultClientID = "reearth-authsrv-client-default"

type AuthSrvConfig struct {
	Dev      bool             `pp:",omitempty"`
	Disabled bool             `pp:",omitempty"`
	Issuer   string           `pp:",omitempty"`
	Domain   string           `pp:",omitempty"`
	UIDomain string           `pp:",omitempty"`
	Key      string           `pp:",omitempty"`
	DN       *AuthSrvDNConfig `pp:",omitempty"`
}

func (c AuthSrvConfig) AuthConfig(debug bool, host string) *AuthConfig {
	if c.Disabled {
		return nil
	}

	domain := c.Domain
	if domain == "" {
		domain = host
	}

	var aud []string
	if debug && host != "" && c.Domain != "" && c.Domain != host {
		aud = []string{host, c.Domain}
	} else {
		aud = []string{domain}
	}

	return &AuthConfig{
		ISS:      getAuthDomain(domain),
		AUD:      aud,
		ClientID: lo.ToPtr(AuthServerDefaultClientID),
	}
}

type AuthSrvDNConfig struct {
	CN         string   `pp:",omitempty"`
	O          []string `pp:",omitempty"`
	OU         []string `pp:",omitempty"`
	C          []string `pp:",omitempty"`
	L          []string `pp:",omitempty"`
	ST         []string `pp:",omitempty"`
	Street     []string `pp:",omitempty"`
	PostalCode []string `pp:",omitempty"`
}

func (a *AuthSrvDNConfig) AuthServerDNConfig() *authserver.DNConfig {
	if a == nil {
		return nil
	}
	return &authserver.DNConfig{
		CommonName:         a.CN,
		Organization:       a.O,
		OrganizationalUnit: a.OU,
		Country:            a.C,
		Province:           a.ST,
		StreetAddress:      a.Street,
		Locality:           a.L,
		PostalCode:         a.PostalCode,
	}
}

func (c AuthSrvConfig) DomainURL() *url.URL {
	u, err := url.Parse(c.Domain)
	if err != nil {
		u = nil
	}
	return u
}

func (c AuthSrvConfig) UIDomainURL() *url.URL {
	u, err := url.Parse(c.UIDomain)
	if err != nil {
		u = nil
	}
	return u
}
