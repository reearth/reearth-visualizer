package mongodoc

import (
	"time"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/user"
	"golang.org/x/exp/slices"
)

type UserConsumer = Consumer[*UserDocument, *user.User]

func NewUserConsumer(workspaces []id.WorkspaceID) *UserConsumer {
	return NewConsumer[*UserDocument, *user.User](func(u *user.User) bool {
		return workspaces == nil || slices.Contains(workspaces, u.Workspace())
	})
}

type UserDocument struct{
	ID           string
	Name         string
	Email        string
	Workspace    string
	Auths        []AuthDocument
	Metadata     *MetadataDocument
	Verification *VerificationDocument
	PasswordReset *PasswordResetDocument
}

type AuthDocument struct {
	Provider string
	Sub      string
}

type MetadataDocument struct {
	PhotoURL    string
	Description string
	Website     string
	Lang        string
	Theme       string
}

type VerificationDocument struct {
	Code       string
	Expiry     time.Time
	Verified   bool
}

type PasswordResetDocument struct {
	Token  string
	Expiry time.Time
}

func NewUser(u *user.User) (*UserDocument, string) {
	if u == nil {
		return nil, ""
	}

	uid := u.ID().String()
	doc := &UserDocument{
		ID:        uid,
		Name:      u.Name(),
		Email:     u.Email(),
		Workspace: u.Workspace().String(),
	}

	// Convert auths
	auths := u.Auths()
	doc.Auths = make([]AuthDocument, 0, len(auths))
	for _, auth := range auths {
		doc.Auths = append(doc.Auths, AuthDocument{
			Provider: auth.Provider,
			Sub:      auth.Sub,
		})
	}

	// Convert metadata
	if md := u.Metadata(); md != nil {
		doc.Metadata = &MetadataDocument{
			PhotoURL:    md.PhotoURL(),
			Description: md.Description(),
			Website:     md.Website(),
			Lang:        md.Lang().String(),
			Theme:       string(md.Theme()),
		}
	}

	// Convert verification
	if v := u.Verification(); v != nil {
		doc.Verification = &VerificationDocument{
			Code:     v.Code(),
			Expiry:   v.Expiration(),
			Verified: v.IsVerified(),
		}
	}

	// Convert password reset
	if pr := u.PasswordReset(); pr != nil {
		doc.PasswordReset = &PasswordResetDocument{
			Token:  pr.Token,
			Expiry: pr.CreatedAt,
		}
	}

	return doc, uid
}

func (d *UserDocument) Model() (*user.User, error) {
	if d == nil {
		return nil, nil
	}

	uid, err := id.UserIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	wid, err := id.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	builder := user.New().
		ID(uid).
		Name(d.Name).
		Email(d.Email).
		Workspace(wid)

	// Convert auths
	if len(d.Auths) > 0 {
		auths := make([]user.Auth, 0, len(d.Auths))
		for _, auth := range d.Auths {
			auths = append(auths, user.Auth{
				Provider: auth.Provider,
				Sub:      auth.Sub,
			})
		}
		builder = builder.Auths(auths)
	}

	// Convert metadata
	if d.Metadata != nil {
		md := user.Metadata{}
		md.SetPhotoURL(d.Metadata.PhotoURL)
		md.SetDescription(d.Metadata.Description)
		md.SetWebsite(d.Metadata.Website)
		md.LangFrom(d.Metadata.Lang)
		md.SetTheme(user.Theme(d.Metadata.Theme))
		builder = builder.Metadata(md)
	}

	// Convert verification
	if d.Verification != nil {
		v := user.VerificationFrom(d.Verification.Code, d.Verification.Expiry, d.Verification.Verified)
		builder = builder.Verification(v)
	}

	// Convert password reset
	if d.PasswordReset != nil {
		pr := user.PasswordResetFrom(d.PasswordReset.Token, d.PasswordReset.Expiry)
		builder = builder.PasswordReset(pr)
	}

	return builder.Build()
}
