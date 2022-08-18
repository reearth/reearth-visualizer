package workspace

import (
	"errors"

	"github.com/reearth/reearthx/util"
)

var ErrOperationDenied = errors.New("operation denied")

type Policy struct {
	opts PolicyOption
}

type PolicyOption struct {
	ID                    PolicyID
	MemberCount           *int
	PublishedProjectCount *int
	LayerCount            *int
	DatasetCount          *int
	AssetStorageSize      *int64
}

func NewPolicy(opts PolicyOption) *Policy {
	return &Policy{opts: opts.Clone()}
}

func (p *Policy) ID() PolicyID {
	return p.opts.ID
}

func (p *Policy) EnforceMemberCount(count int) error {
	return p.error(p == nil || p.opts.MemberCount == nil || *p.opts.MemberCount > count)
}

func (p *Policy) EnforcePublishedProjectCount(count int) error {
	return p.error(p == nil || p.opts.PublishedProjectCount == nil || *p.opts.PublishedProjectCount > count)
}

func (p *Policy) EnforceLayerCount(count int) error {
	return p.error(p == nil || p.opts.LayerCount == nil || *p.opts.LayerCount > count)
}

func (p *Policy) EnforceDatasetCount(count int) error {
	return p.error(p == nil || p.opts.DatasetCount == nil || *p.opts.DatasetCount > count)
}

func (p *Policy) EnforceAssetStorageSize(size int64) error {
	return p.error(p == nil || p.opts.AssetStorageSize == nil || *p.opts.AssetStorageSize > size)
}

func (*Policy) error(ok bool) error {
	if !ok {
		return ErrOperationDenied
	}
	return nil
}

func (p *Policy) Clone() *Policy {
	if p == nil {
		return nil
	}
	return &Policy{opts: p.opts.Clone()}
}

func (p PolicyOption) Clone() PolicyOption {
	return PolicyOption{
		ID:                    p.ID,
		MemberCount:           util.CloneRef(p.MemberCount),
		PublishedProjectCount: util.CloneRef(p.PublishedProjectCount),
		LayerCount:            util.CloneRef(p.LayerCount),
		DatasetCount:          util.CloneRef(p.DatasetCount),
		AssetStorageSize:      util.CloneRef(p.AssetStorageSize),
	}
}
