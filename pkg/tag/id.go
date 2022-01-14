package tag

import "github.com/reearth/reearth-backend/pkg/id"

type ID = id.TagID
type SceneID = id.SceneID
type DatasetID = id.DatasetID
type DatasetSchemaID = id.DatasetSchemaID
type DatasetFieldID = id.DatasetSchemaFieldID

var NewID = id.NewTagID
var NewSceneID = id.NewSceneID
var NewDatasetID = id.NewDatasetID
var NewDatasetSchemaID = id.NewDatasetSchemaID
var NewDatasetFieldID = id.NewDatasetSchemaFieldID

var MustID = id.MustTagID
var MustSceneID = id.MustSceneID
var MustDatasetID = id.MustDatasetID
var MustDatasetSchemaID = id.MustDatasetSchemaID
var MustDatasetFieldID = id.MustDatasetSchemaFieldID

var IDFrom = id.TagIDFrom
var SceneIDFrom = id.SceneIDFrom
var DatasetIDFrom = id.DatasetIDFrom
var DatasetSchemaIDFrom = id.DatasetSchemaIDFrom
var DatasetFieldIDFrom = id.DatasetSchemaFieldIDFrom

var IDFromRef = id.TagIDFromRef
var SceneIDFromRef = id.SceneIDFromRef
var DatasetIDFromRef = id.DatasetIDFromRef
var DatasetSchemaIDFromRef = id.DatasetSchemaIDFromRef
var DatasetFieldIDFromRef = id.DatasetSchemaFieldIDFromRef

var IDFromRefID = id.TagIDFromRefID
var SceneIDFromRefID = id.SceneIDFromRefID
var DatasetIDFromRefID = id.DatasetIDFromRefID
var DatasetSchemaIDFromRefID = id.DatasetSchemaIDFromRefID
var DatasetFieldIDFromRefID = id.DatasetSchemaFieldIDFromRefID

var ErrInvalidID = id.ErrInvalidID
