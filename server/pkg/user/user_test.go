package user

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestUser(t *testing.T) {
	uid := NewID()
	tid := NewTeamID()

	tests := []struct {
		Name     string
		User     *User
		Expected struct {
			Id    ID
			Name  string
			Email string
			Team  TeamID
			Auths []Auth
			Lang  language.Tag
		}
	}{
		{
			Name: "create user",
			User: New().ID(uid).
				Team(tid).
				Name("xxx").
				LangFrom("en").
				Email("ff@xx.zz").
				Auths([]Auth{{
					Provider: "aaa",
					Sub:      "sss",
				}}).MustBuild(),
			Expected: struct {
				Id    ID
				Name  string
				Email string
				Team  TeamID
				Auths []Auth
				Lang  language.Tag
			}{
				Id:    uid,
				Name:  "xxx",
				Email: "ff@xx.zz",
				Team:  tid,
				Auths: []Auth{{
					Provider: "aaa",
					Sub:      "sss",
				}},
				Lang: language.Make("en"),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected.Id, tc.User.ID())
			assert.Equal(t, tc.Expected.Name, tc.User.Name())
			assert.Equal(t, tc.Expected.Team, tc.User.Team())
			assert.Equal(t, tc.Expected.Auths, tc.User.Auths())
			assert.Equal(t, tc.Expected.Email, tc.User.Email())
			assert.Equal(t, tc.Expected.Lang, tc.User.Lang())
		})
	}
}

