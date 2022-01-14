package project

import (
	"errors"
	"net/url"
	"reflect"
	"testing"
	"time"

	"github.com/reearth/reearth-backend/pkg/visualizer"
	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	var tb = New()
	assert.NotNil(t, tb)
}

func TestBuilder_ID(t *testing.T) {
	var tb = New()
	res := tb.ID(NewID()).MustBuild()
	assert.NotNil(t, res.ID())
}

func TestBuilder_Name(t *testing.T) {
	var tb = New().NewID()
	res := tb.Name("foo").MustBuild()
	assert.Equal(t, "foo", res.Name())
}

func TestBuilder_NewID(t *testing.T) {
	var tb = New()
	res := tb.NewID().MustBuild()
	assert.NotNil(t, res.ID())
}

func TestBuilder_Alias(t *testing.T) {
	var tb = New().NewID()
	res := tb.Alias("xxxxx").MustBuild()
	assert.Equal(t, "xxxxx", res.Alias())
}

func TestBuilder_Description(t *testing.T) {
	var tb = New().NewID()
	res := tb.Description("desc").MustBuild()
	assert.Equal(t, "desc", res.Description())
}

func TestBuilder_IsArchived(t *testing.T) {
	var tb = New().NewID()
	res := tb.IsArchived(true).MustBuild()
	assert.True(t, res.IsArchived())
}

func TestBuilder_BasicAuthUsername(t *testing.T) {
	var tb = New().NewID()
	res := tb.BasicAuthUsername("username").MustBuild()
	assert.Equal(t, "username", res.BasicAuthUsername())
}
func TestBuilder_BasicAuthPassword(t *testing.T) {
	var tb = New().NewID()
	res := tb.BasicAuthPassword("password").MustBuild()
	assert.Equal(t, "password", res.BasicAuthPassword())
}

func TestBuilder_ImageURL(t *testing.T) {
	testCases := []struct {
		name        string
		image       *url.URL
		expectedNil bool
	}{
		{
			name:        "image not nil",
			image:       &url.URL{},
			expectedNil: false,
		},
		{
			name:        "image is nil",
			image:       nil,
			expectedNil: true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tb := New().NewID()
			res := tb.ImageURL(tc.image).MustBuild()
			if res.imageURL == nil {
				assert.True(tt, tc.expectedNil)
			} else {
				assert.False(tt, tc.expectedNil)
			}
		})
	}
}

func TestBuilder_Visualizer(t *testing.T) {
	var tb = New().NewID()
	res := tb.Visualizer(visualizer.VisualizerCesium).MustBuild()
	assert.Equal(t, visualizer.VisualizerCesium, res.Visualizer())
}

func TestBuilder_Team(t *testing.T) {
	var tb = New().NewID()
	res := tb.Team(NewTeamID()).MustBuild()
	assert.NotNil(t, res.Team())
}

func TestBuilder_PublicImage(t *testing.T) {
	var tb = New().NewID()
	res := tb.PublicImage("xxxxx").MustBuild()
	assert.Equal(t, "xxxxx", res.PublicImage())
}

func TestBuilder_PublishedAt(t *testing.T) {
	var tb = New().NewID()
	d := time.Date(1986, 12, 11, 19, 30, 0, 0, time.UTC)
	res := tb.PublishedAt(d).MustBuild()
	assert.True(t, reflect.DeepEqual(res.PublishedAt(), d))
}

func TestBuilder_UpdatedAt(t *testing.T) {
	var tb = New().NewID()
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)
	res := tb.UpdatedAt(d).MustBuild()
	assert.True(t, reflect.DeepEqual(res.UpdatedAt(), d))
}

func TestBuilder_PublicTitle(t *testing.T) {
	var tb = New().NewID()
	res := tb.PublicTitle("xxx.aaa").MustBuild()
	assert.Equal(t, "xxx.aaa", res.PublicTitle())
}

func TestBuilder_PublishmentStatus(t *testing.T) {
	var tb = New().NewID()
	var x PublishmentStatus = "xxx.aaa"
	res := tb.PublishmentStatus("xxx.aaa").MustBuild()
	assert.Equal(t, x, res.PublishmentStatus())
}

func TestBuilder_PublicDescription(t *testing.T) {
	var tb = New().NewID()
	res := tb.PublicDescription("pdesc").MustBuild()
	assert.Equal(t, "pdesc", res.PublicDescription())
}

func TestBuilder_PublicNoIndex(t *testing.T) {
	var tb = New().NewID()
	res := tb.PublicNoIndex(true).MustBuild()
	assert.Equal(t, true, res.PublicNoIndex())
}

