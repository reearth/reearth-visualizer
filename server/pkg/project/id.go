package project

import (
	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.ProjectID
type TeamID = id.WorkspaceID

var NewID = id.NewProjectID
var NewTeamID = id.NewWorkspaceID

var MustID = id.MustProjectID
var MustTeamID = id.MustWorkspaceID

var IDFrom = id.ProjectIDFrom
var TeamIDFrom = id.WorkspaceIDFrom

var IDFromRef = id.ProjectIDFromRef
var TeamIDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID
