package property

import (
	"sort"

	"github.com/reearth/reearth-backend/pkg/id"
)

type ID = id.PropertyID
type ItemID = id.PropertyItemID
type FieldID = id.PropertySchemaFieldID
type SchemaID = id.PropertySchemaID
type SchemaGroupID = id.PropertySchemaGroupID
type DatasetID = id.DatasetID
type DatasetFieldID = id.DatasetSchemaFieldID
type DatasetSchemaID = id.DatasetSchemaID
type SceneID = id.SceneID

var NewID = id.NewPropertyID
var NewItemID = id.NewPropertyItemID
var NewSchemaID = id.NewPropertySchemaID
var NewDatasetID = id.NewDatasetID
var NewDatasetFieldID = id.NewDatasetSchemaFieldID
var NewDatasetSchemaID = id.NewDatasetSchemaID
var NewSceneID = id.NewSceneID

var MustID = id.MustPropertyID
var MustItemID = id.MustPropertyItemID
var MustSchemaID = id.MustPropertySchemaID
var MustDatasetID = id.MustDatasetID
var MustDatasetFieldID = id.MustDatasetSchemaFieldID
var MustDatasetSchemaID = id.MustDatasetSchemaID
var MustSceneID = id.MustSceneID

var IDFrom = id.PropertyIDFrom
var ItemIDFrom = id.PropertyItemIDFrom
var FieldIDFrom = id.PropertySchemaFieldIDFrom
var SchemaIDFrom = id.PropertySchemaIDFrom
var SchemaGroupIDFrom = id.PropertySchemaGroupIDFrom
var DatasetIDFrom = id.DatasetIDFrom
var DatasetFieldIDFrom = id.DatasetSchemaFieldIDFrom
var DatasetSchemaIDFrom = id.DatasetSchemaIDFrom
var SceneIDFrom = id.SceneIDFrom

var IDFromRef = id.PropertyIDFromRef
var ItemIDFromRef = id.PropertyItemIDFromRef
var SchemaIDFromRef = id.PropertySchemaIDFromRef
var DatasetIDFromRef = id.DatasetIDFromRef
var DatasetFieldIDFromRef = id.DatasetSchemaFieldIDFromRef
var DatasetSchemaIDFromRef = id.DatasetSchemaIDFromRef
var SceneIDFromRef = id.SceneIDFromRef

var IDFromRefID = id.PropertyIDFromRefID
var ItemIDFromRefID = id.PropertyItemIDFromRefID
var DatasetIDFromRefID = id.DatasetIDFromRefID
var DatasetFieldIDFromRefID = id.DatasetSchemaFieldIDFromRefID
var DatasetSchemaIDFromRefID = id.DatasetSchemaIDFromRefID
var SceneIDFromRefID = id.SceneIDFromRefID

type IDSet = id.PropertyIDSet
type ItemIDSet = id.PropertyItemIDSet

var NewIDSet = id.NewPropertyIDSet
var NewItemIDSet = id.NewPropertyItemIDSet

var ErrInvalidID = id.ErrInvalidID

func sortIDs(a []ID) {
	sort.SliceStable(a, func(i, j int) bool {
		return id.ID(a[i]).Compare(id.ID(a[j])) < 0
	})
}
