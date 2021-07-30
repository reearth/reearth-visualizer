package npm

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin/manifest"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

const (
	manifestFilePath = "reearth.json"
)

type pluginRepository struct {
	registryURL string
}

func NewPluginRepository() gateway.PluginRepository {
	return &pluginRepository{
		registryURL: "https://registry.npmjs.org/",
	}
}

func NewPluginRepositoryOf(url string) gateway.PluginRepository {
	return &pluginRepository{
		registryURL: url,
	}
}

func (r *pluginRepository) Data(ctx context.Context, id id.PluginID) (file.Archive, error) {
	return r.getNpmTarball(ctx, id)
}

// Manifest _
func (r *pluginRepository) Manifest(ctx context.Context, id id.PluginID) (*manifest.Manifest, error) {
	archive, err := r.getNpmTarball(ctx, id)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = archive.Close()
	}()

	for {
		f, err := archive.Next()
		if errors.Is(err, file.EOF) {
			break
		}
		if err != nil {
			return nil, rerror.ErrInternalBy(err)
		}
		if f.Fullpath == manifestFilePath {
			manifest, err := manifest.Parse(f.Content)
			if err != nil {
				return nil, err
			}
			return manifest, nil
		}
	}
	return nil, manifest.ErrFailedToParseManifest
}

func (r *pluginRepository) getNpmTarball(ctx context.Context, id id.PluginID) (file.Archive, error) {
	rawPkgName := id.Name()
	pkgVersion := id.Version().String()
	scopelessPkgName := id.Name()
	if rawPkgName[0] == '@' {
		splitted := strings.Split(rawPkgName, "/")
		if len(splitted) > 1 {
			scopelessPkgName = splitted[1]
		}
	}
	tarballURL := fmt.Sprintf("%s%s/-/%s-%s.tgz", r.registryURL, rawPkgName, scopelessPkgName, pkgVersion)

	req, err := http.NewRequestWithContext(ctx, "GET", tarballURL, nil)
	if err != nil {
		return nil, gateway.ErrFailedToFetchPluiginRepositoryData
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil || res.StatusCode != http.StatusOK {
		if res.StatusCode == http.StatusNotFound {
			return nil, rerror.ErrNotFound
		}
		return nil, gateway.ErrFailedToFetchPluiginRepositoryData
	}

	return NewArchive(res.Body, fmt.Sprintf("%s-%s.tgz", rawPkgName, pkgVersion), res.ContentLength), nil
}
