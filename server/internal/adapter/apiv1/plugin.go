package apiv1

import (
	"context"
	"errors"
	"net/url"

	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/apperr"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (Server) ListPlugins(ctx context.Context, req ListPluginsRequestObject) (ListPluginsResponseObject, error) {
	uc, op := usecases(ctx)
	sc, err := projectScene(ctx, uc, req.ProjectId)
	if err != nil {
		return nil, err
	}
	ids := lo.Map(sc.Plugins().Plugins(), func(p *scene.Plugin, _ int) id.PluginID { return p.Plugin() })
	plugins, err := uc.Plugin.Fetch(ctx, ids, op)
	if err != nil {
		return nil, err
	}
	items := make([]Plugin, 0, len(plugins))
	for _, p := range plugins {
		if p != nil {
			items = append(items, toPlugin(p))
		}
	}
	return ListPlugins200JSONResponse(PluginList{Items: items}), nil
}

func (Server) UploadPlugin(ctx context.Context, req UploadPluginRequestObject) (UploadPluginResponseObject, error) {
	uc, op := usecases(ctx)
	sc, err := projectScene(ctx, uc, req.ProjectId)
	if err != nil {
		return nil, err
	}

	var p *plugin.Plugin
	switch {
	case req.Body != nil:
		p, _, err = uc.Plugin.Upload(ctx, req.Body, sc.ID(), op)
	case req.JSONBody != nil:
		u, perr := url.Parse(req.JSONBody.Url)
		if perr != nil || (u.Scheme != "https" && u.Scheme != "http") || u.Host == "" {
			return nil, invalidInput("url must be an http(s) URL")
		}
		p, _, err = uc.Plugin.UploadFromRemote(ctx, u, sc.ID(), op)
	default:
		return nil, invalidInput("send the plugin zip as application/zip, or {\"url\": ...} as application/json")
	}
	if err != nil {
		if isInvalidPluginPackage(err) {
			return nil, invalidInput("%s", err.Error())
		}
		return nil, err
	}
	return UploadPlugin201JSONResponse(toPlugin(p)), nil
}

func (Server) UninstallPlugin(ctx context.Context, req UninstallPluginRequestObject) (UninstallPluginResponseObject, error) {
	uc, op := usecases(ctx)
	sc, err := projectScene(ctx, uc, req.ProjectId)
	if err != nil {
		return nil, err
	}
	pid, err := id.PluginIDFrom(req.PluginId)
	if err != nil {
		return nil, invalidInput("invalid plugin ID %q", req.PluginId)
	}
	if !sc.Plugins().Has(pid) {
		return nil, notFound("plugin")
	}
	if pid.System() {
		return nil, invalidInput("built-in plugin %s cannot be uninstalled", pid)
	}
	if _, err := uc.Scene.UninstallPlugin(ctx, sc.ID(), pid, op); err != nil {
		return nil, err
	}
	return UninstallPlugin204Response{}, nil
}

// projectScene returns the scene of a project the user can read. Plugins are
// installed per scene; the API addresses them by project so that clients
// never need the scene ID.
func projectScene(ctx context.Context, uc *interfaces.Container, projectID string) (*scene.Scene, error) {
	_, op := usecases(ctx)
	pid, err := id.ProjectIDFrom(projectID)
	if err != nil {
		return nil, invalidInput("invalid project ID %q", projectID)
	}
	if _, err := fetchProject(ctx, uc, pid); err != nil {
		return nil, err
	}
	sc, err := uc.Scene.FindByProject(ctx, pid, op)
	if err != nil {
		if apperr.Classify(err) == apperr.ClassNotFound {
			return nil, notFound("scene of the project")
		}
		return nil, err
	}
	return sc, nil
}

// isInvalidPluginPackage reports whether the upload was rejected for its
// contents. The usecase returns the error as a rerror label, which errors.Is
// does not see.
func isInvalidPluginPackage(err error) bool {
	var re *rerror.Error
	if errors.As(err, &re) && re.Label == interfaces.ErrInvalidPluginPackage {
		return true
	}
	return errors.Is(err, interfaces.ErrInvalidPluginPackage)
}

func toPlugin(p *plugin.Plugin) Plugin {
	res := Plugin{
		Id:      p.ID().String(),
		Name:    p.Name().String(),
		Version: p.Version().String(),
		System:  p.ID().System(),
		Extensions: lo.Map(p.Extensions(), func(e *plugin.Extension, _ int) PluginExtension {
			return PluginExtension{Id: e.ID().String(), Type: string(e.Type()), Name: e.Name().String()}
		}),
	}
	if d := p.Description().String(); d != "" {
		res.Description = &d
	}
	if a := p.Author(); a != "" {
		res.Author = &a
	}
	return res
}
