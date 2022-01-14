package project

import (
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
)

type ID = id.ProjectID
type TeamID = id.TeamID

var NewID = id.NewProjectID
var NewTeamID = id.NewTeamID

var MustID = id.MustProjectID
var MustTeamID = id.MustTeamID

var IDFrom = id.ProjectIDFrom
var TeamIDFrom = id.TeamIDFrom

var IDFromRef = id.ProjectIDFromRef
var TeamIDFromRef = id.TeamIDFromRef

var IDFromRefID = id.ProjectIDFromRefID
var TeamIDFromRefID = id.TeamIDFromRefID

var ErrInvalidID = id.ErrInvalidID

func createdAt(i ID) time.Time {
	return id.ID(i).Timestamp()
}
