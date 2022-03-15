package scene

import (
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
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

var IDFromRefID = id.SceneIDFromRefID
var WidgetIDFromRefID = id.WidgetIDFromRefID
var ClusterIDFromRefID = id.ClusterIDFromRefID
var LayerIDFromRefID = id.LayerIDFromRefID
var PropertyIDFromRefID = id.PropertyIDFromRefID
var ProjectIDFromRefID = id.ProjectIDFromRefID
var TeamIDFromRefID = id.TeamIDFromRefID

var OfficialPluginID = id.OfficialPluginID
var ErrInvalidID = id.ErrInvalidID

func createdAt(i ID) time.Time {
	return id.ID(i).Timestamp()
}

type IDList []ID

func (l IDList) Clone() IDList {
	if l == nil {
		return nil
	}
	return append(IDList{}, l...)
}

func (l IDList) Filter(ids ...ID) IDList {
	if l == nil {
		return nil
	}

	res := make(IDList, 0, len(l))
	for _, t := range l {
		for _, t2 := range ids {
			if t == t2 {
				res = append(res, t)
			}
		}
	}
	return res
}

func (l IDList) Includes(ids ...ID) bool {
	for _, t := range l {
		for _, t2 := range ids {
			if t == t2 {
				return true
			}
		}
	}
	return false
}

func (l IDList) Len() int {
	return len(l)
}

func (k IDList) Strings() []string {
	return id.SceneIDsToStrings(k)
}
