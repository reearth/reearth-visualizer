package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestAsset(t *testing.T) {
	aid := id.NewAssetID()
	tid := id.NewTeamID()
	d := id.ID(aid).Timestamp()
	testCases := []struct {
		Name     string
		Expected struct {
			ID          id.AssetID
			CreatedAt   time.Time
			Team        id.TeamID
			Name        string
			Size        int64
			Url         string
			ContentType string
		}
		Actual *Asset
	}{
		{
			Expected: struct {
				ID          id.AssetID
				CreatedAt   time.Time
				Team        id.TeamID
				Name        string
				Size        int64
				Url         string
				ContentType string
			}{
				ID:          aid,
				CreatedAt:   d,
				Team:        tid,
				Size:        10,
				Url:         "tt://xxx.xx",
				Name:        "xxx",
				ContentType: "test",
			},
			Actual: New().ID(aid).CreatedAt(d).ContentType("test").Team(tid).Size(10).Name("xxx").URL("tt://xxx.xx").MustBuild(),
		},
	}
	for _, tc := range testCases {
		tc := tc

		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected.ID, tc.Actual.ID())
			assert.Equal(tt, tc.Expected.CreatedAt, tc.Actual.CreatedAt())
			assert.Equal(tt, tc.Expected.Team, tc.Actual.Team())
			assert.Equal(tt, tc.Expected.Url, tc.Actual.URL())
			assert.Equal(tt, tc.Expected.Size, tc.Actual.Size())
			assert.Equal(tt, tc.Expected.Name, tc.Actual.Name())
			assert.Equal(tt, tc.Expected.ContentType, tc.Actual.ContentType())
		})
	}
}
