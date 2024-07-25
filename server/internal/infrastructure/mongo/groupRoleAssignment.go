package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/groupRoleAssignment"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
)

var (
	newGroupRoleAssignmentIndexes       = []string{}
	newGroupRoleAssignmentUniqueIndexes = []string{"id", "userid"}
)

type GroupRoleAssignment struct {
	client *mongox.ClientCollection
}

func NewGroupRoleAssignment(client *mongox.Client) *GroupRoleAssignment {
	return &GroupRoleAssignment{
		client: client.WithCollection("groupRoleAssignment"),
	}
}

func (r *GroupRoleAssignment) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, newGroupRoleAssignmentIndexes, newGroupRoleAssignmentUniqueIndexes)
}

func (r *GroupRoleAssignment) FindAll(ctx context.Context) (groupRoleAssignment.List, error) {
	return r.findAll(ctx)
}

func (r *GroupRoleAssignment) Save(ctx context.Context, groupRoleAssignment groupRoleAssignment.GroupRoleAssignment) error {
	doc, gId := mongodoc.NewGroupRoleAssignment(groupRoleAssignment)
	return r.client.SaveOne(ctx, gId, doc)
}

func (r *GroupRoleAssignment) findAll(ctx context.Context) (groupRoleAssignment.List, error) {
	c := mongodoc.NewGroupRoleAssignmentConsumer()
	if err := r.client.Find(ctx, nil, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return (groupRoleAssignment.List)(c.Result), nil
}
