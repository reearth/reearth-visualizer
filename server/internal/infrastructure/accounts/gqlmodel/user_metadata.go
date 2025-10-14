package gqlmodel

import (
	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth/server/pkg/user"
	"golang.org/x/text/language"
)

type UserMetadata struct {
	Description graphql.String `json:"description" graphql:"description"`
	Lang        graphql.String `json:"lang" graphql:"lang"`
	PhotoURL    graphql.String `json:"photoURL" graphql:"photoURL"`
	Theme       graphql.String `json:"theme" graphql:"theme"`
	Website     graphql.String `json:"website" graphql:"website"`
}

func ToUserMetadata(m UserMetadata) user.Metadata {
	return user.NewMetadata().
		Description(string(m.Description)).
		Lang(language.Make(string(m.Lang))).
		PhotoURL(string(m.PhotoURL)).
		Theme(string(m.Theme)).
		Website(string(m.Website)).
		MustBuild()
}
