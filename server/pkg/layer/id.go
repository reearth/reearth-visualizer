package layer

import (
	"sort"

	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.LayerID
type InfoboxFieldID = id.InfoboxFieldID
type TagID = id.TagID
type SceneID = id.SceneID
type PluginID = id.PluginID
type PluginExtensionID = id.PluginExtensionID
type PropertyID = id.PropertyID
type DatasetID = id.DatasetID
type DatasetSchemaID = id.DatasetSchemaID

var NewID = id.NewLayerID
var NewInfoboxFieldID = id.NewInfoboxFieldID
var NewTagID = id.NewTagID
var NewSceneID = id.NewSceneID
var NewPropertyID = id.NewPropertyID
var NewPropertySchemaID = id.NewPropertySchemaID
var NewDatasetID = id.NewDatasetID
var NewDatasetSchemaID = id.NewDatasetSchemaID

var MustID = id.MustLayerID
var MustInfoboxFieldID = id.MustInfoboxFieldID
var MustTagID = id.MustTagID
var MustSceneID = id.MustSceneID
var MustPluginID = id.MustPluginID
var MustPropertyID = id.MustPropertyID

var IDFrom = id.LayerIDFrom
var InfoboxFieldIDFrom = id.InfoboxFieldIDFrom
var TagIDFrom = id.TagIDFrom
var SceneIDFrom = id.SceneIDFrom
var PropertyIDFrom = id.PropertyIDFrom
var DatasetIDFrom = id.DatasetIDFrom
var DatasetSchemaIDFrom = id.DatasetSchemaIDFrom

var IDFromRef = id.LayerIDFromRef
var InfoboxFieldIDFromRef = id.InfoboxFieldIDFromRef
var TagIDFromRef = id.TagIDFromRef
var SceneIDFromRef = id.SceneIDFromRef
var PropertyIDFromRef = id.PropertyIDFromRef
var DatasetIDFromRef = id.DatasetIDFromRef
var DatasetSchemaIDFromRef = id.DatasetSchemaIDFromRef

type IDSet = id.LayerIDSet
type InfoboxFIeldIDSet = id.InfoboxFieldIDSet
type DatasetIDSet = id.DatasetIDSet
type DatasetIDList = id.DatasetIDList
type TagIDSet = id.TagIDSet
type TagIDList = id.TagIDList

var NewIDSet = id.NewLayerIDSet
var NewInfoboxFIeldIDSet = id.NewInfoboxFieldIDSet
var NewDatasetIDSet = id.NewDatasetIDSet
var NewTagIDSet = id.NewTagIDSet

var OfficialPluginID = id.OfficialPluginID
var ErrInvalidID = id.ErrInvalidID

func sortIDs(a []ID) {
	sort.SliceStable(a, func(i, j int) bool {
		return a[i].Compare(a[j]) < 0
	})
}
