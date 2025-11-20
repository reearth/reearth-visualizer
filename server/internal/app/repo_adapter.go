package app

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/usecasex"
)

// ReverseUserAdapter wraps new accountsRepo.User and implements old accountrepo.User
type ReverseUserAdapter struct {
	inner accountsRepo.User
}

func NewReverseUserAdapter(inner accountsRepo.User) accountrepo.User {
	return &ReverseUserAdapter{
		inner: inner,
	}
}

func (a *ReverseUserAdapter) FindAll(ctx context.Context) (user.List, error) {
	newUsers, err := a.inner.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	oldUsers := make(user.List, 0, len(newUsers))
	for _, newUser := range newUsers {
		oldUsers = append(oldUsers, convertNewUserToOldForAdapter(newUser))
	}
	return oldUsers, nil
}

func (a *ReverseUserAdapter) FindByID(ctx context.Context, uid user.ID) (*user.User, error) {
	newID, _ := accountsID.UserIDFrom(uid.String())
	newUser, err := a.inner.FindByID(ctx, newID)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) FindByIDs(ctx context.Context, ids user.IDList) (user.List, error) {
	newIDs := make(accountsID.UserIDList, 0, len(ids))
	for _, id := range ids {
		newID, _ := accountsID.UserIDFrom(id.String())
		newIDs = append(newIDs, newID)
	}

	newUsers, err := a.inner.FindByIDs(ctx, newIDs)
	if err != nil {
		return nil, err
	}

	oldUsers := make(user.List, 0, len(newUsers))
	for _, newUser := range newUsers {
		oldUsers = append(oldUsers, convertNewUserToOldForAdapter(newUser))
	}
	return oldUsers, nil
}

func (a *ReverseUserAdapter) FindByIDsWithPagination(ctx context.Context, ids user.IDList, pagination *usecasex.Pagination, nameOrAlias ...string) (user.List, *usecasex.PageInfo, error) {
	newIDs := make(accountsID.UserIDList, 0, len(ids))
	for _, id := range ids {
		newID, _ := accountsID.UserIDFrom(id.String())
		newIDs = append(newIDs, newID)
	}

	newUsers, pageInfo, err := a.inner.FindByIDsWithPagination(ctx, newIDs, pagination, nameOrAlias...)
	if err != nil {
		return nil, nil, err
	}

	oldUsers := make(user.List, 0, len(newUsers))
	for _, newUser := range newUsers {
		oldUsers = append(oldUsers, convertNewUserToOldForAdapter(newUser))
	}
	return oldUsers, pageInfo, nil
}

func (a *ReverseUserAdapter) FindBySub(ctx context.Context, sub string) (*user.User, error) {
	newUser, err := a.inner.FindBySub(ctx, sub)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	newUser, err := a.inner.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) FindByName(ctx context.Context, name string) (*user.User, error) {
	newUser, err := a.inner.FindByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) FindByAlias(ctx context.Context, alias string) (*user.User, error) {
	newUser, err := a.inner.FindByAlias(ctx, alias)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*user.User, error) {
	newUser, err := a.inner.FindByNameOrEmail(ctx, nameOrEmail)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) SearchByKeyword(ctx context.Context, keyword string, fields ...string) (user.List, error) {
	newUsers, err := a.inner.SearchByKeyword(ctx, keyword, fields...)
	if err != nil {
		return nil, err
	}

	oldUsers := make(user.List, 0, len(newUsers))
	for _, newUser := range newUsers {
		oldUsers = append(oldUsers, convertNewUserToOldForAdapter(newUser))
	}
	return oldUsers, nil
}

func (a *ReverseUserAdapter) FindByVerification(ctx context.Context, code string) (*user.User, error) {
	newUser, err := a.inner.FindByVerification(ctx, code)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) FindByPasswordResetRequest(ctx context.Context, token string) (*user.User, error) {
	newUser, err := a.inner.FindByPasswordResetRequest(ctx, token)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(newUser), nil
}

func (a *ReverseUserAdapter) FindBySubOrCreate(ctx context.Context, u *user.User, sub string) (*user.User, error) {
	newUser := convertOldUserToNewForAdapter(u)
	result, err := a.inner.FindBySubOrCreate(ctx, newUser, sub)
	if err != nil {
		return nil, err
	}
	return convertNewUserToOldForAdapter(result), nil
}

func (a *ReverseUserAdapter) Create(ctx context.Context, u *user.User) error {
	newUser := convertOldUserToNewForAdapter(u)
	return a.inner.Create(ctx, newUser)
}

