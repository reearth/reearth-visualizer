package asset

import (
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_Build(t *testing.T) {
	aid := id.NewAssetID()
	tid := id.NewTeamID()
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)
	testCases := []struct {
		Name, AssetName string
		Id              id.AssetID
		CreatedAt       time.Time
		Team            id.TeamID
		Size            int64
		Url             string
		ContentType     string
		ExpectedAssert  *Asset
		Err             error
	}{
		{
			Name:        "Valid asset",
			CreatedAt:   d,
			Id:          aid,
			Team:        tid,
			AssetName:   "xxx",
			Size:        10,
			Url:         "tt://xxx.zz",
			ContentType: "bbb",
			ExpectedAssert: &Asset{
				id:          aid,
				createdAt:   d,
				team:        tid,
				size:        10,
				name:        "xxx",
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			Err: nil,
		},
		{
			Name:           "failed empty size",
			Id:             id.NewAssetID(),
			CreatedAt:      d,
			Team:           id.NewTeamID(),
			Size:           0,
			Url:            "tt://xxx.zz",
			ContentType:    "bbb",
			ExpectedAssert: nil,
			Err:            ErrEmptySize,
		},
		{
			Name:           "failed empty url",
			Id:             id.NewAssetID(),
			CreatedAt:      d,
			Team:           id.NewTeamID(),
			Size:           10,
			Url:            "",
			ContentType:    "bbb",
			ExpectedAssert: nil,
			Err:            ErrEmptyURL,
		},
		{
			Name:           "failed empty team",
			Id:             id.NewAssetID(),
			CreatedAt:      d,
			Team:           id.TeamID{},
			Size:           10,
			Url:            "tt://xxx.zz",
			ContentType:    "bbb",
			ExpectedAssert: nil,
			Err:            ErrEmptyTeamID,
		},
		{
			Name:           "failed invalid Id",
			Id:             id.AssetID{},
			CreatedAt:      d,
			Team:           id.NewTeamID(),
			Size:           10,
			Url:            "tt://xxx.zz",
			ContentType:    "bbb",
			ExpectedAssert: nil,
			Err:            ErrEmptyTeamID,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			a, err := New().
				ID(tc.Id).
				CreatedAt(tc.CreatedAt).
				Name(tc.AssetName).
				Size(tc.Size).
				Team(tc.Team).
				ContentType(tc.ContentType).
				URL(tc.Url).
				Build()
			if err == nil {
				assert.Equal(tt, tc.ExpectedAssert, a)
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	aid := id.NewAssetID()
	tid := id.NewTeamID()
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)
	testCases := []struct {
		name, assetName string
		createdAt       time.Time
		id              id.AssetID
		team            id.TeamID
		size            int64
		url             string
		contentType     string
		expectedAssert  *Asset
		panic           bool
	}{
		{
			name:        "Valid asset",
			createdAt:   d,
			id:          aid,
			team:        tid,
			assetName:   "xxx",
			size:        10,
			url:         "tt://xxx.zz",
			contentType: "bbb",
			expectedAssert: &Asset{
				id:          aid,
				createdAt:   d,
				team:        tid,
				size:        10,
				name:        "xxx",
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			panic: false,
		},
		{
			name:           "failed empty size",
			createdAt:      d,
			id:             id.NewAssetID(),
			team:           id.NewTeamID(),
			size:           0,
			url:            "tt://xxx.zz",
			contentType:    "bbb",
			expectedAssert: nil,
			panic:          true,
		},
		{
			name:           "failed empty url",
			createdAt:      d,
			id:             id.NewAssetID(),
			team:           id.NewTeamID(),
			size:           10,
			url:            "",
			contentType:    "bbb",
			expectedAssert: nil,
			panic:          true,
		},
		{
			name:           "failed empty team",
			createdAt:      d,
			id:             id.NewAssetID(),
			team:           id.TeamID{},
			size:           10,
			url:            "tt://xxx.zz",
			contentType:    "bbb",
			expectedAssert: nil,
			panic:          true,
		},
		{
			name:           "failed invalid Id",
			createdAt:      d,
			id:             id.AssetID{},
			team:           id.NewTeamID(),
			size:           10,
			url:            "tt://xxx.zz",
			contentType:    "bbb",
			expectedAssert: nil,
			panic:          true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			var a *Asset
			if tc.panic {
				defer func() {
					if r := recover(); r != nil {
						assert.Nil(tt, a)
					}
				}()

				a = New().
					ID(tc.id).
					CreatedAt(tc.createdAt).
					Name(tc.assetName).
					Size(tc.size).
					Team(tc.team).
					ContentType(tc.contentType).
					URL(tc.url).
					MustBuild()
			} else {
				a = New().
					ID(tc.id).
					CreatedAt(tc.createdAt).
					Name(tc.assetName).
					Size(tc.size).
					Team(tc.team).
					ContentType(tc.contentType).
					URL(tc.url).
					MustBuild()
				assert.Equal(tt, tc.expectedAssert, a)

			}

		})
	}
}

func TestNewID(t *testing.T) {
	a := New().NewID().URL("tt://xxx.bb").Team(id.NewTeamID()).Size(10).MustBuild()
	assert.False(t, a.id.IsNil())
}
