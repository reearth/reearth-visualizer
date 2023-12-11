package nlslayerops

import (
	"github.com/pkg/errors"
	"github.com/reearth/reearth/server/pkg/nlslayer"
)

type LayerSimple struct {
	SceneID   nlslayer.SceneID
	LayerType nlslayer.LayerType
	Config    *nlslayer.Config
	Index     *int
	Title     string
	Visible   *bool
}

func (i LayerSimple) Initialize() (*nlslayer.NLSLayerSimple, error) {
	builder := nlslayer.NewNLSLayerSimple().NewID().Scene(i.SceneID).LayerType(i.LayerType).Title(i.Title)

	var err error
	if i.Config != nil {
		builder.Config(i.Config)
	}

	if i.Visible != nil {
		builder.IsVisible(*i.Visible)
	} else {
		builder.IsVisible(true)
	}

	var layerSimple *nlslayer.NLSLayerSimple

	if i.LayerType.IsValidLayerType() {
		layerSimple, err = builder.Build()

		if err != nil {
			return nil, err
		}
	} else {
		return nil, errors.New("layer type must be 'simple' or 'group'")
	}

	return layerSimple, nil
}
