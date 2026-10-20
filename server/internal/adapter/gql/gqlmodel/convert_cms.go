package gqlmodel

import (
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/samber/lo"
)

func ToCMSProjectConnection(l *gateway.CMSProjectList) *CMSProjectConnection {
	if l == nil {
		return &CMSProjectConnection{Nodes: []*CMSProject{}}
	}
	return &CMSProjectConnection{
		Nodes:      lo.Map(l.Projects, func(p *gateway.CMSProject, _ int) *CMSProject { return ToCMSProject(p) }),
		TotalCount: int(l.TotalCount),
	}
}

func ToCMSModelConnection(l *gateway.CMSModelList) *CMSModelConnection {
	if l == nil {
		return &CMSModelConnection{Nodes: []*CMSModel{}}
	}
	return &CMSModelConnection{
		Nodes:      lo.Map(l.Models, func(m *gateway.CMSModel, _ int) *CMSModel { return ToCMSModel(m) }),
		TotalCount: int(l.TotalCount),
	}
}

func ToCMSAssetConnection(l *gateway.CMSAssetList) *CMSAssetConnection {
	if l == nil {
		return &CMSAssetConnection{Nodes: []*CMSAsset{}}
	}
	return &CMSAssetConnection{
		Nodes:      lo.Map(l.Assets, func(a *gateway.CMSAsset, _ int) *CMSAsset { return ToCMSAsset(a) }),
		TotalCount: int(l.TotalCount),
	}
}

func ToCMSProject(p *gateway.CMSProject) *CMSProject {
	return &CMSProject{
		ID:          ID(p.ID),
		Name:        p.Name,
		Alias:       p.Alias,
		Description: p.Description,
		WorkspaceID: ID(p.WorkspaceID),
		Public:      p.Public,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func ToCMSModel(m *gateway.CMSModel) *CMSModel {
	return &CMSModel{
		ID:          ID(m.ID),
		ProjectID:   ID(m.ProjectID),
		Name:        m.Name,
		Description: m.Description,
		Key:         m.Key,
		PublicAPIEp: m.PublicAPIEndpoint,
		EditorURL:   m.EditorURL,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

func ToCMSAsset(a *gateway.CMSAsset) *CMSAsset {
	return &CMSAsset{
		ID:                      ID(a.ID),
		ProjectID:               ID(a.ProjectID),
		Filename:                a.Filename,
		Size:                    int64(a.Size),
		PreviewType:             lo.EmptyableToPtr(a.PreviewType),
		URL:                     a.URL,
		ArchiveExtractionStatus: lo.EmptyableToPtr(a.ArchiveExtractionStatus),
		Public:                  a.Public,
		CreatedAt:               a.CreatedAt,
	}
}