func TestBuilder_Build(t *testing.T) {
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)
	i, _ := url.Parse("ttt://xxx.aa/")
	pid := NewID()
	tid := NewTeamID()
	testCases := []struct {
		name, pname, description,
		alias, publicTitle, publicDescription,
		publicImage string
		id                ID
		isArchived        bool
		updatedAt         time.Time
		publishedAt       time.Time
		imageURL          *url.URL
		publicNoIndex     bool
		team              TeamID
		visualizer        visualizer.Visualizer
		publishmentStatus PublishmentStatus
		expected          *Project
		err               error
	}{
		{
			name:              "build normal project",
			pname:             "xxx.aaa",
			description:       "ddd",
			alias:             "aaaaa",
			publicTitle:       "ttt",
			publicDescription: "dddd",
			publicImage:       "iii",
			id:                pid,
			isArchived:        false,
			updatedAt:         d,
			publishedAt:       d,
			imageURL:          i,
			publicNoIndex:     true,
			team:              tid,
			visualizer:        visualizer.VisualizerCesium,
			publishmentStatus: "ppp",
			expected: &Project{
				id:                pid,
				description:       "ddd",
				name:              "xxx.aaa",
				alias:             "aaaaa",
				publicTitle:       "ttt",
				publicDescription: "dddd",
				publicImage:       "iii",
				isArchived:        false,
				updatedAt:         d,
				publishedAt:       d,
				imageURL:          i,
				publicNoIndex:     true,
				team:              tid,
				visualizer:        visualizer.VisualizerCesium,
				publishmentStatus: "ppp",
			},
			err: nil,
		},
		{
			name:      "zero updated at",
			id:        NewID(),
			updatedAt: time.Time{},
			expected:  nil,
			err:       nil,
		},
		{
			name: "failed invalid id",

			expected: nil,
			err:      ErrInvalidID,
		},
		{
			name:     "failed invalid alias",
			id:       NewID(),
			alias:    "xxx.aaa",
			expected: nil,
			err:      ErrInvalidAlias,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			p, err := New().
				ID(tc.id).
				PublicNoIndex(tc.publicNoIndex).
				PublicDescription(tc.publicDescription).
				PublishmentStatus(tc.publishmentStatus).
				PublicTitle(tc.publicTitle).
				UpdatedAt(tc.updatedAt).
				PublishedAt(tc.publishedAt).
				PublicImage(tc.publicImage).
				Team(tc.team).
				ImageURL(tc.imageURL).
				Name(tc.pname).
				Alias(tc.alias).
				Visualizer(tc.visualizer).
				UpdatedAt(tc.updatedAt).
				Description(tc.description).
				Build()
			if err == nil {
				if tc.expected == nil {
					assert.Equal(tt, p.UpdatedAt(), p.CreatedAt())

				} else {
					assert.Equal(tt, tc.expected, p)
				}
			} else {
				assert.True(tt, errors.As(err, &tc.err))
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)
	i, _ := url.Parse("ttt://xxx.aa/")
	pid := NewID()
	tid := NewTeamID()
	testCases := []struct {
		name, pname, description,
		alias, publicTitle, publicDescription,
		publicImage string
		id                ID
		isArchived        bool
		updatedAt         time.Time
		publishedAt       time.Time
		imageURL          *url.URL
		publicNoIndex     bool
		team              TeamID
		visualizer        visualizer.Visualizer
		publishmentStatus PublishmentStatus
		expected          *Project
		err               error
	}{
		{
			name:              "build normal project",
			pname:             "xxx.aaa",
			description:       "ddd",
			alias:             "aaaaa",
			publicTitle:       "ttt",
			publicDescription: "dddd",
			publicImage:       "iii",
			id:                pid,
			isArchived:        false,
			updatedAt:         d,
			publishedAt:       d,
			imageURL:          i,
			publicNoIndex:     true,
			team:              tid,
			visualizer:        visualizer.VisualizerCesium,
			publishmentStatus: "ppp",
			expected: &Project{
				id:                pid,
				description:       "ddd",
				name:              "xxx.aaa",
				alias:             "aaaaa",
				publicTitle:       "ttt",
				publicDescription: "dddd",
				publicImage:       "iii",
				isArchived:        false,
				updatedAt:         d,
				publishedAt:       d,
				imageURL:          i,
				publicNoIndex:     true,
				team:              tid,
				visualizer:        visualizer.VisualizerCesium,
				publishmentStatus: "ppp",
			},
			err: nil,
		},
		{
			name:      "zero updated at",
			id:        NewID(),
			updatedAt: time.Time{},
			expected:  nil,
			err:       nil,
		},
		{
			name: "failed invalid id",

			expected: nil,
			err:      ErrInvalidID,
		},
		{
			name:     "failed invalid alias",
			id:       NewID(),
			alias:    "xxx.aaa",
			expected: nil,
			err:      ErrInvalidAlias,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			var p *Project
			defer func() {
				if r := recover(); r == nil {
					if tc.expected == nil {
						assert.Equal(tt, p.UpdatedAt(), p.CreatedAt())
					} else {
						assert.Equal(tt, tc.expected, p)
					}
				}
			}()
			p = New().
				ID(tc.id).
				PublicNoIndex(tc.publicNoIndex).
				PublicDescription(tc.publicDescription).
				PublishmentStatus(tc.publishmentStatus).
				PublicTitle(tc.publicTitle).
				UpdatedAt(tc.updatedAt).
				PublishedAt(tc.publishedAt).
				PublicImage(tc.publicImage).
				Team(tc.team).
				ImageURL(tc.imageURL).
				Name(tc.pname).
				Alias(tc.alias).
				Visualizer(tc.visualizer).
				UpdatedAt(tc.updatedAt).
				Description(tc.description).
				MustBuild()
		})
	}
}
