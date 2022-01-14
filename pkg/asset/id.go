package asset

import (
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
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

var IDFromRefID = id.AssetIDFromRefID
var TeamIDFromRefID = id.TeamIDFromRefID

var ErrInvalidID = id.ErrInvalidID

func createdAt(i ID) time.Time {
	return id.ID(i).Timestamp()
}
