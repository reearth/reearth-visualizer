package sceneops

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/scene"
)

type PluginInstaller struct {
	// PluginRepo           repo.Plugin
	// PluginRepositoryRepo gateway.PluginRepository
	// PropertySchemaRepo   repo.PropertySchema
}

func (s PluginInstaller) InstallPluginFromRepository(pluginID scene.PluginID) error {
	return errors.New("not implemented")

	// 	manifest, err := s.PluginRepositoryRepo.Manifest(pluginID)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	// save
	// 	if manifest.Schema != nil {
	// 		err = s.PropertySchemaRepo.SaveAll(manifest.Schema)
	// 		if err != nil {
	// 			return err
	// 		}
	// 	}

	// 	for _, s := range manifest.ExtensionSchema {
	// 		err = i.propertySchemaRepo.Save(&s)
	// 		if err != nil {
	// 			i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 			return
	// 		}
	// 	}

	// 	err = i.pluginRepo.Save(plugin)
	// 	if err != nil {
	// 		i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 		return
	// 	}

	// 	// Download and extract plugin files to storage
	// 	data, err := i.pluginRepositoryRepo.Data(inp.Name, inp.Version)
	// 	if err != nil {
	// 		i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 		return
	// 	}

	// 	_, err = i.fileRepo.UploadAndExtractPluginFiles(data, plugin)
	// 	if err != nil {
	// 		i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 		return
	// 	}

	// 	return nil
	// }

	// // UploadPlugin _
	// func (s PluginInstaller) UploadPlugin(reader io.Reader) error {
	// 	panic("not implemented")

	// 	manifest, err := s.PluginRepositoryRepo.Manifest(inp.Name, inp.Version)
	// 	if err != nil {
	// 		i.output.Upload(nil, err)
	// 		return
	// 	}

	// 	// build plugin
	// 	plugin, err := plugin.New().
	// 		NewID().
	// 		FromManifest(manifest).
	// 		Developer(operator.User).
	// 		PluginSeries(pluginSeries.ID()).
	// 		CreatedAt(time.Now()).
	// 		Public(inp.Public).
	// 		Build()
	// 	if err != nil {
	// 		i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 		return
	// 	}

	// 	// save
	// 	if manifest.Schema != nil {
	// 		err = i.propertySchemaRepo.Save(manifest.Schema)
	// 		if err != nil {
	// 			i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 			return
	// 		}
	// 	}

	// 	for _, s := range manifest.ExtensionSchema {
	// 		err = i.propertySchemaRepo.Save(&s)
	// 		if err != nil {
	// 			i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 			return
	// 		}
	// 	}

	// 	err = i.pluginRepo.Save(plugin)
	// 	if err != nil {
	// 		i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 		return
	// 	}

	// 	// Download and extract plugin files to storage
	// 	data, err := i.pluginRepositoryRepo.Data(inp.Name, inp.Version)
	// 	if err != nil {
	// 		i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 		return
	// 	}

	// 	_, err = i.fileRepo.UploadAndExtractPluginFiles(data, plugin)
	// 	if err != nil {
	// 		i.output.Upload(nil, rerror.ErrInternalByWithContext(ctx, err))
	// 		return
	// 	}

	// return nil
}
