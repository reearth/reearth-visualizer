package property

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.PropertyID
type ItemID = id.PropertyItemID
type FieldID = id.PropertyFieldID
type SchemaID = id.PropertySchemaID
type SchemaGroupID = id.PropertySchemaGroupID

var NewID = id.NewPropertyID
var NewItemID = id.NewPropertyItemID
var NewSchemaID = id.NewPropertySchemaID

var MustID = id.MustPropertyID
var MustItemID = id.MustPropertyItemID
var MustSchemaID = id.MustPropertySchemaID

var IDFrom = id.PropertyIDFrom
var ItemIDFrom = id.PropertyItemIDFrom
var SchemaIDFrom = id.PropertySchemaIDFrom

var IDFromRef = id.PropertyIDFromRef
var ItemIDFromRef = id.PropertyItemIDFromRef
var SchemaIDFromRef = id.PropertySchemaIDFromRef

type IDSet = id.PropertyIDSet
type IDList = id.PropertyIDList
type ItemIDSet = id.PropertyItemIDSet

var NewIDSet = id.NewPropertyIDSet
var NewItemIDSet = id.NewPropertyItemIDSet

var ErrInvalidID = id.ErrInvalidID
