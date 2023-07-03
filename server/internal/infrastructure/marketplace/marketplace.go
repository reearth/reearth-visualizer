package marketplace

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin/pluginpack"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"golang.org/x/oauth2/clientcredentials"
)

const (
	secretHeader           string = "X-Reearth-Secret"
	pluginPackageSizeLimit int64  = 10 * 1024 * 1024 // 10MB
)

type Marketplace struct {
	endpoint string
	secret   string
	conf     *clientcredentials.Config
}

func New(endpoint, secret string, conf *clientcredentials.Config) *Marketplace {
	return &Marketplace{
		endpoint: strings.TrimSuffix(endpoint, "/"),
		secret:   secret,
		conf:     conf,
	}
}

func (m *Marketplace) FetchPluginPackage(ctx context.Context, pid id.PluginID) (*pluginpack.Package, error) {
	url, err := m.getPluginURL(pid)
	if err != nil {
		return nil, err
	}

	log.Infofc(ctx, "marketplace: downloading plugin package from \"%s\"", url)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	if m.secret != "" {
		req.Header.Set(secretHeader, m.secret)
	}
	res, err := m.client(ctx).Do(req)
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode == http.StatusNotFound {
		return nil, rerror.ErrNotFound
	}

	if res.StatusCode != http.StatusOK {
		return nil, rerror.ErrInternalByWithContext(ctx, fmt.Errorf("status code is %d", res.StatusCode))
	}

	p, err := pluginpack.PackageFromZip(res.Body, nil, pluginPackageSizeLimit)
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	return p, nil
}

func (m *Marketplace) NotifyDownload(ctx context.Context, pid id.PluginID) error {
	url, err := m.getPluginURL(pid)
	if err != nil {
		return err
	}
	url = url + "/download"

	log.Infofc(ctx, "marketplace: notify donwload to \"%s\"", url)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}
	if m.secret != "" {
		req.Header.Set(secretHeader, m.secret)
	}

	res, err := m.client(ctx).Do(req)
	if err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusNotFound {
		return rerror.ErrInternalByWithContext(ctx, fmt.Errorf("status code is %d", res.StatusCode))
	}
	return nil
}

func (m *Marketplace) getPluginURL(pid id.PluginID) (string, error) {
	return strings.TrimSpace(fmt.Sprintf("%s/api/plugins/%s/%s", m.endpoint, pid.Name(), pid.Version().String())), nil
}

func (m *Marketplace) client(ctx context.Context) (client *http.Client) {
	if m.conf != nil && m.conf.ClientID != "" && m.conf.ClientSecret != "" && m.conf.TokenURL != "" {
		client = m.conf.Client(ctx)
	}
	if client == nil {
		client = http.DefaultClient
	}

	return
}
