package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
)

type AddNLSLayerSimpleInput struct {
	ParentLayerID id.NLSLayerID
	Title         string
	SceneID       id.SceneID
	Index         *int
	LayerType     nlslayer.LayerType
	Config        *nlslayer.Config
	Visible       *bool
}

type UpdateNLSLayerInput struct {
	LayerID id.NLSLayerID
	Name    *string
	Visible *bool
	Config  *nlslayer.Config
}

type AddNLSInfoboxBlockParam struct {
	LayerID     id.NLSLayerID
	PluginID    id.PluginID
	ExtensionID id.PluginExtensionID
	Index       *int
}

type MoveNLSInfoboxBlockParam struct {
	LayerID        id.NLSLayerID
	InfoboxBlockID id.InfoboxBlockID
	Index          int
}

type RemoveNLSInfoboxBlockParam struct {
	LayerID        id.NLSLayerID
	InfoboxBlockID id.InfoboxBlockID
}

type NLSLayer interface {
	Fetch(context.Context, id.NLSLayerIDList, *usecase.Operator) (nlslayer.NLSLayerList, error)
	FetchByScene(context.Context, id.SceneID, *usecase.Operator) (nlslayer.NLSLayerList, error)
	FetchLayerSimple(context.Context, id.NLSLayerIDList, *usecase.Operator) (nlslayer.NLSLayerSimpleList, error)
	FetchParent(context.Context, id.NLSLayerID, *usecase.Operator) (*nlslayer.NLSLayerGroup, error)
	AddLayerSimple(context.Context, AddNLSLayerSimpleInput, *usecase.Operator) (*nlslayer.NLSLayerSimple, error)
	Remove(context.Context, id.NLSLayerID, *usecase.Operator) (id.NLSLayerID, *nlslayer.NLSLayerGroup, error)
	Update(context.Context, UpdateNLSLayerInput, *usecase.Operator) (nlslayer.NLSLayer, error)
	CreateNLSInfobox(context.Context, id.NLSLayerID, *usecase.Operator) (nlslayer.NLSLayer, error)
	RemoveNLSInfobox(context.Context, id.NLSLayerID, *usecase.Operator) (nlslayer.NLSLayer, error)
	AddNLSInfoboxBlock(context.Context, AddNLSInfoboxBlockParam, *usecase.Operator) (*nlslayer.InfoboxBlock, nlslayer.NLSLayer, error)
	MoveNLSInfoboxBlock(context.Context, MoveNLSInfoboxBlockParam, *usecase.Operator) (id.InfoboxBlockID, nlslayer.NLSLayer, int, error)
	RemoveNLSInfoboxBlock(context.Context, RemoveNLSInfoboxBlockParam, *usecase.Operator) (id.InfoboxBlockID, nlslayer.NLSLayer, error)
	Duplicate(context.Context, id.NLSLayerID, *usecase.Operator) (nlslayer.NLSLayer, error)
}
