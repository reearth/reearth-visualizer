package nlslayerops

import (
	"github.com/reearth/reearth/server/pkg/nlslayer"
)

type LayerSimple struct {
	SceneID                nlslayer.SceneID
	LayerType              string
	Data                   *nlslayer.Data
	Common				   *nlslayer.LayerID
	Properties			   *nlslayer.Properties
	Defines				   *nlslayer.Defines
	Events				   *nlslayer.Events
	Appearance 			   *nlslayer.Appearance
	Index				   *int
}

func (i LayerSimple) Initialize() (*nlslayer.NLSLayerSimple, error) {
	builder := nlslayer.NewNLSLayerSimple().NewID().Scene(i.SceneID).Type(i.LayerType)

	var err error
	if i.Appearance != nil {
		builder.Appearance(i.Appearance)
	}
	if i.Properties != nil {
		builder.Properties(i.Properties)
	}
	if i.Defines != nil {
		builder.Defines(i.Defines)
	}
	if i.Defines != nil {
		builder.Events(i.Events)
	}
	if i.Common != nil {
		builder.CommonLayer(i.Common)
	}

	var layerSimple *nlslayer.NLSLayerSimple
	
	if i.Data != nil && i.Data.IsValidType() {
		layerSimple, err = builder.Data(i.Data).Build()

		if err != nil {
			return nil,  err
		}
	}

	return layerSimple, nil
}
