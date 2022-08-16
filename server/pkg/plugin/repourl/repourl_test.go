package repourl

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

var cases = []struct {
	Name     string
	Input    string
	Expected *URL
	Err      error
}{
	{
		Name:  "github.com/aaaa/bbbb",
		Input: "https://github.com/aaaa/bbbb",
		Expected: &URL{
			Host:  "github.com",
			Owner: "aaaa",
			Repo:  "bbbb",
		},
	},
	{
		Name:  "github.com/aaaa/bbbb.git",
		Input: "https://github.com/aaaa/bbbb.git",
		Expected: &URL{
			Host:  "github.com",
			Owner: "aaaa",
			Repo:  "bbbb",
		},
	},
	{
		Name:  "github.com/aaaa/bbbb/tree/cccc",
		Input: "https://github.com/aaaa/bbbb/tree/cccc",
		Expected: &URL{
			Host:  "github.com",
			Owner: "aaaa",
			Repo:  "bbbb",
			Ref:   "heads/cccc",
		},
	},
	{
		Name:  "github.com/aaaa/bbbb/tree/cccc/dddd",
		Input: "https://github.com/aaaa/bbbb/tree/cccc/dddd",
		Expected: &URL{
			Host:  "github.com",
			Owner: "aaaa",
			Repo:  "bbbb",
			Ref:   "heads/cccc",
		},
	},
	{
		Name:  "github.com/aaaa/bbbb/archive/cccc.zip",
		Input: "https://github.com/aaaa/bbbb/archive/cccc.zip",
		Expected: &URL{
			Host:  "github.com",
			Owner: "aaaa",
			Repo:  "bbbb",
			Ref:   "cccc",
		},
	},
	{
		Name:  "github.com/aaaa/bbbb/archive/refs/heads/cccc.zip",
		Input: "https://github.com/aaaa/bbbb/archive/refs/heads/cccc.zip",
		Expected: &URL{
			Host:  "github.com",
			Owner: "aaaa",
			Repo:  "bbbb",
			Ref:   "heads/cccc",
		},
	},
	{
		Name:  "github.com/aaaa/bbbb/archive/refs/tags/cccc.zip",
		Input: "https://github.com/aaaa/bbbb/archive/refs/tags/cccc.zip",
		Expected: &URL{
			Host:  "github.com",
			Owner: "aaaa",
			Repo:  "bbbb",
			Ref:   "tags/cccc",
		},
	},
	{
		Name:  "nil",
		Input: "",
		Err:   ErrInvalidURL,
	},
	{
		Name:  "cannot parsed URL",
		Input: "",
		Err:   ErrInvalidURL,
	},
	{
		Name:  "invalid URL",
		Input: "https://github.com/bbb",
		Err:   ErrInvalidURL,
	},
	{
		Name:  "unsupported host",
		Input: "https://aaaa.com/xxx",
		Err:   ErrUnsupportedHost,
	},
}

func TestNew(t *testing.T) {
	// nil
	u, err := New(nil)
	assert.NoError(t, err)
	assert.Nil(t, u)

	for _, tc := range cases {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			ur, _ := url.Parse(tc.Input)
			u, err := New(ur)
			if tc.Err != nil {
				assert.ErrorIs(t, err, tc.Err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.Expected, u)
			}
		})
	}
}

func TestMust(t *testing.T) {
	for _, tc := range cases {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			ur, _ := url.Parse(tc.Input)
			if tc.Err != nil {
				assert.PanicsWithError(t, tc.Err.Error(), func() {
					_ = Must(ur)
				})
			} else {
				assert.Equal(t, tc.Expected, Must(ur))
			}
		})
	}
}

func TestParse(t *testing.T) {
	for _, tc := range cases {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			u, err := Parse(tc.Input)
			if tc.Err != nil {
				assert.ErrorIs(t, err, tc.Err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.Expected, u)
			}
		})
	}
}

func TestMustParse(t *testing.T) {
	for _, tc := range cases {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			if tc.Err != nil {
				assert.PanicsWithError(t, tc.Err.Error(), func() {
					_ = MustParse(tc.Input)
				})
			} else {
				assert.Equal(t, tc.Expected, MustParse(tc.Input))
			}
		})
	}
}

func TestURL_String(t *testing.T) {
	assert.Equal(t, "", (*URL)(nil).String())
	assert.Equal(t, "", (&URL{}).String())
	assert.Equal(t, "", (&URL{Host: "github.com"}).String())
	assert.Equal(t, "", (&URL{Host: "github.com", Owner: "aaa"}).String())
	assert.Equal(t, "", (&URL{Host: "github.com", Repo: "bbb"}).String())
	assert.Equal(t, "github.com/aaa/bbb", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
	}).String())
	assert.Equal(t, "github.com/aaa/bbb/ccc", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "ccc",
	}).String())
}

func TestURL_Head(t *testing.T) {
	assert.Equal(t, "", (*URL)(nil).Head())
	assert.Equal(t, "", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "",
	}).Head())
	assert.Equal(t, "", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "ccc",
	}).Head())
	assert.Equal(t, "ccc", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "heads/ccc",
	}).Head())
}

func TestURL_Tag(t *testing.T) {
	assert.Equal(t, "", (*URL)(nil).Tag())
	assert.Equal(t, "", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "",
	}).Tag())
	assert.Equal(t, "", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "ccc",
	}).Tag())
	assert.Equal(t, "ccc", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "tags/ccc",
	}).Tag())
}

func TestURL_Commit(t *testing.T) {
	assert.Equal(t, "", (*URL)(nil).Commit())
	assert.Equal(t, "", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "",
	}).Commit())
	assert.Equal(t, "ccc", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "ccc",
	}).Commit())
	assert.Equal(t, "", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "heads/ccc",
	}).Commit())
	assert.Equal(t, "", (&URL{
		Host:  "github.com",
		Owner: "aaa",
		Repo:  "bbb",
		Ref:   "tags/ccc",
	}).Commit())
}

func TestURL_ArchiveURL(t *testing.T) {
	cases := []struct {
		Name     string
		Input    *URL
		Expected string
	}{
		{
			Name:     "github.com/aaaa/bbbb",
			Input:    &URL{Host: "github.com", Owner: "aaaa", Repo: "bbbb", Ref: ""},
			Expected: "https://github.com/aaaa/bbbb/archive/refs/heads/main.zip",
		},
		{
			Name:     "github.com/aaaa/ccc",
			Input:    &URL{Host: "github.com", Owner: "aaaa", Repo: "bbbb", Ref: "ccc"},
			Expected: "https://github.com/aaaa/bbbb/archive/ccc.zip",
		},
		{
			Name:     "github.com/aaaa/bbbb/heads/cccc",
			Input:    &URL{Host: "github.com", Owner: "aaaa", Repo: "bbbb", Ref: "heads/ccc"},
			Expected: "https://github.com/aaaa/bbbb/archive/refs/heads/ccc.zip",
		},
		{
			Name:     "github.com/aaaa/bbbb/tags/ccc",
			Input:    &URL{Host: "github.com", Owner: "aaaa", Repo: "bbbb", Ref: "tags/ccc"},
			Expected: "https://github.com/aaaa/bbbb/archive/refs/tags/ccc.zip",
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.Expected, tt.Input.ArchiveURL().String())
		})
	}
}
