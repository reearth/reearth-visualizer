package gqlmodel

import "github.com/hasura/go-graphql-client"

type WorkspaceMetadata struct {
	Description  graphql.String `json:"description" graphql:"description"`
	Website      graphql.String `json:"website" graphql:"website"`
	Location     graphql.String `json:"location" graphql:"location"`
	BillingEmail graphql.String `json:"billingEmail" graphql:"billingEmail"`
	PhotoURL     graphql.String `json:"photoURL" graphql:"photoURL"`
}
