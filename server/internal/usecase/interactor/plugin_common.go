package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/plugin/pluginpack"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type pluginCommon struct {
	pluginRepo         repo.Plugin
	propertySchemaRepo repo.PropertySchema
	file               gateway.File
	pluginRegistry     gateway.PluginRegistry
}

func (i *pluginCommon) SavePluginPack(ctx context.Context, p *pluginpack.Package) error {
	for {
		f, err := p.Files.Next()
		if err != nil {
			return interfaces.ErrInvalidPluginPackage
		}
		if f == nil {
			break
		}
		if err := i.file.UploadPluginFile(ctx, p.Manifest.Plugin.ID(), f); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	// save plugin and property schemas
	if ps := p.Manifest.PropertySchemas(); len(ps) > 0 {
		if err := i.propertySchemaRepo.SaveAll(ctx, ps); err != nil {
			return err
		}
	}

	if err := i.pluginRepo.Save(ctx, p.Manifest.Plugin); err != nil {
		return err
	}

	return nil
}

func (i *pluginCommon) GetOrDownloadPlugin(ctx context.Context, pid id.PluginID) (*plugin.Plugin, error) {
	if pid.IsNil() || pid.Equal(id.OfficialPluginID) {
		return nil, rerror.ErrNotFound
	}

	if plugin, err := i.pluginRepo.FindByID(ctx, pid); err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	} else if plugin != nil {
		return plugin, nil
	}

	if !pid.Scene().IsNil() || i.pluginRegistry == nil {
		return nil, rerror.ErrNotFound
	}

	pack, err := i.pluginRegistry.FetchPluginPackage(ctx, pid)
	if err != nil {
		return nil, err
	}

	if err := i.SavePluginPack(ctx, pack); err != nil {
		return nil, err
	}

	return pack.Manifest.Plugin, nil
}
