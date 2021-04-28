package user

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"golang.org/x/text/language"
)

type Builder struct {
	u *User
}

func New() *Builder {
	return &Builder{u: &User{}}
}

func (b *Builder) Build() (*User, error) {
	if id.ID(b.u.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	return b.u, nil
}

func (b *Builder) MustBuild() *User {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id id.UserID) *Builder {
	b.u.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.u.id = id.UserID(id.New())
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.u.name = name
	return b
}

func (b *Builder) Email(email string) *Builder {
	b.u.email = email
	return b
}

func (b *Builder) Team(team id.TeamID) *Builder {
	b.u.team = team
	return b
}

func (b *Builder) Lang(lang language.Tag) *Builder {
	b.u.lang = lang
	return b
}

func (b *Builder) Theme(t Theme) *Builder {
	b.u.theme = t
	return b
}

func (b *Builder) LangFrom(lang string) *Builder {
	if lang == "" {
		b.u.lang = language.Tag{}
	} else if l, err := language.Parse(lang); err == nil {
		b.u.lang = l
	}
	return b
}

func (b *Builder) Auths(auths []Auth) *Builder {
	b.u.auths = append([]Auth{}, auths...)
	return b
}
