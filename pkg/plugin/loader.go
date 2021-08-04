package plugin

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
)

type Loader func(context.Context, []id.PluginID, []id.SceneID) ([]*Plugin, error)
