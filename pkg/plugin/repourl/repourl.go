package repourl

import (
	"errors"
	"net/url"
	"strings"
)

// URL is a URL of specific Git repository on well-known hosting services.
type URL struct {
	Host  string
	Owner string
	Repo  string
	// Ref represents ref of Git. There are 3 patterns: commit hash, "heads/BRANCH", and "tags/TAG".
	Ref string
}

var (
	ErrInvalidURL      = errors.New("invalid repository url")
	ErrUnsupportedHost = errors.New("unsupported host")
)

func New(u *url.URL) (*URL, error) {
	if u == nil {
		return nil, nil
	}

	h := u.Host
	p := strings.TrimPrefix(u.Path, "/")
	if u.Scheme == "" {
		// github.com/aaa/bbb
		s := strings.SplitN(u.Path, "/", 2)
		if len(p) < 2 {
			return nil, ErrInvalidURL
		}
		h = s[0]
		p = s[1]
	} else if u.Scheme != "http" && u.Scheme != "https" {
		return nil, ErrInvalidURL
	}

	var r *URL
	if f := repos[h]; f != nil {
		r = f(p)
	} else {
		return nil, ErrUnsupportedHost
	}

	if r == nil {
		return nil, ErrInvalidURL
	}
	return r, nil
}

func Must(u *url.URL) *URL {
	u2, err := New(u)
	if err != nil {
		panic(err)
	}
	return u2
}

func Parse(s string) (*URL, error) {
	u, err := url.Parse(s)
	if err != nil {
		return nil, ErrInvalidURL
	}
	return New(u)
}

func MustParse(s string) *URL {
	u, err := Parse(s)
	if err != nil {
		panic(err)
	}
	return u
}

func (u *URL) String() string {
	if u == nil || u.Host == "" || u.Owner == "" || u.Repo == "" {
		return ""
	}
	sb := strings.Builder{}
	sb.WriteString(u.Host)
	sb.WriteRune('/')
	sb.WriteString(u.Owner)
	sb.WriteRune('/')
	sb.WriteString(u.Repo)
	if u.Ref != "" {
		sb.WriteRune('/')
		sb.WriteString(u.Ref)
	}
	return sb.String()
}

func (u *URL) Head() string {
	if u == nil || u.Ref == "" {
		return ""
	}
	h := strings.TrimPrefix(u.Ref, "heads/")
	if len(h) == len(u.Ref) {
		return "" // ref is not a head
	}
	return h
}

func (u *URL) Tag() string {
	if u == nil || u.Ref == "" {
		return ""
	}
	h := strings.TrimPrefix(u.Ref, "tags/")
	if len(h) == len(u.Ref) {
		return "" // ref is not a tag
	}
	return h
}

func (u *URL) Commit() string {
	if u == nil || u.Ref == "" || strings.Contains(u.Ref, "/") {
		return ""
	}
	return u.Ref
}

func (u *URL) ArchiveURL() *url.URL {
	if u == nil {
		return nil
	}

	f := reposArchive[u.Host]
	if f == nil {
		return nil
	}

	return f(u)
}
