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
