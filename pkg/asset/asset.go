package asset

import (
	"errors"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
)

var (
	// ErrEmptyTeamID _
	ErrEmptyTeamID = errors.New("require team id")
	// ErrEmptyURL _
	ErrEmptyURL = errors.New("require valid url")
	// ErrEmptySize _
	ErrEmptySize = errors.New("file size cannot be zero")
)

// Asset _
type Asset struct {
	id          id.AssetID
	createdAt   time.Time
	team        id.TeamID
	name        string // file name
	size        int64  // file size
	url         string
	contentType string
}

// ID _
func (a *Asset) ID() id.AssetID {
	return a.id
}

// Team _
func (a *Asset) Team() id.TeamID {
	return a.team
}

// Name _
func (a *Asset) Name() string {
	return a.name
}

// Size _
func (a *Asset) Size() int64 {
	return a.size
}

// URL _
func (a *Asset) URL() string {
	return a.url
}

// ContentType _
func (a *Asset) ContentType() string {
	return a.contentType
}

// CreatedAt _
func (a *Asset) CreatedAt() time.Time {
	if a == nil {
		return time.Time{}
	}
	return id.ID(a.id).Timestamp()
}
