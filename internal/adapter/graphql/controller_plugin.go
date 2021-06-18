package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
)

type PluginControllerConfig struct {
	PluginInput func() interfaces.Plugin
}

type PluginController struct {
	config PluginControllerConfig
}

func NewPluginController(config PluginControllerConfig) *PluginController {
	return &PluginController{config: config}
}

func (c *PluginController) usecase() interfaces.Plugin {
	if c == nil {
		return nil
	}
	return c.config.PluginInput()
}

func (c *PluginController) Upload(ctx context.Context, ginput *UploadPluginInput, operator *usecase.Operator) (*UploadPluginPayload, error) {
	res, err := c.usecase().Upload(ctx, ginput.File.File, operator)
	if err != nil {
		return nil, err
	}

	return &UploadPluginPayload{
		Plugin: toPlugin(res),
	}, nil
}

func (c *PluginController) FetchPluginMetadata(ctx context.Context, operator *usecase.Operator) ([]*PluginMetadata, error) {
	res, err := c.usecase().FetchPluginMetadata(ctx, operator)
	if err != nil {
		return nil, err
	}

	pluginMetaList := make([]*PluginMetadata, 0, len(res))
	for _, md := range res {
		pm, err := toPluginMetadata(md)
		if err != nil {
			return nil, err
		}
		pluginMetaList = append(pluginMetaList, pm)
	}

	return pluginMetaList, nil
}
