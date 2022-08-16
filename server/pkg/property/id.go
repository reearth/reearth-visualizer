package property

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.PropertyID
type ItemID = id.PropertyItemID
type FieldID = id.PropertyFieldID
type SchemaID = id.PropertySchemaID
type SchemaGroupID = id.PropertySchemaGroupID
type DatasetID = id.DatasetID
type DatasetFieldID = id.DatasetFieldID
type DatasetSchemaID = id.DatasetSchemaID
type SceneID = id.SceneID

var NewID = id.NewPropertyID
var NewItemID = id.NewPropertyItemID
var NewSchemaID = id.NewPropertySchemaID
var NewDatasetID = id.NewDatasetID
var NewDatasetFieldID = id.NewDatasetFieldID
var NewDatasetSchemaID = id.NewDatasetSchemaID
var NewSceneID = id.NewSceneID

var MustID = id.MustPropertyID
var MustItemID = id.MustPropertyItemID
var MustSchemaID = id.MustPropertySchemaID
var MustDatasetID = id.MustDatasetID
var MustDatasetFieldID = id.MustDatasetFieldID
var MustDatasetSchemaID = id.MustDatasetSchemaID
var MustSceneID = id.MustSceneID

var IDFrom = id.PropertyIDFrom
var ItemIDFrom = id.PropertyItemIDFrom
var SchemaIDFrom = id.PropertySchemaIDFrom
var DatasetIDFrom = id.DatasetIDFrom
var DatasetFieldIDFrom = id.DatasetFieldIDFrom
var DatasetSchemaIDFrom = id.DatasetSchemaIDFrom
var SceneIDFrom = id.SceneIDFrom

var IDFromRef = id.PropertyIDFromRef
var ItemIDFromRef = id.PropertyItemIDFromRef
var SchemaIDFromRef = id.PropertySchemaIDFromRef
var DatasetIDFromRef = id.DatasetIDFromRef
var DatasetFieldIDFromRef = id.DatasetFieldIDFromRef
var DatasetSchemaIDFromRef = id.DatasetSchemaIDFromRef
var SceneIDFromRef = id.SceneIDFromRef

type IDSet = id.PropertyIDSet
type IDList = id.PropertyIDList
type ItemIDSet = id.PropertyItemIDSet

var NewIDSet = id.NewPropertyIDSet
var NewItemIDSet = id.NewPropertyItemIDSet

var ErrInvalidID = id.ErrInvalidID
