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

	"github.com/labstack/gommon/log"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
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

func (i *Asset) FindByWorkspaceProject(ctx context.Context, tid accountsID.WorkspaceID, pid *id.ProjectID, keyword *string, sort *asset.SortType, p *usecasex.Pagination, operator *usecase.Operator) ([]*asset.Asset, *usecasex.PageInfo, error) {
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

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, operator *usecase.Operator) (*asset.Asset, error) {
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

	result, _, err := i.uploadAndSave(ctx, inp.File, ws, inp.ProjectID, inp.CoreSupport)
	return result, err
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

func (i *Asset) ImportAssetFiles(ctx context.Context, assets map[string]*zip.File, data *[]byte, newProject *project.Project, operator *usecase.Operator) (*[]byte, map[string]any, error) {
	currentHost := adapter.CurrentHost(ctx)

	var d map[string]any
	if err := json.Unmarshal(*data, &d); err != nil {
		return nil, nil, err
	}

	assetNames := make(map[string]string)
	for beforeName, realName := range d["assets"].(map[string]any) {
		if realName, ok := realName.(string); ok {
			assetNames[beforeName] = realName
		}
	}

	ws, err := i.repos.Workspace.FindByID(ctx, newProject.Workspace())
	if err != nil {
		return nil, nil, err
	}

	result := map[string]any{}

	for beforeName, zipFile := range assets {
		if zipFile.UncompressedSize64 == 0 {
			continue
		}
		realName := assetNames[beforeName]
		readCloser, err := zipFile.Open()
		if err != nil {
			fmt.Printf("open failed for %s: %v", realName, err.Error())
			return nil, result, err
		}

		defer func() {
			if cerr := readCloser.Close(); cerr != nil {
				log.Errorf("[Import Error] closing file: %v\n", cerr)
			}
		}()

		file := &file.File{
			Content:     readCloser,
			Path:        realName,
			Size:        int64(zipFile.UncompressedSize64),
			ContentType: http.DetectContentType([]byte(zipFile.Name)),
		}

		pid := newProject.ID()
		_, url, err := i.uploadAndSave(ctx, file, ws, &pid, true)
		if err != nil {
			log.Errorf("[Import Error] asset upload failed for %s: %v", realName, err.Error())
			return nil, result, err
		}

		// Project logo update will be at this time
		if err := i.updateProjectImage(ctx, newProject, url, beforeName); err != nil {
			return nil, result, err
		}

		afterName := path.Base(url.Path)

		// Replace new asset file name
		beforeUrl := fmt.Sprintf("%s/assets/%s", currentHost, beforeName)
		afterUrl := fmt.Sprintf("%s/assets/%s", currentHost, afterName)
		*data = bytes.ReplaceAll(*data, []byte(beforeUrl), []byte(afterUrl))

		result[afterName] = fmt.Sprintf("name: %s ", realName)
		fmt.Println("[Import Asset] ", afterName, " name: ", realName)
	}

	return data, result, nil
}

func (i *Asset) updateProjectImage(ctx context.Context, newProject *project.Project, url *url.URL, beforeName string) error {
	if newProject.ImageURL() != nil {
		if path.Base(newProject.ImageURL().Path) == beforeName {
			newProject.SetImageURL(url)
			return i.repos.Project.Save(ctx, newProject)
		}
	}
	return nil
}

var (
	ErrAssetUploadSizeLimitExceeded error = rerror.NewE(i18n.T("asset upload size limit exceeded"))
)

func (i *Asset) uploadAndSave(ctx context.Context, f *file.File, ws *accountsWorkspace.Workspace, pid *id.ProjectID, coreSupport bool) (*asset.Asset, *url.URL, error) {

	// upload
	u, size, err := i.gateways.File.UploadAsset(ctx, f)
	if err != nil {
		return nil, nil, err
	}

	if i.gateways != nil && i.gateways.PolicyChecker != nil {
		policyReq := gateway.PolicyCheckRequest{
			WorkspaceID: ws.ID(),
			CheckType:   gateway.PolicyCheckUploadAssetsSize,
			Value:       size,
		}
		policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
		if err != nil {
			return nil, nil, rerror.NewE(i18n.T("policy check failed"))
		}
		if !policyResp.Allowed {
			return nil, nil, ErrAssetUploadSizeLimitExceeded
		}
	}

	// data save
	a, err := asset.New().
		NewID().
		Workspace(ws.ID()).
		Project(pid).
		Name(path.Base(f.Path)).
		Size(size).
		URL(u.String()).
		CoreSupport(coreSupport).
		Build()
	if err != nil {
		log.Errorf("[Import Error] asset build")
		return nil, nil, err
	}

	if err := i.repos.Asset.Save(ctx, a); err != nil {
		log.Errorf("[Import Error] save asset")
		return nil, nil, err
	}

	return a, u, nil
}
