package project

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
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

	for _, tt := range testCase {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expexted, CheckAliasPattern(tt.alias))
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

	for _, tt := range testCase {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expexted, tt.p.MatchWithPublicName(tt.n))
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

	for _, tt := range testCase {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.p.SetImageURL(tt.image)
			if tt.expectedNil {
				assert.Nil(t, tt.p.ImageURL())
			} else {
				assert.NotNil(t, tt.p.ImageURL())
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

func TestProject_UpdateWorkspace(t *testing.T) {
	p := &Project{}
	p.UpdateWorkspace(accountdomain.NewWorkspaceID())
	assert.NotNil(t, p.Workspace())
}

func TestProject_UpdateVisualizer(t *testing.T) {
	p := &Project{}
	var v visualizer.Visualizer = "ttt"
	p.UpdateVisualizer(v)
	assert.Equal(t, v, p.Visualizer())
}

func TestProject_UpdateAlias(t *testing.T) {
	tests := []struct {
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

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &Project{}
			err := p.UpdateAlias(tt.a)
			if tt.err == nil {
				assert.Equal(t, tt.expected, p.Alias())
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestProject_UpdateGAConfig(t *testing.T) {
	p := &Project{}
	p.UpdateEnableGA(true)
	p.UpdateTrackingID("xxx")
	assert.Equal(t, "xxx", p.TrackingID())
	assert.Equal(t, true, p.EnableGA())
}

func TestProject_UpdatePublicImage(t *testing.T) {
	p := &Project{}
	p.UpdatePublicImage("xxx")
	assert.Equal(t, "xxx", p.PublicImage())
}

func TestProject_PublicName(t *testing.T) {
	tests := []struct {
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

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.p.PublicName()
			assert.Equal(t, tt.expected, res)
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

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.p.IsBasicAuthActive()
			assert.Equal(t, tt.expected, res)
		})
	}
}

func TestProject_Experimental(t *testing.T) {
	tests := []struct {
		name     string
		p        *Project
		expected bool
	}{
		{
			name: "inactive",
			p: &Project{
				coreSupport: false,
			},
			expected: false,
		},
		{
			name: "active",
			p: &Project{
				coreSupport: true,
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.p.CoreSupport()
			assert.Equal(t, tt.expected, res)
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
