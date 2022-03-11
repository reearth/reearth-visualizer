package mongodoc

import (
	"time"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
	user1 "github.com/reearth/reearth-backend/pkg/user"
)

type PasswordResetDocument struct {
	Token     string
	CreatedAt time.Time
}

type UserDocument struct {
	ID            string
	Name          string
	Email         string
	Auth0Sub      string
	Auth0SubList  []string
	Team          string
	Lang          string
	Theme         string
	Password      []byte
	PasswordReset *PasswordResetDocument
	Verification  *UserVerificationDoc
}

type UserVerificationDoc struct {
	Code       string
	Expiration time.Time
	Verified   bool
}

type UserConsumer struct {
	Rows []*user1.User
}

func (u *UserConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc UserDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	user, err := doc.Model()
	if err != nil {
		return err
	}
	u.Rows = append(u.Rows, user)
	return nil
}

func NewUser(user *user1.User) (*UserDocument, string) {
	id := user.ID().String()
	auths := user.Auths()
	authsdoc := make([]string, 0, len(auths))
	for _, a := range auths {
		authsdoc = append(authsdoc, a.Sub)
	}
	var v *UserVerificationDoc
	if user.Verification() != nil {
		v = &UserVerificationDoc{
			Code:       user.Verification().Code(),
			Expiration: user.Verification().Expiration(),
			Verified:   user.Verification().IsVerified(),
		}
	}
	pwdReset := user.PasswordReset()

	var pwdResetDoc *PasswordResetDocument
	if pwdReset != nil {
		pwdResetDoc = &PasswordResetDocument{
			Token:     pwdReset.Token,
			CreatedAt: pwdReset.CreatedAt,
		}
	}

	return &UserDocument{
		ID:            id,
		Name:          user.Name(),
		Email:         user.Email(),
		Auth0SubList:  authsdoc,
		Team:          user.Team().String(),
		Lang:          user.Lang().String(),
		Theme:         string(user.Theme()),
		Verification:  v,
		Password:      user.Password(),
		PasswordReset: pwdResetDoc,
	}, id
}

func (d *UserDocument) Model() (*user1.User, error) {
	uid, err := id.UserIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := id.TeamIDFrom(d.Team)
	if err != nil {
		return nil, err
	}
	auths := make([]user.Auth, 0, len(d.Auth0SubList))
	for _, s := range d.Auth0SubList {
		auths = append(auths, user.AuthFromAuth0Sub(s))
	}
	if d.Auth0Sub != "" {
		auths = append(auths, user.AuthFromAuth0Sub(d.Auth0Sub))
	}
	var v *user.Verification
	if d.Verification != nil {
		v = user.VerificationFrom(d.Verification.Code, d.Verification.Expiration, d.Verification.Verified)
	}

	u, err := user1.New().
		ID(uid).
		Name(d.Name).
		Email(d.Email).
		Auths(auths).
		Team(tid).
		LangFrom(d.Lang).
		Verification(v).
		Password(d.Password).
		PasswordReset(d.PasswordReset.Model()).
		Theme(user.Theme(d.Theme)).
		Build()

	if err != nil {
		return nil, err
	}
	return u, nil
}

func (d *PasswordResetDocument) Model() *user1.PasswordReset {
	if d == nil {
		return nil
	}
	return &user1.PasswordReset{
		Token:     d.Token,
		CreatedAt: d.CreatedAt,
	}
}