func (a *ReverseUserAdapter) Save(ctx context.Context, u *user.User) error {
	newUser := convertOldUserToNewForAdapter(u)
	return a.inner.Save(ctx, newUser)
}

func (a *ReverseUserAdapter) Remove(ctx context.Context, uid user.ID) error {
	newID, _ := accountsID.UserIDFrom(uid.String())
	return a.inner.Remove(ctx, newID)
}

// ReverseWorkspaceAdapter wraps new accountsRepo.Workspace and implements old accountrepo.Workspace
type ReverseWorkspaceAdapter struct {
	inner accountsRepo.Workspace
}

func NewReverseWorkspaceAdapter(inner accountsRepo.Workspace) accountrepo.Workspace {
	return &ReverseWorkspaceAdapter{
		inner: inner,
	}
}

func (a *ReverseWorkspaceAdapter) Filtered(f accountrepo.WorkspaceFilter) accountrepo.Workspace {
	// Convert old filter to new filter
	var newFilter accountsRepo.WorkspaceFilter
	if f.Readable != nil {
		newFilter.Readable = convertOldWorkspaceIDListToNew(f.Readable)
	}
	if f.Writable != nil {
		newFilter.Writable = convertOldWorkspaceIDListToNew(f.Writable)
	}

	filtered := a.inner.Filtered(newFilter)
	return &ReverseWorkspaceAdapter{inner: filtered}
}

func (a *ReverseWorkspaceAdapter) FindByID(ctx context.Context, wsid workspace.ID) (*workspace.Workspace, error) {
	newID, _ := accountsID.WorkspaceIDFrom(wsid.String())
	newWs, err := a.inner.FindByID(ctx, newID)
	if err != nil {
		return nil, err
	}
	return convertNewWorkspaceToOldForAdapter(newWs), nil
}

func (a *ReverseWorkspaceAdapter) FindByName(ctx context.Context, name string) (*workspace.Workspace, error) {
	newWs, err := a.inner.FindByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return convertNewWorkspaceToOldForAdapter(newWs), nil
}

func (a *ReverseWorkspaceAdapter) FindByAlias(ctx context.Context, alias string) (*workspace.Workspace, error) {
	newWs, err := a.inner.FindByAlias(ctx, alias)
	if err != nil {
		return nil, err
	}
	return convertNewWorkspaceToOldForAdapter(newWs), nil
}

func (a *ReverseWorkspaceAdapter) FindByIDOrAlias(ctx context.Context, idOrAlias workspace.IDOrAlias) (*workspace.Workspace, error) {
	// Try to convert to ID first
	if id, err := workspace.IDFrom(string(idOrAlias)); err == nil {
		return a.FindByID(ctx, id)
	}
	// Otherwise treat as alias
	return a.FindByAlias(ctx, string(idOrAlias))
}

func (a *ReverseWorkspaceAdapter) FindByIDs(ctx context.Context, ids workspace.IDList) (workspace.List, error) {
	newIDs := convertOldWorkspaceIDListToNew(ids)

	newWorkspaces, err := a.inner.FindByIDs(ctx, newIDs)
	if err != nil {
		return nil, err
	}

	oldWorkspaces := make(workspace.List, 0, len(newWorkspaces))
	for _, newWs := range newWorkspaces {
		oldWorkspaces = append(oldWorkspaces, convertNewWorkspaceToOldForAdapter(newWs))
	}
	return oldWorkspaces, nil
}

func (a *ReverseWorkspaceAdapter) FindByUser(ctx context.Context, uid user.ID) (workspace.List, error) {
	newUID, _ := accountsID.UserIDFrom(uid.String())
	newWorkspaces, err := a.inner.FindByUser(ctx, newUID)
	if err != nil {
		return nil, err
	}

	oldWorkspaces := make(workspace.List, 0, len(newWorkspaces))
	for _, newWs := range newWorkspaces {
		oldWorkspaces = append(oldWorkspaces, convertNewWorkspaceToOldForAdapter(newWs))
	}
	return oldWorkspaces, nil
}

func (a *ReverseWorkspaceAdapter) FindByUserWithPagination(ctx context.Context, uid user.ID, pagination *usecasex.Pagination) (workspace.List, *usecasex.PageInfo, error) {
	newUID, _ := accountsID.UserIDFrom(uid.String())
	newWorkspaces, pageInfo, err := a.inner.FindByUserWithPagination(ctx, newUID, pagination)
	if err != nil {
		return nil, nil, err
	}

	oldWorkspaces := make(workspace.List, 0, len(newWorkspaces))
	for _, newWs := range newWorkspaces {
		oldWorkspaces = append(oldWorkspaces, convertNewWorkspaceToOldForAdapter(newWs))
	}
	return oldWorkspaces, pageInfo, nil
}

