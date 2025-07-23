package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/scene"
)

func (r *mutationResolver) CreateScene(ctx context.Context, input gqlmodel.CreateSceneInput) (*gqlmodel.CreateScenePayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Scene.Create(ctx, pid, true, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateScenePayload{
		Scene: gqlmodel.ToScene(res),
	}, nil
}

func (r *mutationResolver) PublishScene(ctx context.Context, input gqlmodel.PublishSceneInput) (*gqlmodel.ScenePayload, error) {

	sid, err := gqlmodel.ToID[id.Project](input.ID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Scene.Publish(ctx, interfaces.PublishSceneParam{
		ID:     sid,
		Alias:  input.Alias,
		Status: gqlmodel.FromPublishmentStatus(input.Status),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ScenePayload{
		Scene: gqlmodel.ToScene(res),
	}, nil
}

func (r *mutationResolver) AddWidget(ctx context.Context, input gqlmodel.AddWidgetInput) (*gqlmodel.AddWidgetPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	pid, err := gqlmodel.ToPluginID(input.PluginID)
	if err != nil {
		return nil, err
	}

	scene, widget, err := usecases(ctx).Scene.AddWidget(
		ctx,
		sid,
		pid,
		id.PluginExtensionID(input.ExtensionID),
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddWidgetPayload{
		Scene:       gqlmodel.ToScene(scene),
		SceneWidget: gqlmodel.ToSceneWidget(widget),
	}, nil
}

func (r *mutationResolver) UpdateWidget(ctx context.Context, input gqlmodel.UpdateWidgetInput) (*gqlmodel.UpdateWidgetPayload, error) {
	sid, wid, err := gqlmodel.ToID2[id.Scene, id.Widget](input.SceneID, input.WidgetID)
	if err != nil {
		return nil, err
	}

	scene, widget, err := usecases(ctx).Scene.UpdateWidget(ctx, interfaces.UpdateWidgetParam{
		SceneID:  sid,
		WidgetID: wid,
		Enabled:  input.Enabled,
		Extended: input.Extended,
		Location: gqlmodel.FromSceneWidgetLocation(input.Location),
		Index:    input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWidgetPayload{
		Scene:       gqlmodel.ToScene(scene),
		SceneWidget: gqlmodel.ToSceneWidget(widget),
	}, nil
}

func (r *mutationResolver) RemoveWidget(ctx context.Context, input gqlmodel.RemoveWidgetInput) (*gqlmodel.RemoveWidgetPayload, error) {
	sid, wid, err := gqlmodel.ToID2[id.Scene, id.Widget](input.SceneID, input.WidgetID)
	if err != nil {
		return nil, err
	}

	scene, err := usecases(ctx).Scene.RemoveWidget(ctx,
		sid,
		wid,
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveWidgetPayload{
		Scene:    gqlmodel.ToScene(scene),
		WidgetID: input.WidgetID,
	}, nil
}

func (r *mutationResolver) UpdateWidgetAlignSystem(ctx context.Context, input gqlmodel.UpdateWidgetAlignSystemInput) (*gqlmodel.UpdateWidgetAlignSystemPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	scene, err := usecases(ctx).Scene.UpdateWidgetAlignSystem(ctx, interfaces.UpdateWidgetAlignSystemParam{
		SceneID:    sid,
		Location:   *gqlmodel.FromSceneWidgetLocation(input.Location),
		Align:      gqlmodel.FromWidgetAlignType(input.Align),
		Padding:    gqlmodel.FromSceneWidgetAreaPadding(input.Padding),
		Gap:        input.Gap,
		Centered:   input.Centered,
		Background: input.Background,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWidgetAlignSystemPayload{
		Scene: gqlmodel.ToScene(scene),
	}, nil
}

func (r *mutationResolver) InstallPlugin(ctx context.Context, input gqlmodel.InstallPluginInput) (*gqlmodel.InstallPluginPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	pid, err := gqlmodel.ToPluginID(input.PluginID)
	if err != nil {
		return nil, err
	}

	scene, pr, err := usecases(ctx).Scene.InstallPlugin(ctx, sid, pid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.InstallPluginPayload{
		Scene: gqlmodel.ToScene(scene), ScenePlugin: &gqlmodel.ScenePlugin{
			PluginID:   input.PluginID,
			PropertyID: gqlmodel.IDFromRef(pr),
		},
	}, nil
}

func (r *mutationResolver) UploadPlugin(ctx context.Context, input gqlmodel.UploadPluginInput) (*gqlmodel.UploadPluginPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	operator := getOperator(ctx)
	var p *plugin.Plugin
	var s *scene.Scene

	if input.File != nil {
		p, s, err = usecases(ctx).Plugin.Upload(ctx, input.File.File, sid, operator)
	} else if input.URL != nil {
		p, s, err = usecases(ctx).Plugin.UploadFromRemote(ctx, input.URL, sid, operator)
	} else {
		return nil, errors.New("either file or url is required")
	}
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UploadPluginPayload{
		Plugin:      gqlmodel.ToPlugin(p),
		Scene:       gqlmodel.ToScene(s),
		ScenePlugin: gqlmodel.ToScenePlugin(s.Plugins().Plugin(p.ID())),
	}, nil
}

func (r *mutationResolver) UninstallPlugin(ctx context.Context, input gqlmodel.UninstallPluginInput) (*gqlmodel.UninstallPluginPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	pid, err := gqlmodel.ToPluginID(input.PluginID)
	if err != nil {
		return nil, err
	}

	scene, err := usecases(ctx).Scene.UninstallPlugin(ctx, sid, pid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UninstallPluginPayload{
		PluginID: input.PluginID,
		Scene:    gqlmodel.ToScene(scene),
	}, nil
}

func (r *mutationResolver) UpgradePlugin(ctx context.Context, input gqlmodel.UpgradePluginInput) (*gqlmodel.UpgradePluginPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	pid, topid, err := gqlmodel.ToPluginID2(input.PluginID, input.ToPluginID)
	if err != nil {
		return nil, err
	}

	s, err := usecases(ctx).Scene.UpgradePlugin(ctx,
		sid,
		pid,
		topid,
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpgradePluginPayload{
		Scene:       gqlmodel.ToScene(s),
		ScenePlugin: gqlmodel.ToScenePlugin(s.Plugins().Plugin(topid)),
	}, nil
}
