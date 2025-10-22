package gqlmodel

import "github.com/hasura/go-graphql-client"

type User struct {
	ID        graphql.ID       `json:"id" graphql:"id"`
	Name      graphql.String   `json:"name" graphql:"name"`
	Email     graphql.String   `json:"email" graphql:"email"`
	Host      *graphql.String  `json:"host,omitempty" graphql:"host"`
	Workspace graphql.ID       `json:"workspace" graphql:"workspace"`
	Auths     []graphql.String `json:"auths" graphql:"auths"`
	Metadata  UserMetadata     `json:"metadata" graphql:"metadata"`
}
