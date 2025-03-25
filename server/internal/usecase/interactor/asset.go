package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
)

type Asset struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewAsset(r *repo.Container, g *gateway.Container) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
	}
}

func (i *Asset) Fetch(ctx context.Context, assets []id.AssetID, operator *usecase.Operator) ([]*asset.Asset, error) {
	return i.repos.Asset.FindByIDs(ctx, assets)
}

func (i *Asset) FindByWorkspaceProject(ctx context.Context, tid accountdomain.WorkspaceID, pid *id.ProjectID, keyword *string, sort *asset.SortType, p *usecasex.Pagination, operator *usecase.Operator) ([]*asset.Asset, *usecasex.PageInfo, error) {
	return Run2(
		ctx, operator, i.repos,
		Usecase().WithReadableWorkspaces(tid),
		func(ctx context.Context) ([]*asset.Asset, *usecasex.PageInfo, error) {
			return i.repos.Asset.FindByWorkspaceProject(ctx, tid, pid, repo.AssetFilter{
				Sort:       sort,
				Keyword:    keyword,
				Pagination: p,
			})
		},
	)
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}

	ws, err := i.repos.Workspace.FindByID(ctx, inp.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if !operator.IsWritableWorkspace(ws.ID()) {
		return nil, interfaces.ErrOperationDenied
	}

	url, size, err := i.gateways.File.UploadAsset(ctx, inp.File)
	if err != nil {
		return nil, err
	}

	// enforce policy
	if policyID := operator.Policy(ws.Policy()); policyID != nil {
		p, err := i.repos.Policy.FindByID(ctx, *policyID)
		if err != nil {
			return nil, err
		}
		s, err := i.repos.Asset.TotalSizeByWorkspace(ctx, ws.ID())
		if err != nil {
			return nil, err
		}
		if err := p.EnforceAssetStorageSize(s + size); err != nil {
			_ = i.gateways.File.RemoveAsset(ctx, url)
			return nil, err
		}
	}

	a, err := asset.New().
		NewID().
		Workspace(inp.WorkspaceID).
		Project(inp.ProjectID).
		Name(path.Base(inp.File.Path)).
		Size(size).
		URL(url.String()).
		CoreSupport(inp.CoreSupport).
		Build()
	if err != nil {
		return nil, err
	}

	if err := i.repos.Asset.Save(ctx, a); err != nil {
		return nil, err
	}

	return a, nil
}

func (i *Asset) Update(ctx context.Context, aid id.AssetID, pid *id.ProjectID, operator *usecase.Operator) (id.AssetID, *id.ProjectID, error) {
	return Run2(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (id.AssetID, *id.ProjectID, error) {
			asset, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				return aid, pid, err
			}

			if ok := operator.IsWritableWorkspace(asset.Workspace()); !ok {
				return aid, pid, interfaces.ErrOperationDenied
			}

			asset.SetProject(pid)

			return aid, pid, i.repos.Asset.Save(ctx, asset)
		},
	)
}

func (i *Asset) Remove(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (id.AssetID, error) {
			asset, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				return aid, err
			}

			if ok := operator.IsWritableWorkspace(asset.Workspace()); !ok {
				return aid, interfaces.ErrOperationDenied
			}

			if url, _ := url.Parse(asset.URL()); url != nil {
				if err := i.gateways.File.RemoveAsset(ctx, url); err != nil {
					return aid, err
				}
			}

			return aid, i.repos.Asset.Remove(ctx, aid)
		},
	)
}

func (i *Asset) ImportAssetFiles(ctx context.Context, assets map[string]*zip.File, data *[]byte, newProject *project.Project) (*[]byte, error) {
	currentHost := adapter.CurrentHost(ctx)

	var d map[string]any
	if err := json.Unmarshal(*data, &d); err != nil {
		return nil, err
	}

	assetNames := make(map[string]string)
	for beforeName, realName := range d["assets"].(map[string]any) {
		if realName, ok := realName.(string); ok {
			assetNames[beforeName] = realName
		}
	}

	for beforeName, zipFile := range assets {
		if zipFile.UncompressedSize64 == 0 {
			continue
		}
		realName := assetNames[beforeName]
		readCloser, err := zipFile.Open()
		if err != nil {
			return nil, err
		}

		defer func() {
			if cerr := readCloser.Close(); cerr != nil {
				fmt.Printf("Error closing file: %v\n", cerr)
			}
		}()

		file := &file.File{
			Content:     readCloser,
			Path:        realName,
			Size:        int64(zipFile.UncompressedSize64),
			ContentType: http.DetectContentType([]byte(zipFile.Name)),
		}

		url, size, err := i.gateways.File.UploadAsset(ctx, file)
		if err != nil {
			return nil, err
		}

		// Project logo update will be at this time
		if newProject.ImageURL() != nil {
			if path.Base(newProject.ImageURL().Path) == beforeName {
				newProject.SetImageURL(url)
				err := i.repos.Project.Save(ctx, newProject)
				if err != nil {
					return nil, err
				}
			}
		}

		a, err := asset.New().
			NewID().
			Workspace(newProject.Workspace()).
			Project(newProject.ID().Ref()).
			Name(path.Base(realName)).
			Size(size).
			URL(url.String()).
			CoreSupport(true).
			Build()
		if err != nil {
			return nil, err
		}

		if err := i.repos.Asset.Save(ctx, a); err != nil {
			return nil, err
		}
		afterName := path.Base(url.Path)

		// Replace new asset file name
		beforeUrl := fmt.Sprintf("%s/assets/%s", currentHost, beforeName)
		afterUrl := fmt.Sprintf("%s/assets/%s", currentHost, afterName)
		*data = bytes.Replace(*data, []byte(beforeUrl), []byte(afterUrl), -1)
	}

	return data, nil
}
