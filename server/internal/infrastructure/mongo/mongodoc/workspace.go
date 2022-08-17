package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/workspace"
	"go.mongodb.org/mongo-driver/bson"
)

type WorkspaceMemberDocument struct {
	Role string
}

type WorkspaceDocument struct {
	ID       string
	Name     string
	Members  map[string]WorkspaceMemberDocument
	Personal bool
}

type WorkspaceConsumer struct {
	Rows workspace.List
}

func (c *WorkspaceConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc WorkspaceDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	project, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, project)
	return nil
}

func NewWorkspace(ws *workspace.Workspace) (*WorkspaceDocument, string) {
	membersDoc := map[string]WorkspaceMemberDocument{}
	for user, r := range ws.Members().Members() {
		membersDoc[user.String()] = WorkspaceMemberDocument{
			Role: string(r),
		}
	}
	id := ws.ID().String()
	return &WorkspaceDocument{
		ID:       id,
		Name:     ws.Name(),
		Members:  membersDoc,
		Personal: ws.IsPersonal(),
	}, id
}

func (d *WorkspaceDocument) Model() (*workspace.Workspace, error) {
	tid, err := id.WorkspaceIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	members := map[id.UserID]workspace.Role{}
	if d.Members != nil {
		for uid, member := range d.Members {
			uid, err := id.UserIDFrom(uid)
			if err != nil {
				return nil, err
			}
			members[uid] = workspace.Role(member.Role)
		}
	}
	return workspace.New().
		ID(tid).
		Name(d.Name).
		Members(members).
		Personal(d.Personal).
		Build()
}

func NewWorkspaces(workspaces []*workspace.Workspace) ([]*WorkspaceDocument, []string) {
	res := make([]*WorkspaceDocument, 0, len(workspaces))
	ids := make([]string, 0, len(workspaces))
	for _, d := range workspaces {
		if d == nil {
			continue
		}
		r, id := NewWorkspace(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}
