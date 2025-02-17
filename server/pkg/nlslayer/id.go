package nlslayer

import (
	"sort"

	"github.com/reearth/reearth/server/pkg/id"
)

type SceneID = id.SceneID
type PropertyID = id.PropertyID
type InfoboxID = id.InfoboxID
type InfoboxBlockID = id.InfoboxBlockID
type PluginID = id.PluginID
type PluginExtensionID = id.PluginExtensionID
type FeatureID = id.FeatureID

var NewID = id.NewNLSLayerID
var NewInfoboxID = id.NewInfoboxID
var NewInfoboxBlockID = id.NewInfoboxBlockID
var NewFeatureID = id.NewFeatureID

var ErrInvalidID = id.ErrInvalidID

func sortIDs(a []id.NLSLayerID) {
	sort.SliceStable(a, func(i, j int) bool {
		return a[i].Compare(a[j]) < 0
	})
}
