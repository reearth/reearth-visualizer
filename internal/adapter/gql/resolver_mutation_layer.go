package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/samber/lo"
)

func (r *mutationResolver) AddLayerItem(ctx context.Context, input gqlmodel.AddLayerItemInput) (*gqlmodel.AddLayerItemPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.ParentLayerID)
	if err != nil {
		return nil, err
	}

	// layers are no longer extendable with plugins
	// pid, err := gqlmodel.ToPluginID(input.PluginID)
	// if err != nil {
	// 	return nil, err
	// }

	layer, parent, err := usecases(ctx).Layer.AddItem(ctx, interfaces.AddLayerItemInput{
		ParentLayerID: lid,
		// layers are no longer extendable with plugins
		// PluginID:      &pid,
		ExtensionID: lo.ToPtr(id.PluginExtensionID(input.ExtensionID)),
		Index:       input.Index,
		Name:        gqlmodel.RefToString(input.Name),
		LatLng:      gqlmodel.ToPropertyLatLng(input.Lat, input.Lng),
		// LinkedDatasetID: input.LinkedDatasetID,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddLayerItemPayload{
		Layer:       gqlmodel.ToLayerItem(layer, parent.IDRef()),
		ParentLayer: gqlmodel.ToLayerGroup(parent, nil),
		Index:       input.Index,
	}, nil
}

