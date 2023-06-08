package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_Build(t *testing.T) {
	aid := NewID()
	tid := accountdomain.NewWorkspaceID()
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)

	type args struct {
		id          ID
		name        string
		createdAt   time.Time
		workspace   WorkspaceID
		size        int64
		url         string
		contentType string
	}

	tests := []struct {
		name     string
		args     args
		expected *Asset
		err      error
	}{
		{
			name: "Valid asset",
			args: args{
				createdAt:   d,
				id:          aid,
				workspace:   tid,
				name:        "xxx",
				size:        10,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			expected: &Asset{
				id:          aid,
				createdAt:   d,
				workspace:   tid,
				size:        10,
				name:        "xxx",
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
		},
		{
			name: "failed empty size",
			args: args{
				id:          NewID(),
				createdAt:   d,
				workspace:   accountdomain.NewWorkspaceID(),
				size:        0,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			err: ErrEmptySize,
		},
		{
			name: "failed empty url",
			args: args{
				id:          NewID(),
				createdAt:   d,
				workspace:   accountdomain.NewWorkspaceID(),
				size:        10,
				url:         "",
				contentType: "bbb",
			},
			err: ErrEmptyURL,
		},
		{
			name: "failed empty workspace",
			args: args{
				id:          NewID(),
				createdAt:   d,
				workspace:   WorkspaceID{},
				size:        10,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			err: ErrEmptyWorkspaceID,
		},
		{
			name: "failed invalid Id",
			args: args{
				id:          ID{},
				createdAt:   d,
				workspace:   accountdomain.NewWorkspaceID(),
				size:        10,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			err: ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res, err := New().
				ID(tt.args.id).
				CreatedAt(tt.args.createdAt).
				Name(tt.args.name).
				Size(tt.args.size).
				Workspace(tt.args.workspace).
				ContentType(tt.args.contentType).
				URL(tt.args.url).
				Build()
			if tt.err == nil {
				assert.Equal(t, tt.expected, res)
				assert.Nil(t, err)
			} else {
				assert.Nil(t, res)
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	aid := NewID()
	tid := accountdomain.NewWorkspaceID()
	d := time.Date(1900, 1, 1, 00, 00, 0, 1, time.UTC)

	type args struct {
		id          ID
		name        string
		createdAt   time.Time
		workspace   WorkspaceID
		size        int64
		url         string
		contentType string
	}

	tests := []struct {
		name     string
		args     args
		expected *Asset
		err      error
	}{
		{
			name: "Valid asset",
			args: args{
				createdAt:   d,
				id:          aid,
				workspace:   tid,
				name:        "xxx",
				size:        10,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			expected: &Asset{
				id:          aid,
				createdAt:   d,
				workspace:   tid,
				size:        10,
				name:        "xxx",
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
		},
		{
			name: "failed empty size",
			args: args{
				createdAt:   d,
				id:          NewID(),
				workspace:   accountdomain.NewWorkspaceID(),
				size:        0,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			err: ErrEmptySize,
		},
		{
			name: "failed empty url",
			args: args{
				createdAt:   d,
				id:          NewID(),
				workspace:   accountdomain.NewWorkspaceID(),
				size:        10,
				url:         "",
				contentType: "bbb",
			},
			err: ErrEmptyURL,
		},
		{
			name: "failed empty workspace",
			args: args{
				createdAt:   d,
				id:          NewID(),
				workspace:   WorkspaceID{},
				size:        10,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			err: ErrEmptyWorkspaceID,
		},
		{
			name: "failed invalid Id",
			args: args{
				createdAt:   d,
				id:          ID{},
				workspace:   accountdomain.NewWorkspaceID(),
				size:        10,
				url:         "tt://xxx.zz",
				contentType: "bbb",
			},
			err: ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			build := func() *Asset {
				t.Helper()
				return New().
					ID(tt.args.id).
					CreatedAt(tt.args.createdAt).
					Name(tt.args.name).
					Size(tt.args.size).
					Workspace(tt.args.workspace).
					ContentType(tt.args.contentType).
					URL(tt.args.url).
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

func TestNewID(t *testing.T) {
	a := New().NewID().URL("tt://xxx.bb").Workspace(accountdomain.NewWorkspaceID()).Size(10).MustBuild()
	assert.False(t, a.id.IsNil())
}