func TestUser_AddAuth(t *testing.T) {
	tests := []struct {
		Name     string
		User     *User
		A        Auth
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name: "add new auth",
			User: New().NewID().Email("aaa@bbb.com").MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: true,
		},
		{
			Name: "existing auth",
			User: New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.User.AddAuth(tc.A)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestUser_RemoveAuth(t *testing.T) {
	tests := []struct {
		Name     string
		User     *User
		A        Auth
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name: "remove auth0",
			User: New().NewID().Email("aaa@bbb.com").MustBuild(),
			A: Auth{
				Provider: "auth0",
				Sub:      "zzz",
			},
			Expected: false,
		},
		{
			Name: "existing auth",
			User: New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.User.RemoveAuth(tc.A)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestUser_ContainAuth(t *testing.T) {
	tests := []struct {
		Name     string
		User     *User
		A        Auth
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name: "not existing auth",
			User: New().NewID().Email("aaa@bbb.com").MustBuild(),
			A: Auth{
				Provider: "auth0",
				Sub:      "zzz",
			},
			Expected: false,
		},
		{
			Name: "existing auth",
			User: New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.User.ContainAuth(tc.A)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestUser_HasAuthProvider(t *testing.T) {
	tests := []struct {
		Name     string
		User     *User
		P        string
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name:     "not existing auth",
			User:     New().NewID().Email("aaa@bbb.com").MustBuild(),
			P:        "auth0",
			Expected: false,
		},
		{
			Name: "existing auth",
			User: New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			P:        "xxx",
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.User.HasAuthProvider(tc.P)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestUser_RemoveAuthByProvider(t *testing.T) {
	tests := []struct {
		Name     string
		User     *User
		Provider string
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name:     "remove auth0",
			User:     New().NewID().Email("aaa@bbb.com").MustBuild(),
			Provider: "auth0",
			Expected: false,
		},
		{
			Name: "existing auth",
			User: New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			Provider: "xxx",
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.User.RemoveAuthByProvider(tc.Provider)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestUser_ClearAuths(t *testing.T) {
	u := New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
		Provider: "xxx",
		Sub:      "zzz",
	}}).MustBuild()
	u.ClearAuths()
	assert.Equal(t, 0, len(u.Auths()))
}

func TestUser_Auths(t *testing.T) {
	var u *User
	assert.Equal(t, []Auth(nil), u.Auths())
}

func TestUser_UpdateEmail(t *testing.T) {
	u := New().NewID().Email("abc@abc.com").MustBuild()
	assert.NoError(t, u.UpdateEmail("abc@xyz.com"))
	assert.Equal(t, "abc@xyz.com", u.Email())
	assert.Error(t, u.UpdateEmail("abcxyz"))
}

func TestUser_UpdateLang(t *testing.T) {
	u := New().NewID().Email("aaa@bbb.com").MustBuild()
	u.UpdateLang(language.Make("en"))
	assert.Equal(t, language.Make("en"), u.Lang())
}

func TestUser_UpdateTeam(t *testing.T) {
	tid := NewTeamID()
	u := New().NewID().Email("aaa@bbb.com").MustBuild()
	u.UpdateTeam(tid)
	assert.Equal(t, tid, u.Team())
}

func TestUser_UpdateName(t *testing.T) {
	u := New().NewID().Email("aaa@bbb.com").MustBuild()
	u.UpdateName("xxx")
	assert.Equal(t, "xxx", u.Name())
}

func TestUser_GetAuthByProvider(t *testing.T) {
	testCases := []struct {
		Name     string
		User     *User
		Provider string
		Expected *Auth
	}{
		{
			Name: "existing auth",
			User: New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			Provider: "xxx",
			Expected: &Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
		},
		{
			Name: "not existing auth",
			User: New().NewID().Email("aaa@bbb.com").Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			Provider: "yyy",
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.User.GetAuthByProvider(tc.Provider)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestUser_MatchPassword(t *testing.T) {
	// bcrypt is not suitable for unit tests as it requires heavy computation
	DefaultPasswordEncoder = &NoopPasswordEncoder{}

	password := MustEncodedPassword("abcDEF0!")

	type args struct {
		pass string
	}

	tests := []struct {
		name     string
		password []byte
		args     args
		want     bool
		wantErr  bool
	}{
		{
			name:     "should match",
			password: password,
			args: args{
				pass: "abcDEF0!",
			},
			want:    true,
			wantErr: false,
		},
		{
			name:     "should not match",
			password: password,
			args: args{
				pass: "xxx",
			},
			want:    false,
			wantErr: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			u := &User{
				password: tc.password,
			}
			got, err := u.MatchPassword(tc.args.pass)
			assert.Equal(tt, tc.want, got)
			if tc.wantErr {
				assert.Error(tt, err)
			} else {
				assert.NoError(tt, err)
			}
		})
	}
}

func TestUser_SetPassword(t *testing.T) {
	// bcrypt is not suitable for unit tests as it requires heavy computation
	DefaultPasswordEncoder = &NoopPasswordEncoder{}

	type args struct {
		pass string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "should set non-latin characters password",
			args: args{
				pass: "Àêîôûtest1",
			},
			want: "Àêîôûtest1",
		},
		{
			name: "should set latin characters password",
			args: args{
				pass: "Testabc1",
			},
			want: "Testabc1",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			u := &User{}
			_ = u.SetPassword(tc.args.pass)
			got, err := u.password.Verify(tc.want)
			assert.NoError(tt, err)
			assert.True(tt, got)
		})
	}
}

func TestUser_PasswordReset(t *testing.T) {
	testCases := []struct {
		Name     string
		User     *User
		Expected *PasswordReset
	}{
		{
			Name:     "not password request",
			User:     New().NewID().Email("aaa@bbb.com").MustBuild(),
			Expected: nil,
		},
		{
			Name: "create new password request over existing one",
			User: New().NewID().Email("aaa@bbb.com").PasswordReset(&PasswordReset{"xzy", time.Unix(0, 0)}).MustBuild(),
			Expected: &PasswordReset{
				Token:     "xzy",
				CreatedAt: time.Unix(0, 0),
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected, tc.User.PasswordReset())
		})
	}
}

func TestUser_SetPasswordReset(t *testing.T) {
	tests := []struct {
		Name     string
		User     *User
		Pr       *PasswordReset
		Expected *PasswordReset
	}{
		{
			Name:     "nil",
			User:     New().NewID().Email("aaa@bbb.com").MustBuild(),
			Pr:       nil,
			Expected: nil,
		},
		{
			Name: "nil",
			User: New().NewID().Email("aaa@bbb.com").MustBuild(),
			Pr: &PasswordReset{
				Token:     "xyz",
				CreatedAt: time.Unix(1, 1),
			},
			Expected: &PasswordReset{
				Token:     "xyz",
				CreatedAt: time.Unix(1, 1),
			},
		},
		{
			Name: "create new password request",
			User: New().NewID().Email("aaa@bbb.com").MustBuild(),
			Pr: &PasswordReset{
				Token:     "xyz",
				CreatedAt: time.Unix(1, 1),
			},
			Expected: &PasswordReset{
				Token:     "xyz",
				CreatedAt: time.Unix(1, 1),
			},
		},
		{
			Name: "create new password request over existing one",
			User: New().NewID().Email("aaa@bbb.com").PasswordReset(&PasswordReset{"xzy", time.Now()}).MustBuild(),
			Pr: &PasswordReset{
				Token:     "xyz",
				CreatedAt: time.Unix(1, 1),
			},
			Expected: &PasswordReset{
				Token:     "xyz",
				CreatedAt: time.Unix(1, 1),
			},
		},
		{
			Name:     "remove none existing password request",
			User:     New().NewID().Email("aaa@bbb.com").MustBuild(),
			Pr:       nil,
			Expected: nil,
		},
		{
			Name:     "remove existing password request",
			User:     New().NewID().Email("aaa@bbb.com").PasswordReset(&PasswordReset{"xzy", time.Now()}).MustBuild(),
			Pr:       nil,
			Expected: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			tt.User.SetPasswordReset(tt.Pr)
			assert.Equal(t, tt.Expected, tt.User.PasswordReset())
		})
	}
}

func TestUser_SetVerification(t *testing.T) {
	input := &User{}
	v := &Verification{
		verified:   false,
		code:       "xxx",
		expiration: time.Time{},
	}
	input.SetVerification(v)
	assert.Equal(t, v, input.verification)
}

func TestUser_Verification(t *testing.T) {
	v := NewVerification()
	tests := []struct {
		name         string
		verification *Verification
		want         *Verification
	}{
		{
			name:         "should return the same verification",
			verification: v,
			want:         v,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			u := &User{
				verification: tt.verification,
			}
			assert.Equal(t, tt.want, u.Verification())
		})
	}
}

func Test_ValidatePassword(t *testing.T) {
	tests := []struct {
		name    string
		pass    string
		wantErr bool
	}{
		{
			name:    "should pass",
			pass:    "Abcdafgh1",
			wantErr: false,
		},
		{
			name:    "shouldn't pass: length<8",
			pass:    "Aafgh1",
			wantErr: true,
		},
		{
			name:    "shouldn't pass: don't have numbers",
			pass:    "Abcdefghi",
			wantErr: true,
		},
		{
			name:    "shouldn't pass: don't have upper",
			pass:    "abcdefghi1",
			wantErr: true,
		},
		{
			name:    "shouldn't pass: don't have lower",
			pass:    "ABCDEFGHI1",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			out := ValidatePasswordFormat(tc.pass)
			assert.Equal(tt, out != nil, tc.wantErr)
		})
	}
}
