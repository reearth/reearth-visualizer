package graphql

import (
	"github.com/reearth/reearth-backend/pkg/asset"
)

func toAsset(a *asset.Asset) *Asset {
	if a == nil {
		return nil
	}
	return &Asset{
		ID:          a.ID().ID(),
		CreatedAt:   a.CreatedAt(),
		TeamID:      a.Team().ID(),
		Name:        a.Name(),
		Size:        a.Size(),
		URL:         a.URL(),
		ContentType: a.ContentType(),
	}
}
