package user

import (
	"time"

	"github.com/google/uuid"
)

var timeNow = time.Now

type PasswordReset struct {
	Token     string
	CreatedAt time.Time
}

func NewPasswordReset() *PasswordReset {
	return &PasswordReset{
		Token:     generateToken(),
		CreatedAt: timeNow(),
	}
}

func PasswordResetFrom(token string, createdAt time.Time) *PasswordReset {
	return &PasswordReset{
		Token:     token,
		CreatedAt: createdAt,
	}
}

func generateToken() string {
	return uuid.New().String()
}

func (pr *PasswordReset) Validate(token string) bool {
	return pr != nil && pr.Token == token && pr.CreatedAt.Add(24*time.Hour).After(time.Now())
}

func (pr *PasswordReset) Clone() *PasswordReset {
	if pr == nil {
		return nil
	}
	pr2 := PasswordResetFrom(pr.Token, pr.CreatedAt)
	return pr2
}
