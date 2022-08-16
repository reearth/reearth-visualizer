package scene

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.SceneID
type WidgetID = id.WidgetID
type ClusterID = id.ClusterID
type LayerID = id.LayerID
type PropertyID = id.PropertyID
type PluginID = id.PluginID
type PluginExtensionID = id.PluginExtensionID
type ProjectID = id.ProjectID
type TeamID = id.TeamID

type IDList = id.SceneIDList
type WidgetIDList = id.WidgetIDList

var NewID = id.NewSceneID
var NewWidgetID = id.NewWidgetID
var NewClusterID = id.NewClusterID
var NewLayerID = id.NewLayerID
var NewPropertyID = id.NewPropertyID
var NewPluginID = id.NewPluginID
var NewProjectID = id.NewProjectID
var NewTeamID = id.NewTeamID

var MustID = id.MustSceneID
var MustWidgetID = id.MustWidgetID
var MustClusterID = id.MustClusterID
var MustLayerID = id.MustLayerID
var MustPropertyID = id.MustPropertyID
var MustPluginID = id.MustPluginID
var MustProjectID = id.MustProjectID
var MustTeamID = id.MustTeamID

var IDFrom = id.SceneIDFrom
var WidgetIDFrom = id.WidgetIDFrom
var ClusterIDFrom = id.ClusterIDFrom
var LayerIDFrom = id.LayerIDFrom
var PropertyIDFrom = id.PropertyIDFrom
var PluginIDFrom = id.PluginIDFrom
var ProjectIDFrom = id.ProjectIDFrom
var TeamIDFrom = id.TeamIDFrom

var IDFromRef = id.SceneIDFromRef
var WidgetIDFromRef = id.WidgetIDFromRef
var ClusterIDFromRef = id.ClusterIDFromRef
var LayerIDFromRef = id.LayerIDFromRef
var PropertyIDFromRef = id.PropertyIDFromRef
var PluginIDFromRef = id.PluginIDFromRef
var ProjectIDFromRef = id.ProjectIDFromRef
var TeamIDFromRef = id.TeamIDFromRef

var OfficialPluginID = id.OfficialPluginID
var ErrInvalidID = id.ErrInvalidID
