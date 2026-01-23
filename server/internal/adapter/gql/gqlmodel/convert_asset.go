package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/asset"
)

func ToAsset(a *asset.Asset) *Asset {
	if a == nil {
		return nil
	}

	var pid *ID
	if project := a.Project(); project != nil {
		pidValue := IDFrom(*a.Project())
		pid = &pidValue
	}

	return &Asset{
		ID:          IDFrom(a.ID()),
		CreatedAt:   a.CreatedAt(),
		WorkspaceID: IDFrom(a.Workspace()),
		ProjectID:   pid,
		Name:        a.Name(),
		Size:        a.Size(),
		URL:         a.URL(),
		ContentType: a.ContentType(),
		CoreSupport: a.CoreSupport(),
	}
}

func ToAssets(assets []*asset.Asset) []*Asset {
	result := make([]*Asset, 0, len(assets))

	for _, a := range assets {
		result = append(result, ToAsset(a))
	}

	return result
}

func AssetSortTypeFrom(ast *AssetSort) *asset.SortType {
	if ast == nil {
		return nil
	}

	var key string
	switch ast.Field {
	case AssetSortFieldDate:
		key = "id"
	case AssetSortFieldName:
		key = "name"
	case AssetSortFieldSize:
		key = "size"
	default:
		key = "id"
	}

	return &asset.SortType{
		Key:  key,
		Desc: ast.Direction == SortDirectionDesc,
	}
}
