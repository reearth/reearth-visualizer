package asset

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.AssetID
type TeamID = id.WorkspaceID

var NewID = id.NewAssetID
var NewTeamID = id.NewWorkspaceID

var MustID = id.MustAssetID
var MustTeamID = id.MustWorkspaceID

var IDFrom = id.AssetIDFrom
var TeamIDFrom = id.WorkspaceIDFrom

var IDFromRef = id.AssetIDFromRef
var TeamIDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID
