package factory

import (
	"github.com/go-faker/faker/v4"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
)

type UserOption func(*user.Builder)

func NewUser(opts ...UserOption) *user.User {
	p := user.New().
		ID(accountdomain.NewUserID()).
		Name(faker.Name()).
		Email(faker.Email())
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