func (r *mutationResolver) AddLayerGroup(ctx context.Context, input gqlmodel.AddLayerGroupInput) (*gqlmodel.AddLayerGroupPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.ParentLayerID)
	if err != nil {
		return nil, err
	}

	layer, parent, err := usecases(ctx).Layer.AddGroup(ctx, interfaces.AddLayerGroupInput{
		ParentLayerID: lid,
		// layers are no longer extendable with plugins
		// PluginID:           gqlmodel.ToPluginIDRef(input.PluginID),
		ExtensionID:           gqlmodel.ToStringIDRef[id.PluginExtension](input.ExtensionID),
		Index:                 input.Index,
		Name:                  gqlmodel.RefToString(input.Name),
		LinkedDatasetSchemaID: gqlmodel.ToIDRef[id.DatasetSchema](input.LinkedDatasetSchemaID),
		RepresentativeFieldId: gqlmodel.ToIDRef[id.DatasetField](input.RepresentativeFieldID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddLayerGroupPayload{
		Layer:       gqlmodel.ToLayerGroup(layer, parent.IDRef()),
		ParentLayer: gqlmodel.ToLayerGroup(parent, nil),
		Index:       input.Index,
	}, nil
}

func (r *mutationResolver) RemoveLayer(ctx context.Context, input gqlmodel.RemoveLayerInput) (*gqlmodel.RemoveLayerPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.LayerID)
	if err != nil {
		return nil, err
	}

	id, layer, err := usecases(ctx).Layer.Remove(ctx, lid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveLayerPayload{
		LayerID:     gqlmodel.IDFrom(id),
		ParentLayer: gqlmodel.ToLayerGroup(layer, nil),
	}, nil
}

func (r *mutationResolver) UpdateLayer(ctx context.Context, input gqlmodel.UpdateLayerInput) (*gqlmodel.UpdateLayerPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.LayerID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).Layer.Update(ctx, interfaces.UpdateLayerInput{
		LayerID: lid,
		Name:    input.Name,
		Visible: input.Visible,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateLayerPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) MoveLayer(ctx context.Context, input gqlmodel.MoveLayerInput) (*gqlmodel.MoveLayerPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.LayerID)
	if err != nil {
		return nil, err
	}

	targetLayerID, layerGroupFrom, layerGroupTo, index, err := usecases(ctx).Layer.Move(ctx, interfaces.MoveLayerInput{
		LayerID:     lid,
		DestLayerID: gqlmodel.ToIDRef[id.Layer](input.DestLayerID),
		Index:       gqlmodel.RefToIndex(input.Index),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveLayerPayload{
		LayerID:         gqlmodel.IDFrom(targetLayerID),
		FromParentLayer: gqlmodel.ToLayerGroup(layerGroupFrom, nil),
		ToParentLayer:   gqlmodel.ToLayerGroup(layerGroupTo, nil),
		Index:           index,
	}, nil
}

func (r *mutationResolver) CreateInfobox(ctx context.Context, input gqlmodel.CreateInfoboxInput) (*gqlmodel.CreateInfoboxPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.LayerID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).Layer.CreateInfobox(ctx, lid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateInfoboxPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) RemoveInfobox(ctx context.Context, input gqlmodel.RemoveInfoboxInput) (*gqlmodel.RemoveInfoboxPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.LayerID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).Layer.RemoveInfobox(ctx, lid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveInfoboxPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) AddInfoboxField(ctx context.Context, input gqlmodel.AddInfoboxFieldInput) (*gqlmodel.AddInfoboxFieldPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.LayerID)
	if err != nil {
		return nil, err
	}

	pid, err := gqlmodel.ToPluginID(input.PluginID)
	if err != nil {
		return nil, err
	}

	infoboxField, layer, err := usecases(ctx).Layer.AddInfoboxField(ctx, interfaces.AddInfoboxFieldParam{
		LayerID:     lid,
		PluginID:    pid,
		ExtensionID: id.PluginExtensionID(input.ExtensionID),
		Index:       input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddInfoboxFieldPayload{
		InfoboxField: gqlmodel.ToInfoboxField(infoboxField, layer.Scene(), nil),
		Layer:        gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) MoveInfoboxField(ctx context.Context, input gqlmodel.MoveInfoboxFieldInput) (*gqlmodel.MoveInfoboxFieldPayload, error) {
	lid, ifid, err := gqlmodel.ToID2[id.Layer, id.InfoboxField](input.LayerID, input.InfoboxFieldID)
	if err != nil {
		return nil, err
	}

	infoboxField, layer, index, err := usecases(ctx).Layer.MoveInfoboxField(ctx, interfaces.MoveInfoboxFieldParam{
		LayerID:        lid,
		InfoboxFieldID: ifid,
		Index:          input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveInfoboxFieldPayload{
		InfoboxFieldID: gqlmodel.IDFrom(infoboxField),
		Layer:          gqlmodel.ToLayer(layer, nil),
		Index:          index,
	}, nil
}

func (r *mutationResolver) RemoveInfoboxField(ctx context.Context, input gqlmodel.RemoveInfoboxFieldInput) (*gqlmodel.RemoveInfoboxFieldPayload, error) {
	lid, ifid, err := gqlmodel.ToID2[id.Layer, id.InfoboxField](input.LayerID, input.InfoboxFieldID)
	if err != nil {
		return nil, err
	}

	infoboxField, layer, err := usecases(ctx).Layer.RemoveInfoboxField(ctx, interfaces.RemoveInfoboxFieldParam{
		LayerID:        lid,
		InfoboxFieldID: ifid,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveInfoboxFieldPayload{
		InfoboxFieldID: gqlmodel.IDFrom(infoboxField),
		Layer:          gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) ImportLayer(ctx context.Context, input gqlmodel.ImportLayerInput) (*gqlmodel.ImportLayerPayload, error) {
	lid, err := gqlmodel.ToID[id.Layer](input.LayerID)
	if err != nil {
		return nil, err
	}

	l, l2, err := usecases(ctx).Layer.ImportLayer(ctx, interfaces.ImportLayerParam{
		LayerID: lid,
		File:    gqlmodel.FromFile(&input.File),
		Format:  gqlmodel.FromLayerEncodingFormat(input.Format),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ImportLayerPayload{
		Layers:      gqlmodel.ToLayers(l, l2.IDRef()),
		ParentLayer: gqlmodel.ToLayerGroup(l2, nil),
	}, err
}

func (r *mutationResolver) AttachTagToLayer(ctx context.Context, input gqlmodel.AttachTagToLayerInput) (*gqlmodel.AttachTagToLayerPayload, error) {
	lid, tid, err := gqlmodel.ToID2[id.Layer, id.Tag](input.LayerID, input.TagID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).Layer.AttachTag(ctx, lid, tid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AttachTagToLayerPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) DetachTagFromLayer(ctx context.Context, input gqlmodel.DetachTagFromLayerInput) (*gqlmodel.DetachTagFromLayerPayload, error) {
	lid, tid, err := gqlmodel.ToID2[id.Layer, id.Tag](input.LayerID, input.TagID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).Layer.DetachTag(ctx, lid, tid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DetachTagFromLayerPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}
