package gql

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/accounts"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	accountsGqlWorkspace "github.com/reearth/reearth-accounts/server/pkg/gqlclient/workspace"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {

	// Call reearth-accounts API
	alias := ""
	if input.Alias != nil {
		alias = *input.Alias
	}

	createInput := accountsGqlWorkspace.CreateWorkspaceInput{
		Alias:       alias,
		Name:        input.Name,
		Description: nil, // gqlmodel doesn't have description field
	}

	workspace, err := r.AccountsAPIClient.WorkspaceRepo.CreateWorkspace(ctx, createInput)
	if err != nil {
		return nil, err
	}
	if err := r.syncWorkspaceToLocalRepo(ctx, workspace); err != nil {
		return nil, err
	}

	return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {

	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if err := r.AccountsAPIClient.WorkspaceRepo.DeleteWorkspace(ctx, tid.String()); err != nil {
		return nil, err
	}
	if err := r.removeWorkspaceFromLocalRepo(ctx, tid); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {

	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	var workspace *accountsWorkspace.Workspace
	if input.Alias != nil {
		workspace, err = r.updateWorkspaceWithAlias(ctx, tid.String(), input.Name, input.Alias)
	} else {
		// Call reearth-accounts API
		updateInput := accountsGqlWorkspace.UpdateWorkspaceInput{
			WorkspaceID: tid.String(),
			Name:        input.Name,
		}

		workspace, err = r.AccountsAPIClient.WorkspaceRepo.UpdateWorkspace(ctx, updateInput)
	}
	if err != nil {
		return nil, err
	}
	if err := r.syncWorkspaceToLocalRepo(ctx, workspace); err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	workspace, err := r.addUsersToWorkspaceViaHTTP(ctx, tid.String(), uid.String(), string(input.Role))
	if err != nil {
		return nil, err
	}

	role, err := accountsWorkspace.RoleFrom(string(input.Role))
	if err != nil {
		return nil, err
	}

	localWorkspace, err := r.addMemberToLocalWorkspace(ctx, tid, uid, role)
	if err != nil {
		return nil, err
	}
	if localWorkspace != nil {
		return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(localWorkspace)}, nil
	}

	return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	workspace, err := r.removeUserFromWorkspaceViaHTTP(ctx, tid.String(), uid.String())
	if err != nil {
		return nil, err
	}
	localWorkspace, err := r.removeMemberFromLocalWorkspace(ctx, tid, uid)
	if err != nil {
		return nil, err
	}
	if localWorkspace != nil {
		return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(localWorkspace)}, nil
	}

	return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	// Call reearth-accounts API
	workspace, err := r.updateUserOfWorkspaceViaHTTP(ctx, tid.String(), uid.String(), string(input.Role))
	if err != nil {
		return nil, err
	}
	role, err := accountsWorkspace.RoleFrom(string(input.Role))
	if err != nil {
		return nil, err
	}

	localWorkspace, err := r.updateMemberInLocalWorkspace(ctx, tid, uid, role)
	if err != nil {
		return nil, err
	}
	if localWorkspace != nil {
		return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(localWorkspace)}, nil
	}

	return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

