package asset

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestAsset(t *testing.T) {
	aid := NewID()
	tid := NewTeamID()
	d := aid.Timestamp()

	tests := []struct {
		Name     string
		Expected struct {
			ID          ID
			CreatedAt   time.Time
			Team        TeamID
			Name        string
			Size        int64
			Url         string
			ContentType string
		}
		Actual *Asset
	}{
		{
			Expected: struct {
				ID          ID
				CreatedAt   time.Time
				Team        TeamID
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

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected.ID, tc.Actual.ID())
			assert.Equal(t, tc.Expected.CreatedAt, tc.Actual.CreatedAt())
			assert.Equal(t, tc.Expected.Team, tc.Actual.Team())
			assert.Equal(t, tc.Expected.Url, tc.Actual.URL())
			assert.Equal(t, tc.Expected.Size, tc.Actual.Size())
			assert.Equal(t, tc.Expected.Name, tc.Actual.Name())
			assert.Equal(t, tc.Expected.ContentType, tc.Actual.ContentType())
		})
	}
}