func (a *ReverseWorkspaceAdapter) FindByIntegration(ctx context.Context, iid workspace.IntegrationID) (workspace.List, error) {
	newIID, _ := accountsID.IntegrationIDFrom(iid.String())
	newWorkspaces, err := a.inner.FindByIntegration(ctx, newIID)
	if err != nil {
		return nil, err
	}

	oldWorkspaces := make(workspace.List, 0, len(newWorkspaces))
	for _, newWs := range newWorkspaces {
		oldWorkspaces = append(oldWorkspaces, convertNewWorkspaceToOldForAdapter(newWs))
	}
	return oldWorkspaces, nil
}

func (a *ReverseWorkspaceAdapter) FindByIntegrations(ctx context.Context, iids workspace.IntegrationIDList) (workspace.List, error) {
	newIIDs := make(accountsID.IntegrationIDList, 0, len(iids))
	for _, iid := range iids {
		newIID, _ := accountsID.IntegrationIDFrom(iid.String())
		newIIDs = append(newIIDs, newIID)
	}

	newWorkspaces, err := a.inner.FindByIntegrations(ctx, newIIDs)
	if err != nil {
		return nil, err
	}

	oldWorkspaces := make(workspace.List, 0, len(newWorkspaces))
	for _, newWs := range newWorkspaces {
		oldWorkspaces = append(oldWorkspaces, convertNewWorkspaceToOldForAdapter(newWs))
	}
	return oldWorkspaces, nil
}

func (a *ReverseWorkspaceAdapter) CheckWorkspaceAliasUnique(ctx context.Context, wsid workspace.ID, alias string) error {
	newID, _ := accountsID.WorkspaceIDFrom(wsid.String())
	return a.inner.CheckWorkspaceAliasUnique(ctx, newID, alias)
}

func (a *ReverseWorkspaceAdapter) Create(ctx context.Context, ws *workspace.Workspace) error {
	newWs := convertOldWorkspaceToNewForAdapter(ws)
	return a.inner.Create(ctx, newWs)
}

func (a *ReverseWorkspaceAdapter) Save(ctx context.Context, ws *workspace.Workspace) error {
	newWs := convertOldWorkspaceToNewForAdapter(ws)
	return a.inner.Save(ctx, newWs)
}

func (a *ReverseWorkspaceAdapter) SaveAll(ctx context.Context, wsList workspace.List) error {
	newWorkspaces := make([]*accountsWorkspace.Workspace, 0, len(wsList))
	for _, ws := range wsList {
		newWorkspaces = append(newWorkspaces, convertOldWorkspaceToNewForAdapter(ws))
	}
	return a.inner.SaveAll(ctx, newWorkspaces)
}

func (a *ReverseWorkspaceAdapter) Remove(ctx context.Context, wsid workspace.ID) error {
	newID, _ := accountsID.WorkspaceIDFrom(wsid.String())
	return a.inner.Remove(ctx, newID)
}

func (a *ReverseWorkspaceAdapter) RemoveAll(ctx context.Context, ids workspace.IDList) error {
	newIDs := convertOldWorkspaceIDListToNew(ids)
	return a.inner.RemoveAll(ctx, newIDs)
}

// Helper conversion functions
func convertNewUserToOldForAdapter(newUser *accountsUser.User) *user.User {
	if newUser == nil {
		return nil
	}

	oldID, _ := user.IDFrom(newUser.ID().String())
	oldWorkspaceID, _ := user.WorkspaceIDFrom(newUser.Workspace().String())

	// Convert metadata
	var oldMetadata *user.Metadata
	if newMetadata := newUser.Metadata(); newMetadata != nil {
		md := user.Metadata{}
		md.SetPhotoURL(newMetadata.PhotoURL())
		md.SetDescription(newMetadata.Description())
		md.SetWebsite(newMetadata.Website())
		md.SetLang(newMetadata.Lang())
		md.SetTheme(user.Theme(newMetadata.Theme()))
		oldMetadata = &md
	}

	// Convert auths
	newAuths := newUser.Auths()
	oldAuths := make([]user.Auth, 0, len(newAuths))
	for _, auth := range newAuths {
		oldAuths = append(oldAuths, user.Auth{
			Provider: auth.Provider,
			Sub:      auth.Sub,
		})
	}

	// Build old user
	builder := user.New().
		ID(oldID).
		Name(newUser.Name()).
		Email(newUser.Email()).
		Workspace(oldWorkspaceID).
		Auths(oldAuths)

	if oldMetadata != nil {
		builder = builder.Metadata(oldMetadata)
	}

	oldUser, _ := builder.Build()
	return oldUser
}

