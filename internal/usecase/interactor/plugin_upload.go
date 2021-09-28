package interactor

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/url"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/plugin/pluginpack"
	"github.com/reearth/reearth-backend/pkg/plugin/repourl"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
)

var pluginPackageSizeLimit int64 = 10 * 1024 * 1024 // 10MB

func (i *Plugin) Upload(ctx context.Context, r io.Reader, sid id.SceneID, operator *usecase.Operator) (_ *plugin.Plugin, _ *scene.Scene, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(ctx, sid, operator); err != nil {
		return nil, nil, err
	}

	s, err := i.sceneRepo.FindByID(ctx, sid, operator.WritableTeams)
	if err != nil {
		return nil, nil, err
	}

	p, err := pluginpack.PackageFromZip(r, &sid, pluginPackageSizeLimit)
	if err != nil {
		return nil, nil, &rerror.Error{
			Label:    interfaces.ErrInvalidPluginPackage,
			Err:      err,
			Separate: true,
		}
	}

	for {
		f, err := p.Files.Next()
		if err != nil {
			return nil, nil, rerror.ErrInternalBy(err)
		}
		if f == nil {
			break
		}
		if err := i.file.UploadPluginFile(ctx, p.Manifest.Plugin.ID(), f); err != nil {
			return nil, nil, rerror.ErrInternalBy(err)
		}
	}

	if ps := p.Manifest.PropertySchemas(); len(ps) > 0 {
		if err := i.propertySchemaRepo.SaveAll(ctx, ps); err != nil {
			return nil, nil, rerror.ErrInternalBy(err)
		}
	}
	if err := i.pluginRepo.Save(ctx, p.Manifest.Plugin); err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}

	if err := i.installPlugin(ctx, p, s); err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}

	tx.Commit()
	return p.Manifest.Plugin, s, nil
}

func (i *Plugin) UploadFromRemote(ctx context.Context, u *url.URL, sid id.SceneID, operator *usecase.Operator) (_ *plugin.Plugin, _ *scene.Scene, err error) {
	ru, err := repourl.New(u)
	if err != nil {
		return nil, nil, err
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.CanWriteScene(ctx, sid, operator); err != nil {
		return nil, nil, err
	}

	s, err := i.sceneRepo.FindByID(ctx, sid, operator.WritableTeams)
	if err != nil {
		return nil, nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, ru.ArchiveURL().String(), nil)
	if err != nil {
		return nil, nil, interfaces.ErrInvalidPluginPackage
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, nil, interfaces.ErrInvalidPluginPackage
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode != 200 {
		return nil, nil, interfaces.ErrInvalidPluginPackage
	}

	p, err := pluginpack.PackageFromZip(res.Body, &sid, pluginPackageSizeLimit)
	if err != nil {
		return nil, nil, interfaces.ErrInvalidPluginPackage
	}

	if p, err := i.pluginRepo.FindByID(ctx, p.Manifest.Plugin.ID(), []id.SceneID{sid}); err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, nil, err
	} else if p != nil {
		return nil, nil, interfaces.ErrPluginAlreadyInstalled
	}

	for {
		f, err := p.Files.Next()
		if err != nil {
			return nil, nil, interfaces.ErrInvalidPluginPackage
		}
		if f == nil {
			break
		}
		if err := i.file.UploadPluginFile(ctx, p.Manifest.Plugin.ID(), f); err != nil {
			return nil, nil, rerror.ErrInternalBy(err)
		}
	}

	if ps := p.Manifest.PropertySchemas(); len(ps) > 0 {
		if err := i.propertySchemaRepo.SaveAll(ctx, ps); err != nil {
			return nil, nil, err
		}
	}
	if err := i.pluginRepo.Save(ctx, p.Manifest.Plugin); err != nil {
		return nil, nil, err
	}

	if err := i.installPlugin(ctx, p, s); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return p.Manifest.Plugin, s, nil
}

// installPlugin installs the plugin to the scene
func (i *Plugin) installPlugin(ctx context.Context, p *pluginpack.Package, s *scene.Scene) (err error) {
	var ppid *id.PropertyID
	var pp *property.Property
	if psid := p.Manifest.Plugin.Schema(); psid != nil {
		pp, err = property.New().NewID().Schema(*psid).Build()
		if err != nil {
			return err
		}
	}
	s.PluginSystem().Add(scene.NewPlugin(p.Manifest.Plugin.ID(), ppid))

	if pp != nil {
		if err := i.propertyRepo.Save(ctx, pp); err != nil {
			return err
		}
	}
	if err := i.sceneRepo.Save(ctx, s); err != nil {
		return err
	}
	return nil
}
