package dataset

import "github.com/reearth/reearth/server/pkg/id"

type ID = id.DatasetID
type FieldID = id.DatasetFieldID
type SchemaID = id.DatasetSchemaID
type SceneID = id.SceneID

var NewID = id.NewDatasetID
var NewSchemaID = id.NewDatasetSchemaID
var NewFieldID = id.NewDatasetFieldID
var NewSceneID = id.NewSceneID

var MustID = id.MustDatasetID
var MustSchemaID = id.MustDatasetSchemaID
var MustFieldID = id.MustDatasetFieldID
var MustSceneID = id.MustSceneID

var IDFrom = id.DatasetIDFrom
var SchemaIDFrom = id.DatasetSchemaIDFrom
var FieldIDFrom = id.DatasetFieldIDFrom
var SceneIDFrom = id.SceneIDFrom

var IDFromRef = id.DatasetIDFromRef
var SchemaIDFromRef = id.DatasetSchemaIDFromRef
var FieldIDFromRef = id.DatasetFieldIDFromRef
var SceneIDFromRef = id.SceneIDFromRef

type IDSet = id.DatasetIDSet
type SchemaIDSet = id.DatasetSchemaIDSet
type FieldIDSet = id.DatasetFieldIDSet
type SceneIDSet = id.SceneIDSet

var NewIDSet = id.NewDatasetIDSet
var NewSchemaIDset = id.NewDatasetSchemaIDSet
var NewFieldIDset = id.NewDatasetFieldIDSet
var NewSceneIDset = id.NewSceneIDSet

var ErrInvalidID = id.ErrInvalidID
