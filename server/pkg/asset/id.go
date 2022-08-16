package asset

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.AssetID
type TeamID = id.TeamID

var NewID = id.NewAssetID
var NewTeamID = id.NewTeamID

var MustID = id.MustAssetID
var MustTeamID = id.MustTeamID

var IDFrom = id.AssetIDFrom
var TeamIDFrom = id.TeamIDFrom

var IDFromRef = id.AssetIDFromRef
var TeamIDFromRef = id.TeamIDFromRef

var ErrInvalidID = id.ErrInvalidID
