package gqlmodel

import (
	"time"

	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/samber/lo"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func ToCMSProjectConnection(r *cmspb.ListProjectsResponse) *CMSProjectConnection {
	return &CMSProjectConnection{
		Nodes:      lo.Map(r.GetProjects(), func(p *cmspb.Project, _ int) *CMSProject { return ToCMSProject(p) }),
		TotalCount: int(r.GetTotalCount()),
	}
}

func ToCMSModelConnection(r *cmspb.ListModelsResponse) *CMSModelConnection {
	return &CMSModelConnection{
		Nodes:      lo.Map(r.GetModels(), func(m *cmspb.Model, _ int) *CMSModel { return ToCMSModel(m) }),
		TotalCount: int(r.GetTotalCount()),
	}
}

func ToCMSAssetConnection(r *cmspb.ListAssetsResponse) *CMSAssetConnection {
	return &CMSAssetConnection{
		Nodes:      lo.Map(r.GetAssets(), func(a *cmspb.Asset, _ int) *CMSAsset { return ToCMSAsset(a) }),
		TotalCount: int(r.GetTotalCount()),
	}
}

func ToCMSProject(p *cmspb.Project) *CMSProject {
	return &CMSProject{
		ID:          ID(p.GetId()),
		Name:        p.GetName(),
		Alias:       p.GetAlias(),
		Description: p.GetDescription(),
		WorkspaceID: ID(p.GetWorkspaceId()),
		Public:      p.GetVisibility() == cmspb.Visibility_PUBLIC,
		CreatedAt:   toCMSTime(p.GetCreatedAt()),
		UpdatedAt:   toCMSTime(p.GetUpdatedAt()),
	}
}

func ToCMSModel(m *cmspb.Model) *CMSModel {
	return &CMSModel{
		ID:          ID(m.GetId()),
		ProjectID:   ID(m.GetProjectId()),
		Name:        m.GetName(),
		Description: m.GetDescription(),
		Key:         m.GetKey(),
		PublicAPIEp: m.GetPublicApiEp(),
		EditorURL:   m.GetEditorUrl(),
		CreatedAt:   toCMSTime(m.GetCreatedAt()),
		UpdatedAt:   toCMSTime(m.GetUpdatedAt()),
	}
}

func ToCMSAsset(a *cmspb.Asset) *CMSAsset {
	return &CMSAsset{
		ID:                      ID(a.GetId()),
		ProjectID:               ID(a.GetProjectId()),
		Filename:                a.GetFilename(),
		Size:                    int64(a.GetSize()),
		PreviewType:             lo.EmptyableToPtr(a.GetPreviewType()),
		URL:                     a.GetUrl(),
		ArchiveExtractionStatus: lo.EmptyableToPtr(a.GetArchiveExtractionStatus()),
		Public:                  a.GetPublic(),
		CreatedAt:               toCMSTime(a.GetCreatedAt()),
	}
}

// toCMSTime maps an unset timestamp to the zero time rather than the Unix
// epoch that (*timestamppb.Timestamp)(nil).AsTime() would return.
func toCMSTime(t *timestamppb.Timestamp) time.Time {
	if t == nil {
		return time.Time{}
	}
	return t.AsTime()
}
