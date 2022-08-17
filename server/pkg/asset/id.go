package asset

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.AssetID
type WorkspaceID = id.WorkspaceID

var NewID = id.NewAssetID
var NewWorkspaceID = id.NewWorkspaceID

var MustID = id.MustAssetID
var MustWorkspaceID = id.MustWorkspaceID

var IDFrom = id.AssetIDFrom
var WorkspaceIDFrom = id.WorkspaceIDFrom

var IDFromRef = id.AssetIDFromRef
var WorkspaceIDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID
