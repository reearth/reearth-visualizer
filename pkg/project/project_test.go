package project

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth-backend/pkg/visualizer"
	"github.com/stretchr/testify/assert"
)

func TestCheckAliasPattern(t *testing.T) {
	testCase := []struct {
		name, alias string
		expexted    bool
	}{
		{
			name:     "accepted regex",
			alias:    "xxxxx",
			expexted: true,
		},
		{
			name:     "refused regex",
			alias:    "xxx",
			expexted: false,
		},
	}
	for _, tc := range testCase {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expexted, CheckAliasPattern(tc.alias))
		})
	}
}

func TestProject_MatchWithPublicName(t *testing.T) {
	testCase := []struct {
		name, n  string
		p        *Project
		expexted bool
	}{
		{
			name: "alias = name, publishmentStatus = public",
			n:    "aaaaa",
			p: &Project{
				publishmentStatus: PublishmentStatusPublic,
				alias:             "aaaaa",
			},
			expexted: true,
		},
		{
			name:     "nil project",
			n:        "xx",
			p:        nil,
			expexted: false,
		},
		{
			name: "nil project",
			n:    "",
			p: &Project{
				publishmentStatus: PublishmentStatusPublic,
				alias:             "aaaaa",
			},
			expexted: false,
		},
		{
			name: "nil project",
			n:    "aaaaa",
			p: &Project{
				publishmentStatus: PublishmentStatusPrivate,
				alias:             "aaaaa",
			},
			expexted: false,
		},
	}
	for _, tc := range testCase {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expexted, tc.p.MatchWithPublicName(tc.n))
		})
	}
}

func TestProject_SetArchived(t *testing.T) {
	p := &Project{isArchived: false}
	p.SetArchived(true)
	assert.Equal(t, true, p.IsArchived())
}

func TestProject_SetPublishedAt(t *testing.T) {
	p := &Project{}
	p.SetPublishedAt(time.Date(1900, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.Equal(t, time.Date(1900, 1, 1, 00, 00, 1, 1, time.UTC), p.publishedAt)
}

func TestProject_SetUpdatedAt(t *testing.T) {
	p := &Project{}
	p.SetUpdatedAt(time.Date(1900, 1, 1, 00, 00, 1, 1, time.UTC))
	assert.Equal(t, time.Date(1900, 1, 1, 00, 00, 1, 1, time.UTC), p.UpdatedAt())
}

func TestProject_SetImageURL(t *testing.T) {
	testCase := []struct {
		name        string
		image       *url.URL
		p           *Project
		expectedNil bool
	}{
		{
			name:        "nil image",
			image:       nil,
			p:           &Project{},
			expectedNil: true,
		},
		{
			name:        "set new image",
			image:       &url.URL{},
			p:           &Project{},
			expectedNil: false,
		},
	}
	for _, tc := range testCase {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.p.SetImageURL(tc.image)
			if tc.expectedNil {
				assert.Nil(tt, tc.p.ImageURL())
			} else {
				assert.NotNil(tt, tc.p.ImageURL())
			}
		})
	}
}

func TestProject_UpdateName(t *testing.T) {
	p := &Project{}
	p.UpdateName("foo")
	assert.Equal(t, "foo", p.Name())
}

func TestProject_UpdateDescription(t *testing.T) {
	p := &Project{}
	p.UpdateDescription("aaa")
	assert.Equal(t, "aaa", p.Description())
}

func TestProject_UpdatePublishmentStatus(t *testing.T) {
	p := &Project{}
	p.UpdatePublishmentStatus(PublishmentStatusPrivate)
	assert.Equal(t, PublishmentStatusPrivate, p.PublishmentStatus())
}

func TestProject_UpdatePublicNoIndex(t *testing.T) {
	p := &Project{}
	p.UpdatePublicNoIndex(true)
	assert.Equal(t, true, p.PublicNoIndex())
}

