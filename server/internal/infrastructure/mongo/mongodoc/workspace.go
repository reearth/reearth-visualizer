package mongodoc

import (
	"github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/workspace"
	"golang.org/x/exp/slices"
)

type WorkspaceConsumer = Consumer[*WorkspaceDocument, *workspace.Workspace]

func NewWorkspaceConsumer(workspaces []id.WorkspaceID) *WorkspaceConsumer {
	return NewConsumer[*WorkspaceDocument, *workspace.Workspace](func(ws *workspace.Workspace) bool {
		return workspaces == nil || slices.Contains(workspaces, ws.ID())
	})
}

type WorkspaceDocument struct {
	ID       string
	Name     string
	Alias    string
	Members  map[string]MemberDocument
	Personal bool
	Policy   *string
	Metadata *WorkspaceMetadataDocument
}

type MemberDocument struct {
	Role      string
	InvitedBy string
	Host      string
	Disabled  bool
}

type WorkspaceMetadataDocument struct {
	Description  string
	Website      string
	Location     string
	BillingEmail string
	PhotoURL     string
}

func NewWorkspace(ws *workspace.Workspace) (*WorkspaceDocument, string) {
	if ws == nil {
		return nil, ""
	}

	wid := ws.ID().String()
	doc := &WorkspaceDocument{
		ID:       wid,
		Name:     ws.Name(),
		Alias:    ws.Alias(),
		Personal: ws.IsPersonal(),
		Members:  make(map[string]MemberDocument),
	}

	// Convert members
	members := ws.Members().Users()
	for uid, member := range members {
		memberDoc := MemberDocument{
			Role:      string(member.Role),
			InvitedBy: member.InvitedBy.String(),
			Host:      member.Host,
			Disabled:  member.Disabled,
		}
		doc.Members[uid.String()] = memberDoc
	}

	// Convert policy
	if policy := ws.Policy(); policy != nil {
		policyStr := string(*policy)
		doc.Policy = &policyStr
	}

	// Convert metadata
	if md := ws.Metadata(); md != nil {
		doc.Metadata = &WorkspaceMetadataDocument{
			Description:  md.Description(),
			Website:      md.Website(),
			Location:     md.Location(),
			BillingEmail: md.BillingEmail(),
			PhotoURL:     md.PhotoURL(),
		}
	}

	return doc, wid
}

func (d *WorkspaceDocument) Model() (*workspace.Workspace, error) {
	if d == nil {
		return nil, nil
	}

	wid, err := id.WorkspaceIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	builder := workspace.New().
		ID(wid).
		Name(d.Name).
		Alias(d.Alias).
		Personal(d.Personal)

	// Convert members
	if len(d.Members) > 0 {
		members := make(map[id.UserID]workspace.Member)
		for uidStr, memberDoc := range d.Members {
			uid, err := id.UserIDFrom(uidStr)
			if err != nil {
				continue
			}
			invitedByID, err := id.UserIDFrom(memberDoc.InvitedBy)
			if err != nil {
				continue
			}
			member := workspace.Member{
				Role:      workspace.Role(memberDoc.Role),
				InvitedBy: invitedByID,
				Host:      memberDoc.Host,
				Disabled:  memberDoc.Disabled,
			}
			members[uid] = member
		}
		builder = builder.Members(members)
	}

	// Convert policy
	if d.Policy != nil {
		policy := workspace.PolicyID(*d.Policy)
		builder = builder.Policy(&policy)
	}

	// Convert metadata
	if d.Metadata != nil {
		md := workspace.MetadataFrom(
			d.Metadata.Description,
			d.Metadata.Website,
			d.Metadata.Location,
			d.Metadata.BillingEmail,
			d.Metadata.PhotoURL,
		)
		builder = builder.Metadata(md)
	}

	return builder.Build()
}
