package dataset

import "github.com/reearth/reearth-backend/pkg/id"

type ID = id.DatasetID
type FieldID = id.DatasetSchemaFieldID
type SchemaID = id.DatasetSchemaID
type SceneID = id.SceneID

var NewID = id.NewDatasetID
var NewSchemaID = id.NewDatasetSchemaID
var NewFieldID = id.NewDatasetSchemaFieldID
var NewSceneID = id.NewSceneID

var MustID = id.MustDatasetID
var MustSchemaID = id.MustDatasetSchemaID
var MustFieldID = id.MustDatasetSchemaFieldID
var MustSceneID = id.MustSceneID

var IDFrom = id.DatasetIDFrom
var SchemaIDFrom = id.DatasetSchemaIDFrom
var FieldIDFrom = id.DatasetSchemaFieldIDFrom
var SceneIDFrom = id.SceneIDFrom

var IDFromRef = id.DatasetIDFromRef
var SchemaIDFromRef = id.DatasetSchemaIDFromRef
var FieldIDFromRef = id.DatasetSchemaFieldIDFromRef
var SceneIDFromRef = id.SceneIDFromRef

var IDFromRefID = id.DatasetIDFromRefID
var SchemaIDFromRefID = id.DatasetSchemaIDFromRefID
var FieldIDFromRefID = id.DatasetSchemaFieldIDFromRefID
var SceneIDFromRefID = id.SceneIDFromRefID

type IDSet = id.DatasetIDSet
type SchemaIDSet = id.DatasetSchemaIDSet
type FieldIDSet = id.DatasetSchemaFieldIDSet
type SceneIDSet = id.SceneIDSet

var NewIDSet = id.NewDatasetIDSet
var NewSchemaIDset = id.NewDatasetSchemaIDSet
var NewFieldIDset = id.NewDatasetSchemaFieldIDSet
var NewSceneIDset = id.NewSceneIDSet

var ErrInvalidID = id.ErrInvalidID