func TestProject_UpdatePublicDescription(t *testing.T) {
	p := &Project{}
	p.UpdatePublicDescription("ppp")
	assert.Equal(t, "ppp", p.PublicDescription())
}

func TestProject_UpdatePublicTitle(t *testing.T) {
	p := &Project{}
	p.UpdatePublicTitle("ttt")
	assert.Equal(t, "ttt", p.PublicTitle())
}

func TestProject_UpdateTeam(t *testing.T) {
	p := &Project{}
	p.UpdateTeam(NewTeamID())
	assert.NotNil(t, p.Team())
}

func TestProject_UpdateVisualizer(t *testing.T) {
	p := &Project{}
	var v visualizer.Visualizer = "ttt"
	p.UpdateVisualizer(v)
	assert.Equal(t, v, p.Visualizer())
}

func TestProject_UpdateAlias(t *testing.T) {
	testCases := []struct {
		name, a  string
		expected string
		err      error
	}{
		{
			name:     "accepted alias",
			a:        "xxxxx",
			expected: "xxxxx",
			err:      nil,
		},
		{
			name:     "fail: invalid alias",
			a:        "xxx",
			expected: "",
			err:      ErrInvalidAlias,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			p := &Project{}
			err := p.UpdateAlias(tc.a)
			if err == nil {
				assert.Equal(tt, tc.expected, p.Alias())
			} else {
				assert.Equal(tt, tc.err, err)
			}
		})
	}
}

func TestProject_UpdatePublicImage(t *testing.T) {
	p := &Project{}
	p.UpdatePublicImage("xxx")
	assert.Equal(t, "xxx", p.PublicImage())
}

func TestProject_PublicName(t *testing.T) {
	testCases := []struct {
		name     string
		p        *Project
		expected string
	}{
		{
			name: "private publishment status",
			p: &Project{
				publishmentStatus: PublishmentStatusLimited,
				alias:             "aaaaa",
			},
			expected: "aaaaa",
		},
		{
			name: "not private nor limited publishment status",
			p: &Project{
				alias: "aaaaa",
			},
			expected: "aaaaa",
		},
		{
			name:     "nil project",
			p:        nil,
			expected: "",
		},
		{
			name: "private publishment status",
			p: &Project{
				publishmentStatus: PublishmentStatusPrivate,
			},
			expected: "",
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.p.PublicName()
			assert.Equal(tt, tc.expected, res)
		})
	}
}

func TestProject_IsBasicAuthActive(t *testing.T) {
	tests := []struct {
		name     string
		p        *Project
		expected bool
	}{
		{
			name: "basic auth is inactive",
			p: &Project{
				isBasicAuthActive: false,
			},
			expected: false,
		},
		{
			name: "basic auth is active",
			p: &Project{
				isBasicAuthActive: true,
			},
			expected: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.p.IsBasicAuthActive()
			assert.Equal(tt, tc.expected, res)
		})
	}
}

func TestProject_BasicAuthUsername(t *testing.T) {
	t.Run("return basic auth username", func(t *testing.T) {
		p := &Project{basicAuthUsername: "test1"}
		res := p.BasicAuthUsername()
		assert.Equal(t, "test1", res)
	})
}

func TestProject_BasicAuthPassword(t *testing.T) {
	t.Run("return basic auth password", func(t *testing.T) {
		p := &Project{basicAuthPassword: "password"}
		res := p.BasicAuthPassword()
		assert.Equal(t, "password", res)
	})
}

func TestProject_SetIsBasicAuthActive(t *testing.T) {
	p := &Project{}
	p.SetIsBasicAuthActive(true)
	assert.Equal(t, true, p.isBasicAuthActive)
}

func TestProject_SetBasicAuthUsername(t *testing.T) {
	p := &Project{}
	p.SetBasicAuthUsername("username")
	assert.Equal(t, "username", p.basicAuthUsername)
}

func TestProject_SetBasicAuthPassword(t *testing.T) {
	p := &Project{}
	p.SetBasicAuthPassword("password")
	assert.Equal(t, "password", p.basicAuthPassword)
}
