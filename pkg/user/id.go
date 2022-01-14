package user

import "github.com/reearth/reearth-backend/pkg/id"

type ID = id.UserID
type TeamID = id.TeamID

var NewID = id.NewUserID
var NewTeamID = id.NewTeamID

var MustID = id.MustUserID
var MustTeamID = id.MustTeamID

var IDFrom = id.UserIDFrom
var TeamIDFrom = id.TeamIDFrom

var IDFromRef = id.UserIDFromRef
var TeamIDFromRef = id.TeamIDFromRef

var IDFromRefID = id.UserIDFromRefID
var TeamIDFromRefID = id.TeamIDFromRefID

var ErrInvalidID = id.ErrInvalidID
