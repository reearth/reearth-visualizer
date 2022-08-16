package user

import "github.com/reearth/reearth/server/pkg/id"

type ID = id.UserID
type TeamID = id.WorkspaceID

var NewID = id.NewUserID
var NewTeamID = id.NewWorkspaceID

var MustID = id.MustUserID
var MustTeamID = id.MustWorkspaceID

var IDFrom = id.UserIDFrom
var TeamIDFrom = id.WorkspaceIDFrom

var IDFromRef = id.UserIDFromRef
var TeamIDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID

type TeamIDList = id.WorkspaceIDList