func convertOldUserToNewForAdapter(oldUser *user.User) *accountsUser.User {
	if oldUser == nil {
		return nil
	}

	// Convert ID
	newID, _ := accountsID.UserIDFrom(oldUser.ID().String())
	newWorkspaceID, _ := accountsID.WorkspaceIDFrom(oldUser.Workspace().String())

	// Convert metadata
	var newMetadata *accountsUser.Metadata
	if oldMetadata := oldUser.Metadata(); oldMetadata != nil {
		md := accountsUser.Metadata{}
		md.SetPhotoURL(oldMetadata.PhotoURL())
		md.SetDescription(oldMetadata.Description())
		md.SetWebsite(oldMetadata.Website())
		md.SetLang(oldMetadata.Lang())
		md.SetTheme(accountsUser.Theme(oldMetadata.Theme()))
		newMetadata = &md
	}

	// Convert auths
	oldAuths := oldUser.Auths()
	newAuths := make([]accountsUser.Auth, 0, len(oldAuths))
	for _, auth := range oldAuths {
		newAuths = append(newAuths, accountsUser.Auth{
			Provider: auth.Provider,
			Sub:      auth.Sub,
		})
	}

	// Build new user
	builder := accountsUser.New().
		ID(newID).
		Name(oldUser.Name()).
		Email(oldUser.Email()).
		Workspace(newWorkspaceID).
		Auths(newAuths)

	if newMetadata != nil {
		builder = builder.Metadata(*newMetadata)
	}

	newUser, _ := builder.Build()
	return newUser
}

func convertNewWorkspaceToOldForAdapter(newWs *accountsWorkspace.Workspace) *workspace.Workspace {
	if newWs == nil {
		return nil
	}

	oldID, _ := workspace.IDFrom(newWs.ID().String())

	newMembers := newWs.Members().Users()
	oldMembers := make(map[user.ID]workspace.Member)
	for uid, member := range newMembers {
		oldUID, _ := user.IDFrom(uid.String())
		oldMembers[oldUID] = workspace.Member{
			Role: workspace.Role(member.Role),
		}
	}

	var oldPolicyID *workspace.PolicyID
	if newPolicy := newWs.Policy(); newPolicy != nil {
		policyID := workspace.PolicyID(*newPolicy)
		oldPolicyID = &policyID
	}

	oldWs, _ := workspace.New().
		ID(oldID).
		Name(newWs.Name()).
		Members(oldMembers).
		Personal(newWs.IsPersonal()).
		Policy(oldPolicyID).
		Build()

	return oldWs
}

func convertOldWorkspaceToNewForAdapter(oldWs *workspace.Workspace) *accountsWorkspace.Workspace {
	if oldWs == nil {
		return nil
	}

	newID, _ := accountsID.WorkspaceIDFrom(oldWs.ID().String())

	oldMembers := oldWs.Members().Users()
	newMembers := make(map[accountsID.UserID]accountsWorkspace.Member)
	for uid, member := range oldMembers {
		newUID, _ := accountsID.UserIDFrom(uid.String())
		newMembers[newUID] = accountsWorkspace.Member{
			Role: accountsWorkspace.Role(member.Role),
		}
	}

	var newPolicyID *accountsWorkspace.PolicyID
	if oldPolicy := oldWs.Policy(); oldPolicy != nil {
		policyID := accountsWorkspace.PolicyID(*oldPolicy)
		newPolicyID = &policyID
	}

	newWs, _ := accountsWorkspace.New().
		ID(newID).
		Name(oldWs.Name()).
		Members(newMembers).
		Personal(oldWs.IsPersonal()).
		Policy(newPolicyID).
		Build()

	return newWs
}

func convertOldWorkspaceIDListToNew(ids workspace.IDList) accountsID.WorkspaceIDList {
	newIDs := make(accountsID.WorkspaceIDList, 0, len(ids))
	for _, id := range ids {
		newID, _ := accountsID.WorkspaceIDFrom(id.String())
		newIDs = append(newIDs, newID)
	}
	return newIDs
}