type updateWorkspaceResponse struct {
	Data struct {
		UpdateWorkspace struct {
			Workspace struct {
				ID       string `json:"id"`
				Name     string `json:"name"`
				Alias    string `json:"alias"`
				Personal bool   `json:"personal"`
			} `json:"workspace"`
		} `json:"updateWorkspace"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

func (r *mutationResolver) updateWorkspaceWithAlias(ctx context.Context, workspaceID, name string, alias *string) (*accountsWorkspace.Workspace, error) {
	if r.AccountsAPIHost == "" {
		return nil, errors.New("accounts api host is not configured")
	}

	endpoint := strings.TrimRight(r.AccountsAPIHost, "/") + "/api/graphql"
	query := `mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
  updateWorkspace(input: $input) {
    workspace {
      id
      name
      alias
      personal
    }
  }
}`

	inputMap := map[string]interface{}{
		"workspaceId": workspaceID,
		"name":        name,
	}
	if alias != nil {
		inputMap["alias"] = *alias
	}

	payload := map[string]interface{}{
		"query": query,
		"variables": map[string]interface{}{
			"input": inputMap,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal updateWorkspace payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build updateWorkspace request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	httpClient := &http.Client{
		Transport: accounts.NewDynamicAuthTransport(),
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call accounts GraphQL: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read accounts response: %w", err)
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("accounts GraphQL status %s: %s", resp.Status, strings.TrimSpace(string(respBody)))
	}

	var gqlResp updateWorkspaceResponse
	if err := json.Unmarshal(respBody, &gqlResp); err != nil {
		return nil, fmt.Errorf("failed to parse accounts response: %w", err)
	}
	if len(gqlResp.Errors) > 0 {
		return nil, fmt.Errorf("message: %s", gqlResp.Errors[0].Message)
	}

	w := gqlResp.Data.UpdateWorkspace.Workspace
	wid, err := accountsWorkspace.IDFrom(w.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to parse workspace id: %w", err)
	}

	workspace := accountsWorkspace.New().
		ID(wid).
		Name(w.Name).
		Alias(w.Alias).
		Personal(w.Personal).
		MustBuild()

	return workspace, nil
}

type addUsersToWorkspaceResponse struct {
	Data struct {
		AddUsersToWorkspace struct {
			Workspace struct {
				ID       string `json:"id"`
				Name     string `json:"name"`
				Alias    string `json:"alias"`
				Personal bool   `json:"personal"`
			} `json:"workspace"`
		} `json:"addUsersToWorkspace"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

func normalizeAccountsMessage(message string) string {
	message = strings.TrimSpace(message)
	if strings.HasPrefix(message, "input: ") {
		message = strings.TrimPrefix(message, "input: ")
		if idx := strings.Index(message, " "); idx != -1 {
			message = message[idx+1:]
		}
	}
	return message
}

func (r *mutationResolver) addUsersToWorkspaceViaHTTP(ctx context.Context, workspaceID, userID, role string) (*accountsWorkspace.Workspace, error) {
	if r.AccountsAPIHost == "" {
		return nil, fmt.Errorf("accounts host is missing")
	}

	query := `mutation AddUsersToWorkspace($input: AddUsersToWorkspaceInput!) {
  addUsersToWorkspace(input: $input) {
    workspace {
      id
      name
      alias
      personal
    }
  }
}`

	payload := map[string]interface{}{
		"query": query,
		"variables": map[string]interface{}{
			"input": map[string]interface{}{
				"workspaceId": workspaceID,
				"users": []map[string]interface{}{
					{
						"userId": userID,
						"role":   role,
					},
				},
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal GraphQL payload: %w", err)
	}

	endpoint := strings.TrimRight(r.AccountsAPIHost, "/") + "/api/graphql"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build GraphQL request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Service", "visualizer-api")
	if uid := adapter.UserID(ctx); uid != nil {
		req.Header.Set("X-Reearth-Debug-User", *uid)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call accounts GraphQL: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read accounts GraphQL response: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("accounts GraphQL status %s: %s", resp.Status, strings.TrimSpace(string(respBody)))
	}

	var gqlResp addUsersToWorkspaceResponse
	if err := json.Unmarshal(respBody, &gqlResp); err != nil {
		return nil, fmt.Errorf("failed to parse accounts GraphQL response: %w", err)
	}
	if len(gqlResp.Errors) > 0 {
		messages := make([]string, 0, len(gqlResp.Errors))
		for _, ge := range gqlResp.Errors {
			if ge.Message != "" {
				messages = append(messages, normalizeAccountsMessage(ge.Message))
			}
		}
		if len(messages) > 0 {
			return nil, fmt.Errorf("%s", strings.Join(messages, "; "))
		}
		return nil, fmt.Errorf("accounts GraphQL errors returned")
	}

	w := gqlResp.Data.AddUsersToWorkspace.Workspace
	wid, err := accountsWorkspace.IDFrom(w.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to parse workspace id: %w", err)
	}

	workspace := accountsWorkspace.New().
		ID(wid).
		Name(w.Name).
		Alias(w.Alias).
		Personal(w.Personal).
		Members(make(map[accountsWorkspace.UserID]accountsWorkspace.Member)).
		MustBuild()

	return workspace, nil
}

type removeUserFromWorkspaceResponse struct {
	Data struct {
		RemoveUserFromWorkspace struct {
			Workspace struct {
				ID       string `json:"id"`
				Name     string `json:"name"`
				Alias    string `json:"alias"`
				Personal bool   `json:"personal"`
			} `json:"workspace"`
		} `json:"removeUserFromWorkspace"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

func (r *mutationResolver) removeUserFromWorkspaceViaHTTP(ctx context.Context, workspaceID, userID string) (*accountsWorkspace.Workspace, error) {
	if r.AccountsAPIHost == "" {
		return nil, fmt.Errorf("accounts host is missing")
	}

	query := `mutation RemoveUserFromWorkspace($input: RemoveUserFromWorkspaceInput!) {
  removeUserFromWorkspace(input: $input) {
    workspace {
      id
      name
      alias
      personal
    }
  }
}`

	payload := map[string]interface{}{
		"query": query,
		"variables": map[string]interface{}{
			"input": map[string]interface{}{
				"workspaceId": workspaceID,
				"userId":      userID,
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal GraphQL payload: %w", err)
	}

	endpoint := strings.TrimRight(r.AccountsAPIHost, "/") + "/api/graphql"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build GraphQL request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Service", "visualizer-api")
	if uid := adapter.UserID(ctx); uid != nil {
		req.Header.Set("X-Reearth-Debug-User", *uid)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call accounts GraphQL: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read accounts GraphQL response: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("accounts GraphQL status %s: %s", resp.Status, strings.TrimSpace(string(respBody)))
	}

	var gqlResp removeUserFromWorkspaceResponse
	if err := json.Unmarshal(respBody, &gqlResp); err != nil {
		return nil, fmt.Errorf("failed to parse accounts GraphQL response: %w", err)
	}
	if len(gqlResp.Errors) > 0 {
		messages := make([]string, 0, len(gqlResp.Errors))
		for _, ge := range gqlResp.Errors {
			if ge.Message != "" {
				messages = append(messages, normalizeAccountsMessage(ge.Message))
			}
		}
		if len(messages) > 0 {
			return nil, fmt.Errorf("%s", strings.Join(messages, "; "))
		}
		return nil, fmt.Errorf("accounts GraphQL errors returned")
	}

	w := gqlResp.Data.RemoveUserFromWorkspace.Workspace
	wid, err := accountsWorkspace.IDFrom(w.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to parse workspace id: %w", err)
	}

	workspace := accountsWorkspace.New().
		ID(wid).
		Name(w.Name).
		Alias(w.Alias).
		Personal(w.Personal).
		Members(make(map[accountsWorkspace.UserID]accountsWorkspace.Member)).
		MustBuild()

	return workspace, nil
}

type updateUserOfWorkspaceResponse struct {
	Data struct {
		UpdateUserOfWorkspace struct {
			Workspace struct {
				ID       string `json:"id"`
				Name     string `json:"name"`
				Alias    string `json:"alias"`
				Personal bool   `json:"personal"`
			} `json:"workspace"`
		} `json:"updateUserOfWorkspace"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

func (r *mutationResolver) updateUserOfWorkspaceViaHTTP(ctx context.Context, workspaceID, userID, role string) (*accountsWorkspace.Workspace, error) {
	if r.AccountsAPIHost == "" {
		return nil, fmt.Errorf("accounts host is missing")
	}

	query := `mutation UpdateUserOfWorkspace($input: UpdateUserOfWorkspaceInput!) {
  updateUserOfWorkspace(input: $input) {
    workspace {
      id
      name
      alias
      personal
    }
  }
}`

	payload := map[string]interface{}{
		"query": query,
		"variables": map[string]interface{}{
			"input": map[string]interface{}{
				"workspaceId": workspaceID,
				"userId":      userID,
				"role":        role,
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal GraphQL payload: %w", err)
	}

	endpoint := strings.TrimRight(r.AccountsAPIHost, "/") + "/api/graphql"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build GraphQL request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Service", "visualizer-api")
	if uid := adapter.UserID(ctx); uid != nil {
		req.Header.Set("X-Reearth-Debug-User", *uid)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call accounts GraphQL: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read accounts GraphQL response: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("accounts GraphQL status %s: %s", resp.Status, strings.TrimSpace(string(respBody)))
	}

	var gqlResp updateUserOfWorkspaceResponse
	if err := json.Unmarshal(respBody, &gqlResp); err != nil {
		return nil, fmt.Errorf("failed to parse accounts GraphQL response: %w", err)
	}
	if len(gqlResp.Errors) > 0 {
		messages := make([]string, 0, len(gqlResp.Errors))
		for _, ge := range gqlResp.Errors {
			if ge.Message != "" {
				messages = append(messages, normalizeAccountsMessage(ge.Message))
			}
		}
		if len(messages) > 0 {
			return nil, fmt.Errorf("%s", strings.Join(messages, "; "))
		}
		return nil, fmt.Errorf("accounts GraphQL errors returned")
	}

	w := gqlResp.Data.UpdateUserOfWorkspace.Workspace
	wid, err := accountsWorkspace.IDFrom(w.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to parse workspace id: %w", err)
	}

	workspace := accountsWorkspace.New().
		ID(wid).
		Name(w.Name).
		Alias(w.Alias).
		Personal(w.Personal).
		Members(make(map[accountsWorkspace.UserID]accountsWorkspace.Member)).
		MustBuild()

	return workspace, nil
}

func (r *mutationResolver) addMemberToLocalWorkspace(ctx context.Context, wid accountsID.WorkspaceID, uid accountsID.UserID, role accountsWorkspace.Role) (*accountsWorkspace.Workspace, error) {
	if r.AccountRepos == nil || r.AccountRepos.Workspace == nil || r.AccountRepos.User == nil {
		return nil, nil
	}

	ws, err := r.AccountRepos.Workspace.FindByID(ctx, wid)
	if err != nil {
		return nil, err
	}
	u, err := r.AccountRepos.User.FindByID(ctx, uid)
	if err != nil {
		return nil, err
	}

	inviter := uid
	if actorID := adapter.UserID(ctx); actorID != nil {
		if parsed, err := accountsID.UserIDFrom(*actorID); err == nil {
			inviter = parsed
		}
	}

	if err := ws.Members().Join(u, role, inviter); err != nil {
		return nil, err
	}
	if err := r.AccountRepos.Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return ws, nil
}

func (r *mutationResolver) removeMemberFromLocalWorkspace(ctx context.Context, wid accountsID.WorkspaceID, uid accountsID.UserID) (*accountsWorkspace.Workspace, error) {
	if r.AccountRepos == nil || r.AccountRepos.Workspace == nil {
		return nil, nil
	}

	ws, err := r.AccountRepos.Workspace.FindByID(ctx, wid)
	if err != nil {
		return nil, err
	}

	if err := ws.Members().Leave(uid); err != nil {
		return nil, err
	}
	if err := r.AccountRepos.Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return ws, nil
}

func (r *mutationResolver) updateMemberInLocalWorkspace(ctx context.Context, wid accountsID.WorkspaceID, uid accountsID.UserID, role accountsWorkspace.Role) (*accountsWorkspace.Workspace, error) {
	if r.AccountRepos == nil || r.AccountRepos.Workspace == nil {
		return nil, nil
	}

	ws, err := r.AccountRepos.Workspace.FindByID(ctx, wid)
	if err != nil {
		return nil, err
	}

	if err := ws.Members().UpdateUserRole(uid, role); err != nil {
		return nil, err
	}
	if err := r.AccountRepos.Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return ws, nil
}

func (r *mutationResolver) syncWorkspaceToLocalRepo(ctx context.Context, workspace *accountsWorkspace.Workspace) error {
	if workspace == nil || r.AccountRepos == nil || r.AccountRepos.Workspace == nil {
		return nil
	}
	return r.AccountRepos.Workspace.Save(ctx, workspace)
}

func (r *mutationResolver) removeWorkspaceFromLocalRepo(ctx context.Context, workspaceID accountsID.WorkspaceID) error {
	if r.AccountRepos == nil || r.AccountRepos.Workspace == nil {
		return nil
	}
	return r.AccountRepos.Workspace.Remove(ctx, workspaceID)
}
