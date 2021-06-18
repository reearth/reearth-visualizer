package github

import (
	"context"
	"encoding/json"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/plugin"
)

type pluginRegistry struct{}

func NewPluginRegistry() gateway.PluginRegistry {
	return &pluginRegistry{}
}

const source = `https://raw.githubusercontent.com/reearth/plugins/main/plugins.json`

func (d *pluginRegistry) FetchMetadata(ctx context.Context) ([]*plugin.Metadata, error) {

	response, err := fetchURL(ctx, source)
	if err != nil {
		return nil, err
	}

	defer func() { err = response.Close() }()

	var result []*plugin.Metadata
	err = json.NewDecoder(response).Decode(&result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
