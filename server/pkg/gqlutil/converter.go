package gqlutil

import (
	"github.com/hasura/go-graphql-client"
)

func FromPtrToPtr(s *graphql.String) *string {
	if s == nil {
		return nil
	}
	str := string(*s)
	return &str
}

func ToStringSlice(gqlSlice []graphql.String) []string {
	res := make([]string, len(gqlSlice))
	for i, v := range gqlSlice {
		res[i] = string(v)
	}
	return res
}
