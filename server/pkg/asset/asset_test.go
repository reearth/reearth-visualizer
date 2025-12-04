package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/id"

	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestAsset(t *testing.T) {
	aid := id.NewAssetID()
	tid := accountsID.NewWorkspaceID()
	d := aid.Timestamp()

	tests := []struct {
		Name     string
		Expected struct {
			ID          id.AssetID
			CreatedAt   time.Time
			Workspace   accountsID.WorkspaceID
			Name        string
			Size        int64
			URL         string
			ContentType string
			CoreSupport bool
		}
		Actual *Asset
	}{
		{
			Expected: struct {
				ID          id.AssetID
				CreatedAt   time.Time
				Workspace   accountsID.WorkspaceID
				Name        string
				Size        int64
				URL         string
				ContentType string
				CoreSupport bool
			}{
				ID:          aid,
				CreatedAt:   d,
				Workspace:   tid,
				Size:        10,
				URL:         "tt://xxx.xx",
				Name:        "xxx",
				ContentType: "test",
				CoreSupport: true,
			},
			Actual: New().
				ID(aid).
				CreatedAt(d).
				ContentType("test").
				Workspace(tid).
				Size(10).
				Name("xxx").
				URL("tt://xxx.xx").
				CoreSupport(true).
				MustBuild(),
		},
	}

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected.ID, tc.Actual.ID())
			assert.Equal(t, tc.Expected.CreatedAt, tc.Actual.CreatedAt())
			assert.Equal(t, tc.Expected.Workspace, tc.Actual.Workspace())
			assert.Equal(t, tc.Expected.URL, tc.Actual.URL())
			assert.Equal(t, tc.Expected.Size, tc.Actual.Size())
			assert.Equal(t, tc.Expected.Name, tc.Actual.Name())
			assert.Equal(t, tc.Expected.ContentType, tc.Actual.ContentType())
			assert.Equal(t, tc.Expected.CoreSupport, tc.Actual.CoreSupport())
		})
	}
}
