package user

import (
	"context"
	"fmt"

	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts/gqlerror"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts/gqlmodel"
	"github.com/reearth/reearth/server/pkg/gqlutil"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/samber/lo"
)

type userRepo struct {
	client *graphql.Client
}

func NewRepo(gql *graphql.Client) user.Repo {
	return &userRepo{client: gql}
}

func (r *userRepo) FindMe(ctx context.Context) (*user.User, error) {
	fmt.Println("[FindMe] Starting GraphQL query")
	var q findMeQuery
	if err := r.client.Query(ctx, &q, nil); err != nil {
		fmt.Printf("[FindMe] GraphQL query failed: %v\n", err)
		return nil, gqlerror.ReturnAccountsError(err)
	}

	fmt.Printf("[FindMe] Raw response: %+v\n", q)
	fmt.Printf("[FindMe] Me object: ID=%s, Name=%s, Alias=%s, Email=%s, MyWorkspaceID=%s\n",
		q.Me.ID, q.Me.Name, q.Me.Alias, q.Me.Email, q.Me.MyWorkspaceID)

	if q.Me.ID == "" {
		fmt.Println("[FindMe] ERROR: User ID is empty!")
		return nil, fmt.Errorf("user ID is empty in response")
	}

	return user.New().
		ID(string(q.Me.ID)).
		Name(string(q.Me.Name)).
		Alias(string(q.Me.Alias)).
		Email(string(q.Me.Email)).
		Metadata(gqlmodel.ToUserMetadata(q.Me.Metadata)).
		Host(lo.ToPtr(string(q.Me.Host))).
		MyWorkspaceID(string(q.Me.MyWorkspaceID)).
		Auths(gqlutil.ToStringSlice(q.Me.Auths)).
		Workspaces(gqlmodel.ToWorkspaces(q.Me.Workspaces)).
		Build()
}

func (r *userRepo) FindByID(ctx context.Context, id string) (*user.User, error) {
	var q findByIDQuery
	vars := map[string]interface{}{
		"id": graphql.ID(id),
	}
	if err := r.client.Query(ctx, &q, vars); err != nil {
		return nil, gqlerror.ReturnAccountsError(err)
	}

	return user.New().
		ID(string(q.User.ID)).
		Name(string(q.User.Name)).
		Email(string(q.User.Email)).
		Host(gqlutil.FromPtrToPtr(q.User.Host)).
		MyWorkspaceID(string(q.User.Workspace)).
		Auths(gqlutil.ToStringSlice(q.User.Auths)).
		Metadata(gqlmodel.ToUserMetadata(q.User.Metadata)).
		Build()
}

func (r *userRepo) FindByAlias(ctx context.Context, name string) (*user.User, error) {
	var q findByNameQuery
	vars := map[string]interface{}{
		"nameOrEmail": graphql.String(name),
	}
	if err := r.client.Query(ctx, &q, vars); err != nil {
		return nil, gqlerror.ReturnAccountsError(err)
	}

	return user.New().
		ID(string(q.User.ID)).
		Name(string(q.User.Name)).
		Email(string(q.User.Email)).
		Host(gqlutil.FromPtrToPtr(q.User.Host)).
		MyWorkspaceID(string(q.User.Workspace)).
		Auths(gqlutil.ToStringSlice(q.User.Auths)).
		Build()
}

// TODO: Extend the Account server's UpdateMeInput to support alias, photoURL, website, and description.
// This function currently only updates the 'name' field due to server-side limitations.
func (r *userRepo) Update(ctx context.Context, name string) error {
	var m updateMeMutation
	vars := map[string]interface{}{
		"name": graphql.String(name),
	}
	return r.client.Mutate(ctx, &m, vars)
}

func (r *userRepo) SignupOIDC(ctx context.Context, name string, email string, sub string, secret string) (*user.User, error) {
	var m signupOIDCMutation
	vars := map[string]interface{}{
		"name":   graphql.String(name),
		"email":  graphql.String(email),
		"sub":    graphql.String(sub),
		"secret": graphql.String(secret),
	}
	if err := r.client.Mutate(ctx, &m, vars); err != nil {
		return nil, gqlerror.ReturnAccountsError(err)
	}

	return user.New().
		ID(string(m.SignupOIDC.User.ID)).
		Name(string(m.SignupOIDC.User.Name)).
		Email(string(m.SignupOIDC.User.Email)).
		Build()
}

func (r *userRepo) Signup(ctx context.Context, userID, name, email, password, secret, workspaceID string) (*user.User, error) {
	var m signupMutation
	vars := map[string]interface{}{}

	if userID != "" {
		vars["id"] = graphql.ID(userID)
	}

	if workspaceID != "" {
		vars["workspaceID"] = graphql.ID(workspaceID)
	}

	vars["name"] = graphql.String(name)
	vars["email"] = graphql.String(email)
	vars["password"] = graphql.String(password)
	vars["secret"] = graphql.String(secret)

	if err := r.client.Mutate(ctx, &m, vars); err != nil {
		return nil, gqlerror.ReturnAccountsError(err)
	}

	return user.New().
		ID(string(m.Signup.User.ID)).
		Name(string(m.Signup.User.Name)).
		Email(string(m.Signup.User.Email)).
		Build()
}

func (r *userRepo) FindBySub(ctx context.Context, sub string) (*user.User, error) {
	fmt.Printf("[FindBySub] Called with sub: %s\n", sub)
	// Accounts API uses JWT authentication and the 'me' query
	// The sub is implicitly derived from the JWT token in the Authorization header
	// via DynamicAuthTransport, so we just call FindMe
	result, err := r.FindMe(ctx)
	if err != nil {
		fmt.Printf("[FindBySub] FindMe failed: %v\n", err)
		return nil, err
	}
	fmt.Printf("[FindBySub] FindMe successful, user ID: %s\n", result.ID())
	return result, nil
}
