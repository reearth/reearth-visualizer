package gqlmodel

import "github.com/hasura/go-graphql-client"

type MemberInput struct {
	UserID graphql.ID     `json:"userId" graphql:"userId"`
	Role   graphql.String `json:"role" graphql:"role"`
}
