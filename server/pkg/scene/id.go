package scene

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.SceneID
type WidgetID = id.WidgetID
type PropertyID = id.PropertyID
type PluginID = id.PluginID
type PluginExtensionID = id.PluginExtensionID
type StyleID = id.StyleID

type IDList = id.SceneIDList
type WidgetIDList = id.WidgetIDList

var NewID = id.NewSceneID
var NewWidgetID = id.NewWidgetID
var NewStyleID = id.NewStyleID
var NewPropertyID = id.NewPropertyID
var NewPluginID = id.NewPluginID

var MustID = id.MustSceneID
var MustWidgetID = id.MustWidgetID
var MustPropertyID = id.MustPropertyID
var MustPluginID = id.MustPluginID

var IDFrom = id.SceneIDFrom
var WidgetIDFrom = id.WidgetIDFrom
var PropertyIDFrom = id.PropertyIDFrom
var PluginIDFrom = id.PluginIDFrom

var IDFromRef = id.SceneIDFromRef
var WidgetIDFromRef = id.WidgetIDFromRef
var PropertyIDFromRef = id.PropertyIDFromRef
var PluginIDFromRef = id.PluginIDFromRef

var OfficialPluginID = id.OfficialPluginID
var ErrInvalidID = id.ErrInvalidID
