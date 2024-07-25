package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/groupRoleAssignment"
)

type GroupRoleAssignment interface {
	FindAll(context.Context) (groupRoleAssignment.List, error)
	Save(context.Context, groupRoleAssignment.GroupRoleAssignment) error
}
