package policy

import (
	"errors"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/util"
)

type ID = workspace.PolicyID

var ErrPolicyViolation = errors.New("policy violation")

type Policy struct {
	opts Option
}

type Option struct {
	ID                    ID
	Name                  string
	ProjectCount          *int
	MemberCount           *int
	PublishedProjectCount *int
	LayerCount            *int
	AssetStorageSize      *int64
	DatasetSchemaCount    *int
	DatasetCount          *int
	NLSLayersCount        *int
	PageCount             *int
	BlocksCount           *int
}

func New(opts Option) *Policy {
	return &Policy{opts: opts.Clone()}
}

func (p *Policy) ID() ID {
	return p.opts.ID
}

func (p *Policy) Name() string {
	return p.opts.Name
}

func (p *Policy) Option() Option {
	return p.opts.Clone()
}

func (p *Policy) EnforceProjectCount(count int) error {
	return p.error(p == nil || p.opts.ProjectCount == nil || *p.opts.ProjectCount >= count)
}

func (p *Policy) EnforceMemberCount(count int) error {
	return p.error(p == nil || p.opts.MemberCount == nil || *p.opts.MemberCount >= count)
}

func (p *Policy) EnforcePublishedProjectCount(count int) error {
	return p.error(p == nil || p.opts.PublishedProjectCount == nil || *p.opts.PublishedProjectCount >= count)
}

func (p *Policy) EnforceLayerCount(count int) error {
	return p.error(p == nil || p.opts.LayerCount == nil || *p.opts.LayerCount >= count)
}

func (p *Policy) EnforceAssetStorageSize(size int64) error {
	return p.error(p == nil || p.opts.AssetStorageSize == nil || *p.opts.AssetStorageSize >= size)
}

func (p *Policy) EnforceDatasetSchemaCount(count int) error {
	return p.error(p == nil || p.opts.DatasetSchemaCount == nil || *p.opts.DatasetSchemaCount >= count)
}

func (p *Policy) EnforceDatasetCount(count int) error {
	return p.error(p == nil || p.opts.DatasetCount == nil || *p.opts.DatasetCount >= count)
}

func (p *Policy) EnforceNLSLayersCount(count int) error {
	return p.error(p == nil || p.opts.NLSLayersCount == nil || *p.opts.NLSLayersCount >= count)
}

func (p *Policy) EnforcePageCount(count int) error {
	return p.error(p == nil || p.opts.PageCount == nil || *p.opts.PageCount >= count)
}

func (p *Policy) EnforceBlocksCount(count int) error {
	return p.error(p == nil || p.opts.BlocksCount == nil || *p.opts.BlocksCount >= count)
}

func (*Policy) error(ok bool) error {
	if !ok {
		return ErrPolicyViolation
	}
	return nil
}

func (p *Policy) Clone() *Policy {
	if p == nil {
		return nil
	}
	return &Policy{opts: p.opts.Clone()}
}

func (p Option) Clone() Option {
	return Option{
		ID:                    p.ID,
		Name:                  p.Name,
		ProjectCount:          util.CloneRef(p.ProjectCount),
		MemberCount:           util.CloneRef(p.MemberCount),
		PublishedProjectCount: util.CloneRef(p.PublishedProjectCount),
		LayerCount:            util.CloneRef(p.LayerCount),
		AssetStorageSize:      util.CloneRef(p.AssetStorageSize),
		DatasetSchemaCount:    util.CloneRef(p.DatasetSchemaCount),
		DatasetCount:          util.CloneRef(p.DatasetCount),
		NLSLayersCount:        util.CloneRef(p.NLSLayersCount),
		PageCount:             util.CloneRef(p.PageCount),
		BlocksCount:           util.CloneRef(p.BlocksCount),
	}
}
