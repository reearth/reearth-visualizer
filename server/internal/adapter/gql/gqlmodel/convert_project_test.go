package gqlmodel

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFromPublishmentStatus(t *testing.T) {
	tests := []struct {
		name string
		args PublishmentStatus
		want project.PublishmentStatus
	}{
		{
			name: "public",
			args: PublishmentStatusPublic,
			want: project.PublishmentStatusPublic,
		},
		{
			name: "private",
			args: PublishmentStatusPrivate,
			want: project.PublishmentStatusPrivate,
		},
		{
			name: "limited",
			args: PublishmentStatusLimited,
			want: project.PublishmentStatusLimited,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, FromPublishmentStatus(tt.args))
		})
	}
}

func TestToProject(t *testing.T) {
	pId := project.NewID()
	wsId := workspace.NewID()
	now := time.Now().Truncate(time.Millisecond)

	tests := []struct {
		name string
		args *project.Project
		want *Project
	}{
		{
			name: "nil",
			args: nil,
			want: nil,
		},
		{
			name: "normal",
			args: project.New().
				ID(pId).
				Workspace(wsId).
				Name("aaa").
				Description("bbb").
				ImageURL(lo.Must(url.Parse("https://example.com/hoge.gif"))).
				Alias("aliasalias").
				Visualizer(visualizer.VisualizerCesium).
				UpdatedAt(now).
				CoreSupport(false).
				MustBuild(),
			want: &Project{
				ID:                IDFrom(pId),
				IsArchived:        false,
				IsBasicAuthActive: false,
				BasicAuthUsername: "",
				BasicAuthPassword: "",
				CreatedAt:         pId.Timestamp(),
				UpdatedAt:         now,
				PublishedAt:       nil,
				Name:              "aaa",
				Description:       "bbb",
				Alias:             "aliasalias",
				PublicTitle:       "",
				PublicDescription: "",
				PublicImage:       "",
				PublicNoIndex:     false,
				ImageURL:          lo.Must(url.Parse("https://example.com/hoge.gif")),
				TeamID:            IDFrom(wsId),
				Visualizer:        Visualizer(visualizer.VisualizerCesium),
				PublishmentStatus: PublishmentStatusPrivate,
				Team:              nil,
				Scene:             nil,
				CoreSupport:       false,
				EnableGa:          false,
				TrackingID:        "",
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToProject(tt.args))
		})
	}
}

func TestToPublishmentStatus(t *testing.T) {
	tests := []struct {
		name string
		args project.PublishmentStatus
		want PublishmentStatus
	}{
		{
			name: "public",
			args: project.PublishmentStatusPublic,
			want: PublishmentStatusPublic,
		},
		{
			name: "private",
			args: project.PublishmentStatusPrivate,
			want: PublishmentStatusPrivate,
		},
		{
			name: "limited",
			args: project.PublishmentStatusLimited,
			want: PublishmentStatusLimited,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToPublishmentStatus(tt.args))
		})
	}
}
