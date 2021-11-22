package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/scene"
)

func (r *mutationResolver) CreateScene(ctx context.Context, input gqlmodel.CreateSceneInput) (*gqlmodel.CreateScenePayload, error) {
	exit := trace(ctx)
	defer exit()

	res, err := r.usecases.Scene.Create(
		ctx,
		id.ProjectID(input.ProjectID),
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateScenePayload{
		Scene: gqlmodel.ToScene(res),
	}, nil
}

func (r *mutationResolver) AddWidget(ctx context.Context, input gqlmodel.AddWidgetInput) (*gqlmodel.AddWidgetPayload, error) {
	exit := trace(ctx)
	defer exit()

	scene, widget, err := r.usecases.Scene.AddWidget(
		ctx,
		id.SceneID(input.SceneID),
		input.PluginID,
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
	exit := trace(ctx)
	defer exit()

	scene, widget, err := r.usecases.Scene.UpdateWidget(ctx, interfaces.UpdateWidgetParam{
		SceneID:  id.SceneID(input.SceneID),
		WidgetID: id.WidgetID(input.WidgetID),
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
	exit := trace(ctx)
	defer exit()

	scene, err := r.usecases.Scene.RemoveWidget(ctx,
		id.SceneID(input.SceneID),
		id.WidgetID(input.WidgetID),
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
	exit := trace(ctx)
	defer exit()

	scene, err := r.usecases.Scene.UpdateWidgetAlignSystem(ctx, interfaces.UpdateWidgetAlignSystemParam{
		SceneID:  id.SceneID(input.SceneID),
		Location: *gqlmodel.FromSceneWidgetLocation(input.Location),
		Align:    gqlmodel.FromWidgetAlignType(input.Align),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWidgetAlignSystemPayload{
		Scene: gqlmodel.ToScene(scene),
	}, nil
}

func (r *mutationResolver) InstallPlugin(ctx context.Context, input gqlmodel.InstallPluginInput) (*gqlmodel.InstallPluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	scene, pl, pr, err := r.usecases.Scene.InstallPlugin(ctx,
		id.SceneID(input.SceneID),
		input.PluginID,
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.InstallPluginPayload{
		Scene: gqlmodel.ToScene(scene), ScenePlugin: &gqlmodel.ScenePlugin{
			PluginID:   pl,
			PropertyID: pr.IDRef(),
		},
	}, nil
}

func (r *mutationResolver) UploadPlugin(ctx context.Context, input gqlmodel.UploadPluginInput) (*gqlmodel.UploadPluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	operator := getOperator(ctx)
	var p *plugin.Plugin
	var s *scene.Scene
	var err error

	if input.File != nil {
		p, s, err = r.usecases.Plugin.Upload(ctx, input.File.File, id.SceneID(input.SceneID), operator)
	} else if input.URL != nil {
		p, s, err = r.usecases.Plugin.UploadFromRemote(ctx, input.URL, id.SceneID(input.SceneID), operator)
	} else {
		return nil, errors.New("either file or url is required")
	}
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UploadPluginPayload{
		Plugin:      gqlmodel.ToPlugin(p),
		Scene:       gqlmodel.ToScene(s),
		ScenePlugin: gqlmodel.ToScenePlugin(s.PluginSystem().Plugin(p.ID())),
	}, nil
}

func (r *mutationResolver) UninstallPlugin(ctx context.Context, input gqlmodel.UninstallPluginInput) (*gqlmodel.UninstallPluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	scene, err := r.usecases.Scene.UninstallPlugin(ctx,
		id.SceneID(input.SceneID),
		id.PluginID(input.PluginID),
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UninstallPluginPayload{
		PluginID: input.PluginID,
		Scene:    gqlmodel.ToScene(scene),
	}, nil
}

func (r *mutationResolver) UpgradePlugin(ctx context.Context, input gqlmodel.UpgradePluginInput) (*gqlmodel.UpgradePluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	s, err := r.usecases.Scene.UpgradePlugin(ctx,
		id.SceneID(input.SceneID),
		input.PluginID,
		input.ToPluginID,
		getOperator(ctx),
	)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpgradePluginPayload{
		Scene:       gqlmodel.ToScene(s),
		ScenePlugin: gqlmodel.ToScenePlugin(s.PluginSystem().Plugin(input.ToPluginID)),
	}, nil
}

func (r *mutationResolver) AddCluster(ctx context.Context, input gqlmodel.AddClusterInput) (*gqlmodel.AddClusterPayload, error) {
	exit := trace(ctx)
	defer exit()
	s, c, err := r.usecases.Scene.AddCluster(ctx, id.SceneID(input.SceneID), input.Name, id.PropertyID(input.PropertyID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddClusterPayload{
		Scene:   gqlmodel.ToScene(s),
		Cluster: gqlmodel.ToCluster(c),
	}, nil
}

func (r *mutationResolver) UpdateCluster(ctx context.Context, input gqlmodel.UpdateClusterInput) (*gqlmodel.UpdateClusterPayload, error) {
	exit := trace(ctx)
	defer exit()
	s, c, err := r.usecases.Scene.UpdateCluster(ctx, interfaces.UpdateClusterParam{
		ClusterID:  id.ClusterID(input.ClusterID),
		SceneID:    id.SceneID(input.SceneID),
		Name:       input.Name,
		PropertyID: id.PropertyIDFromRefID(input.PropertyID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateClusterPayload{
		Scene:   gqlmodel.ToScene(s),
		Cluster: gqlmodel.ToCluster(c),
	}, nil
}

func (r *mutationResolver) RemoveCluster(ctx context.Context, input gqlmodel.RemoveClusterInput) (*gqlmodel.RemoveClusterPayload, error) {
	exit := trace(ctx)
	defer exit()
	s, err := r.usecases.Scene.RemoveCluster(ctx, id.SceneID(input.SceneID), id.ClusterID(input.ClusterID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveClusterPayload{
		Scene:     gqlmodel.ToScene(s),
		ClusterID: input.ClusterID,
	}, nil
}
