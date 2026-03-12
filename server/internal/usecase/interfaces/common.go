package interfaces

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"golang.org/x/text/language"
)

type ListOperation string

const (
	ListOperationAdd    ListOperation = "add"
	ListOperationMove   ListOperation = "move"
	ListOperationRemove ListOperation = "remove"
)

var (
	ErrSceneIsLocked   error = errors.New("scene is locked")
	ErrOperationDenied error = errors.New("operation denied")
	ErrFileNotIncluded error = errors.New("file not included")
	ErrFeatureNotFound error = errors.New("feature not found")
)

type Container struct {
	Asset           Asset
	NLSLayer        NLSLayer
	Plugin          Plugin
	Policy          Policy
	Project         Project
	ProjectMetadata ProjectMetadata
	Property        Property
	Published       Published
	Scene           Scene
	StoryTelling    Storytelling
	Style           Style
	User            User
	Workspace       Workspace
}

// User defines the interface for user-related use cases.
// This replaces the old accountinterfaces.User from reearthx.
type User interface {
	UserQuery

	Signup(context.Context, SignupParam) (*accountsUser.User, error)
	SignupOIDC(context.Context, SignupOIDCParam) (*accountsUser.User, error)

	UpdateMe(context.Context, UpdateMeParam, *accountsWorkspace.Operator) (*accountsUser.User, error)
	RemoveMyAuth(context.Context, string, *accountsWorkspace.Operator) (*accountsUser.User, error)
	DeleteMe(context.Context, accountsUser.ID, *accountsWorkspace.Operator) error

	CreateVerification(context.Context, string) error
	VerifyUser(context.Context, string) (*accountsUser.User, error)
	StartPasswordReset(context.Context, string) error
	PasswordReset(context.Context, string, string) error
}

// UserQuery defines read-only user queries.
type UserQuery interface {
	FetchByID(context.Context, accountsUser.IDList) (accountsUser.List, error)
	FetchBySub(context.Context, string) (*accountsUser.User, error)
	FetchByNameOrEmail(context.Context, string) (*accountsUser.Simple, error)
	SearchUser(context.Context, string) (accountsUser.List, error)
}

// SignupOIDCParam defines parameters for OIDC signup.
type SignupOIDCParam struct {
	AccessToken string
	Issuer      string
	Sub         string
	Email       string
	Name        string
	Secret      *string
	User        SignupUserParam
}

// SignupUserParam defines user-specific signup parameters.
type SignupUserParam struct {
	UserID      *accountsUser.ID
	Lang        *language.Tag
	Theme       *accountsUser.Theme
	WorkspaceID *accountsID.WorkspaceID
}

// SignupParam defines parameters for regular signup.
type SignupParam struct {
	Email       string
	Name        string
	Password    string
	Secret      *string
	Lang        *language.Tag
	Theme       *accountsUser.Theme
	UserID      *accountsUser.ID
	WorkspaceID *accountsID.WorkspaceID
	MockAuth    bool
}

// UpdateMeParam defines parameters for updating the current user.
type UpdateMeParam struct {
	Name                 *string
	Email                *string
	Lang                 *language.Tag
	Theme                *accountsUser.Theme
	Password             *string
	PasswordConfirmation *string
}

// Workspace defines the interface for workspace-related use cases.
// User-facing mutations are primarily served by the reearth-accounts gqlclient API
// (see resolver_mutation_workspace.go). The methods below are kept as fallback for
// e2e tests where AccountsAPIClient is nil.
type Workspace interface {
	Fetch(context.Context, accountsWorkspace.IDList, *accountsWorkspace.Operator) (accountsWorkspace.List, error)
	FindByUser(context.Context, accountsUser.ID, *accountsWorkspace.Operator) (accountsWorkspace.List, error)
	// User mutation fallback (used when AccountsAPIClient is nil, e.g. e2e tests)
	Create(context.Context, string, accountsUser.ID, *string, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	Update(context.Context, accountsWorkspace.ID, string, *string, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	AddUserMember(context.Context, accountsWorkspace.ID, map[accountsUser.ID]accountsRole.RoleType, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	UpdateUserMember(context.Context, accountsWorkspace.ID, accountsUser.ID, accountsRole.RoleType, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	RemoveUserMember(context.Context, accountsWorkspace.ID, accountsUser.ID, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	Remove(context.Context, accountsWorkspace.ID, *accountsWorkspace.Operator) error
	// Integration member management (not yet migrated to accounts API)
	AddIntegrationMember(context.Context, accountsWorkspace.ID, accountsWorkspace.IntegrationID, accountsRole.RoleType, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	UpdateIntegration(context.Context, accountsWorkspace.ID, accountsWorkspace.IntegrationID, accountsRole.RoleType, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	RemoveIntegration(context.Context, accountsWorkspace.ID, accountsWorkspace.IntegrationID, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
	RemoveIntegrations(context.Context, accountsWorkspace.ID, accountsWorkspace.IntegrationIDList, *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error)
}
