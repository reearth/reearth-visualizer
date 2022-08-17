package workspace

import "github.com/reearth/reearth/server/pkg/id"

type ID = id.WorkspaceID
type PolicyID = string
type UserID = id.UserID

var NewID = id.NewWorkspaceID
var NewUserID = id.NewUserID

var MustID = id.MustWorkspaceID

var IDFrom = id.WorkspaceIDFrom

var IDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID

type IDList = id.WorkspaceIDList
