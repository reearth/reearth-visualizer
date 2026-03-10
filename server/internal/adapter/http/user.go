package http

import (
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"golang.org/x/text/language"
)

type SignupInput struct {
	Sub         *string                 `json:"sub"`
	Secret      *string                 `json:"secret"`
	UserID      *accountsID.UserID      `json:"userId"`
	WorkspaceID *accountsID.WorkspaceID `json:"workspaceId"`
	TeamID      *accountsID.WorkspaceID `json:"teamId"` // TeamID is an alias of WorkspaceID
	Name        string                  `json:"name"`
	Username    string                  `json:"username"` // ysername is an alias of Name
	Email       string                  `json:"email"`
	Password    string                  `json:"password"`
	Theme       *accountsUser.Theme     `json:"theme"`
	Lang        *language.Tag           `json:"lang"`
}

type SignupOutput struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
