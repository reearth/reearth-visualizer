package tag

import "github.com/reearth/reearth/server/pkg/id"

type ID = id.TagID
type SceneID = id.SceneID
type DatasetID = id.DatasetID
type DatasetSchemaID = id.DatasetSchemaID
type DatasetFieldID = id.DatasetFieldID

type IDList = id.TagIDList

var NewID = id.NewTagID
var NewSceneID = id.NewSceneID
var NewDatasetID = id.NewDatasetID
var NewDatasetSchemaID = id.NewDatasetSchemaID
var NewDatasetFieldID = id.NewDatasetFieldID

var MustID = id.MustTagID
var MustSceneID = id.MustSceneID
var MustDatasetID = id.MustDatasetID
var MustDatasetSchemaID = id.MustDatasetSchemaID
var MustDatasetFieldID = id.MustDatasetFieldID

var IDFrom = id.TagIDFrom
var SceneIDFrom = id.SceneIDFrom
var DatasetIDFrom = id.DatasetIDFrom
var DatasetSchemaIDFrom = id.DatasetSchemaIDFrom
var DatasetFieldIDFrom = id.DatasetFieldIDFrom

var IDFromRef = id.TagIDFromRef
var SceneIDFromRef = id.SceneIDFromRef
var DatasetIDFromRef = id.DatasetIDFromRef
var DatasetSchemaIDFromRef = id.DatasetSchemaIDFromRef
var DatasetFieldIDFromRef = id.DatasetFieldIDFromRef

var ErrInvalidID = id.ErrInvalidID
