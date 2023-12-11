package storytelling

import "github.com/reearth/reearth/server/pkg/id"

type StoryID = id.StoryID
type PageID = id.PageID
type BlockID = id.BlockID
type SceneID = id.SceneID
type LayerID = id.NLSLayerID
type LayerIDList = id.NLSLayerIDList
type PropertyID = id.PropertyID
type PluginID = id.PluginID
type PluginExtensionID = id.PluginExtensionID

var NewStoryID = id.NewStoryID
var NewPageID = id.NewPageID
var NewBlockID = id.NewBlockID
var NewSceneID = id.NewSceneID
var NewPropertyID = id.NewPropertyID
var NewPropertySchemaID = id.NewPropertySchemaID
var NewLayerID = id.NewNLSLayerID

var ErrInvalidID = id.ErrInvalidID
