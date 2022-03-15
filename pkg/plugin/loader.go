package plugin

import (
	"context"
)

type Loader func(context.Context, []ID) ([]*Plugin, error)
