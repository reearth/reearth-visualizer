package asset

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.AssetID
type WorkspaceID = accountdomain.WorkspaceID
type ProjectID = id.ProjectID

var NewID = id.NewAssetID
var NewWorkspaceID = accountdomain.NewWorkspaceID
var NewProjectID = id.NewProjectID

var MustID = id.MustAssetID
var MustWorkspaceID = id.MustWorkspaceID
var MustProjectID = id.MustProjectID

var IDFrom = id.AssetIDFrom
var WorkspaceIDFrom = accountdomain.WorkspaceIDFrom
var ProjectIDFrom = id.ProjectIDFrom

var IDFromRef = id.AssetIDFromRef
var WorkspaceIDFromRef = accountdomain.WorkspaceIDFromRef
var ProjectIDFromRef = id.ProjectIDFromRef

var ErrInvalidID = id.ErrInvalidID

func MockNewID(i ID) func() {
	NewID = func() ID { return i }
	return func() { NewID = id.NewAssetID }
}
