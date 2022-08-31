package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
)

type AssetDocument struct {
	ID          string
	CreatedAt   time.Time
	Team        string // DON'T CHANGE NAME'
	Name        string
	Size        int64
	URL         string
	ContentType string
}

type AssetConsumer = mongox.SliceFuncConsumer[*AssetDocument, *asset.Asset]

func NewAssetConsumer() *AssetConsumer {
	return NewComsumer[*AssetDocument, *asset.Asset]()
}

func NewAsset(asset *asset.Asset) (*AssetDocument, string) {
	aid := asset.ID().String()
	return &AssetDocument{
		ID:          aid,
		CreatedAt:   asset.CreatedAt(),
		Team:        asset.Workspace().String(),
		Name:        asset.Name(),
		Size:        asset.Size(),
		URL:         asset.URL(),
		ContentType: asset.ContentType(),
	}, aid
}

func (d *AssetDocument) Model() (*asset.Asset, error) {
	aid, err := id.AssetIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := id.WorkspaceIDFrom(d.Team)
	if err != nil {
		return nil, err
	}

	return asset.New().
		ID(aid).
		CreatedAt(d.CreatedAt).
		Workspace(tid).
		Name(d.Name).
		Size(d.Size).
		URL(d.URL).
		ContentType(d.ContentType).
		Build()
}
