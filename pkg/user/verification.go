package user

import (
	"time"

	uuid "github.com/google/uuid"
)

var Now = time.Now
var GenerateVerificationCode = generateCode

func MockNow(t time.Time) func() {
	Now = func() time.Time { return t }
	return func() { Now = time.Now }
}

func MockGenerateVerificationCode(code string) func() {
	GenerateVerificationCode = func() string { return code }
	return func() { GenerateVerificationCode = generateCode }
}

func NewVerification() *Verification {
	return &Verification{
		verified:   false,
		code:       GenerateVerificationCode(),
		expiration: Now().Add(time.Hour * 24),
	}
}

func VerificationFrom(c string, e time.Time, b bool) *Verification {
	return &Verification{
		verified:   b,
		code:       c,
		expiration: e,
	}
}

type Verification struct {
	verified   bool
	code       string
	expiration time.Time
}

func (v *Verification) IsVerified() bool {
	if v == nil {
		return false
	}
	return v.verified
}

func (v *Verification) Code() string {
	if v == nil {
		return ""
	}
	return v.code
}

func (v *Verification) Expiration() time.Time {
	if v == nil {
		return time.Time{}
	}
	return v.expiration
}

func generateCode() string {
	return uuid.NewString()
}

func (v *Verification) IsExpired() bool {
	if v == nil {
		return true
	}
	now := time.Now()
	return now.After(v.expiration)
}

func (v *Verification) SetVerified(b bool) {
	if v == nil {
		return
	}
	v.verified = b
}
