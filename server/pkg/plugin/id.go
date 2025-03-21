package plugin

import "github.com/reearth/reearth/server/pkg/id"

type ID = id.PluginID
type ExtensionID = id.PluginExtensionID
type PropertySchemaID = id.PropertySchemaID
type PropertySchemaIDList = id.PropertySchemaIDList

var NewID = id.NewPluginID
var NewPropertySchemaID = id.NewPropertySchemaID

var MustID = id.MustPluginID
var MustPropertySchemaID = id.MustPropertySchemaID

var IDFrom = id.PluginIDFrom
var PropertySchemaIDFrom = id.PropertySchemaIDFrom

var IDFromRef = id.PluginIDFromRef
var PropertySchemaIDFromRef = id.PropertySchemaIDFromRef

var OfficialPluginID = id.OfficialPluginID
var ErrInvalidID = id.ErrInvalidID
