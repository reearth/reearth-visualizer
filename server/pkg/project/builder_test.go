package project

import (
	"net/url"
	"reflect"
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
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

func TestBuilder_Experimental(t *testing.T) {
	var tb = New().NewID()
	res := tb.CoreSupport(true).MustBuild()
	assert.True(t, res.CoreSupport())
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
	tests := []struct {
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

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tb := New().NewID()
			res := tb.ImageURL(tt.image).MustBuild()
			if res.imageURL == nil {
				assert.True(t, tt.expectedNil)
			} else {
				assert.False(t, tt.expectedNil)
			}
		})
	}
}

func TestBuilder_Visualizer(t *testing.T) {
	var tb = New().NewID()
	res := tb.Visualizer(visualizer.VisualizerCesium).MustBuild()
	assert.Equal(t, visualizer.VisualizerCesium, res.Visualizer())
}

func TestBuilder_Workspace(t *testing.T) {
	var tb = New().NewID()
	res := tb.Workspace(accountdomain.NewWorkspaceID()).MustBuild()
	assert.NotNil(t, res.Workspace())
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
	tid := accountdomain.NewWorkspaceID()

	type args struct {
		name, description  string
		alias, publicTitle string
		publicDescription  string
		publicImage        string
		id                 ID
		isArchived         bool
		updatedAt          time.Time
		publishedAt        time.Time
		imageURL           *url.URL
		publicNoIndex      bool
		workspace          WorkspaceID
		visualizer         visualizer.Visualizer
		publishmentStatus  PublishmentStatus
	}

	tests := []struct {
		name     string
		args     args
		expected *Project
		err      error
	}{
		{
			name: "build normal project",
			args: args{
				name:              "xxx.aaa",
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
				workspace:         tid,
				visualizer:        visualizer.VisualizerCesium,
				publishmentStatus: "ppp",
			},
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
				workspace:         tid,
				visualizer:        visualizer.VisualizerCesium,
				publishmentStatus: "ppp",
			},
		},
		{
			name: "zero updated at",
			args: args{
				id: pid,
			},
			expected: &Project{
				id:        pid,
				updatedAt: pid.Timestamp(),
			},
		},
		{
			name: "failed invalid id",
			err:  ErrInvalidID,
		},
		{
			name: "failed invalid alias",
			args: args{
				id:    NewID(),
				alias: "xxx.aaa",
			},
			expected: nil,
			err:      ErrInvalidAlias,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p, err := New().
				ID(tt.args.id).
				PublicNoIndex(tt.args.publicNoIndex).
				PublicDescription(tt.args.publicDescription).
				PublishmentStatus(tt.args.publishmentStatus).
				PublicTitle(tt.args.publicTitle).
				UpdatedAt(tt.args.updatedAt).
				PublishedAt(tt.args.publishedAt).
				PublicImage(tt.args.publicImage).
				Workspace(tt.args.workspace).
				ImageURL(tt.args.imageURL).
				Name(tt.args.name).
				Alias(tt.args.alias).
				Visualizer(tt.args.visualizer).
				UpdatedAt(tt.args.updatedAt).
				Description(tt.args.description).
				Build()

			if tt.err == nil {
				assert.Equal(t, tt.expected, p)
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)
	i, _ := url.Parse("ttt://xxx.aa/")
	pid := NewID()
	tid := accountdomain.NewWorkspaceID()

	type args struct {
		name, description  string
		alias, publicTitle string
		publicDescription  string
		publicImage        string
		id                 ID
		isArchived         bool
		updatedAt          time.Time
		publishedAt        time.Time
		imageURL           *url.URL
		publicNoIndex      bool
		workspace          WorkspaceID
		visualizer         visualizer.Visualizer
		publishmentStatus  PublishmentStatus
		trackingId         string
		enableGa           bool
	}

	tests := []struct {
		name     string
		args     args
		expected *Project
		err      error
	}{
		{
			name: "build normal project",
			args: args{
				name:              "xxx.aaa",
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
				workspace:         tid,
				visualizer:        visualizer.VisualizerCesium,
				publishmentStatus: "ppp",
				trackingId:        "dfdfdfd",
				enableGa:          true,
			},
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
				workspace:         tid,
				visualizer:        visualizer.VisualizerCesium,
				publishmentStatus: "ppp",
				trackingId:        "dfdfdfd",
				enableGa:          true,
			},
		},
		{
			name: "zero updated at",
			args: args{
				id: pid,
			},
			expected: &Project{
				id:        pid,
				updatedAt: pid.Timestamp(),
			},
		},
		{
			name: "failed invalid id",
			err:  ErrInvalidID,
		},
		{
			name: "failed invalid alias",
			args: args{
				id:    NewID(),
				alias: "xxx.aaa",
			},
			err: ErrInvalidAlias,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			build := func() *Project {
				t.Helper()
				return New().
					ID(tt.args.id).
					PublicNoIndex(tt.args.publicNoIndex).
					PublicDescription(tt.args.publicDescription).
					PublishmentStatus(tt.args.publishmentStatus).
					PublicTitle(tt.args.publicTitle).
					UpdatedAt(tt.args.updatedAt).
					PublishedAt(tt.args.publishedAt).
					PublicImage(tt.args.publicImage).
					Workspace(tt.args.workspace).
					ImageURL(tt.args.imageURL).
					Name(tt.args.name).
					Alias(tt.args.alias).
					Visualizer(tt.args.visualizer).
					UpdatedAt(tt.args.updatedAt).
					Description(tt.args.description).
					EnableGA(tt.args.enableGa).
					TrackingID(tt.args.trackingId).
					MustBuild()
			}

			if tt.err != nil {
				assert.PanicsWithValue(t, tt.err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.expected, build())
			}
		})
	}
}
