package workspace

import "github.com/reearth/reearth/server/pkg/id"

type ID = id.WorkspaceID
type UserID = id.UserID

var NewID = id.NewWorkspaceID
var NewUserID = id.NewUserID

var MustID = id.MustWorkspaceID

var IDFrom = id.WorkspaceIDFrom

var IDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID

type IDList = id.WorkspaceIDList

type PolicyID string

func (id PolicyID) Ref() *PolicyID {
	return &id
}

func (id PolicyID) String() string {
	return string(id)
}
