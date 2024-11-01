package project

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.ProjectID
type WorkspaceID = accountdomain.WorkspaceID
type SceneID = id.SceneID

var NewID = id.NewProjectID
var NewWorkspaceID = accountdomain.NewWorkspaceID

var MustID = id.MustProjectID
var MustWorkspaceID = id.MustWorkspaceID

var IDFrom = id.ProjectIDFrom
var WorkspaceIDFrom = accountdomain.WorkspaceIDFrom

var IDFromRef = id.ProjectIDFromRef
var WorkspaceIDFromRef = accountdomain.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID

func MockNewID(pid ID) func() {
	NewID = func() ID { return pid }
	return func() {
		NewID = id.NewProjectID
	}
}
