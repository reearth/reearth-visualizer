package gqlmodel

import (
	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth/server/pkg/workspace"
)

type Workspace struct {
	ID    graphql.ID     `json:"id" graphql:"id"`
	Name  graphql.String `json:"name" graphql:"name"`
	Alias graphql.String `json:"alias" graphql:"alias"`
	// TODO:"members" to be fetched as well
	Metadata WorkspaceMetadata `json:"metadata" graphql:"metadata"`
	Personal bool              `json:"personal" graphql:"personal"`
}

func ToWorkspace(w Workspace) *workspace.Workspace {
	return workspace.New().
		ID(string(w.ID)).
		Name(string(w.Name)).
		Alias(string(w.Alias)).
		Metadata(ToWorkspaceMetadata(w.Metadata)).
		MustBuild()
}

func ToWorkspaces(gqlWorkspaces []Workspace) workspace.WorkspaceList {
	workspaces := make(workspace.WorkspaceList, 0, len(gqlWorkspaces))
	for _, w := range gqlWorkspaces {
		if ws := ToWorkspace(w); ws != nil {
			workspaces = append(workspaces, *ws)
		}
	}
	return workspaces
}

func ToWorkspaceMetadata(m WorkspaceMetadata) workspace.Metadata {
	return workspace.NewMetadata().
		Description(string(m.Description)).
		Website(string(m.Website)).
		Location(string(m.Location)).
		BillingEmail(string(m.BillingEmail)).
		PhotoURL(string(m.PhotoURL)).
		MustBuild()
}
