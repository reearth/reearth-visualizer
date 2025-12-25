package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/idx"
	"golang.org/x/exp/slices"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type AssetDocument struct {
	ID          string
	CreatedAt   time.Time
	Workspace   string
	Project     *string
	Name        string
	Size        int64
	URL         string
	ContentType string
	CoreSupport bool
}

type AssetConsumer = Consumer[*AssetDocument, *asset.Asset]

func NewAssetConsumer(workspaces []accountsID.WorkspaceID) *AssetConsumer {
	return NewConsumer[*AssetDocument, *asset.Asset](func(a *asset.Asset) bool {
		return workspaces == nil || slices.Contains(workspaces, a.Workspace())
	})
}

func NewAsset(asset *asset.Asset) (*AssetDocument, string) {
	aid := asset.ID().String()

	var pid *string
	if project := asset.Project(); project != nil {
		pidValue := project.String()
		pid = &pidValue
	}

	return &AssetDocument{
		ID:          aid,
		CreatedAt:   asset.CreatedAt(),
		Workspace:   asset.Workspace().String(),
		Project:     pid,
		Name:        asset.Name(),
		Size:        asset.Size(),
		URL:         asset.URL(),
		ContentType: asset.ContentType(),
		CoreSupport: asset.CoreSupport(),
	}, aid
}

func (d *AssetDocument) Model() (*asset.Asset, error) {
	aid, err := id.AssetIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := accountsID.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	var pid *idx.ID[id.Project]
	if d.Project != nil {
		pidValue, err := id.ProjectIDFrom(*d.Project)
		if err != nil {
			return nil, err
		}
		pid = &pidValue
	}

	return asset.New().
		ID(aid).
		CreatedAt(d.CreatedAt).
		Workspace(tid).
		Project(pid).
		Name(d.Name).
		Size(d.Size).
		URL(d.URL).
		ContentType(d.ContentType).
		CoreSupport(d.CoreSupport).
		Build()
}
