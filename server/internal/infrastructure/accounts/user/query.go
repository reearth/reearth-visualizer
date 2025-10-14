package user

import (
	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts/gqlmodel"
)

type findMeQuery struct {
	Me gqlmodel.Me `graphql:"me"`
}

type findByIDQuery struct {
	User gqlmodel.User `graphql:"user(id: $id)"`
}

type findByNameQuery struct {
	User struct {
		ID        graphql.ID       `json:"id" graphql:"id"`
		Name      graphql.String   `json:"name" graphql:"name"`
		Email     graphql.String   `json:"email" graphql:"email"`
		Host      *graphql.String  `json:"host,omitempty" graphql:"host"`
		Workspace graphql.ID       `json:"workspace" graphql:"workspace"`
		Auths     []graphql.String `json:"auths" graphql:"auths"`
	} `graphql:"userByNameOrEmail(nameOrEmail: $nameOrEmail)"`
}

type updateMeMutation struct {
	UpdateMe struct {
		Me gqlmodel.Me
	} `graphql:"updateMe(input: {name: $name})"`
}

type signupOIDCMutation struct {
	SignupOIDC struct {
		User gqlmodel.User
	} `graphql:"signupOIDC(input: {name: $name, email: $email, sub: $sub, secret: $secret})"`
}

type signupMutation struct {
	Signup struct {
		User gqlmodel.User
	} `graphql:"signup(input: {name: $name, email: $email, password: $password, secret: $secret, id: $id, workspaceID: $workspaceID})"`
}
