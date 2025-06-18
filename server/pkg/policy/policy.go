package policy

import (
	"errors"
	"fmt"
	"io"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/util"
	"github.com/spf13/afero"
)

type ID = workspace.PolicyID

// Project Policy
var TechLimited_ProjectCount = 1000

// Publishment Policy
var TechLimited_CustomDomainCount = 10
var TechLimited_PublishableCount = 1000

// Asset Policy
var TechLimited_AssetStorageSize = int64(500 * 1024 * 1024)   // 500MB
var TechLimited_MaximumSizePerAsset = int64(16 * 1024 * 1024) // 16MB

// Import Policy
var TechLimited_ProjectImportingTimeout = 30 * 1000 * 1000          // 30min(infra)
var TechLimited_MaximumProjectExportSize = int64(500 * 1024 * 1024) // 500MB

// Scene Policy
var TechLimited_InstallPluginCount = 50
var TechLimited_NLSLayersCount = 100

var ErrPolicyViolation = errors.New("policy violation")

type Policy struct {
	opts Option
}

type Option struct {
	ID   ID
	Name string

	// Workspace Policy
	MemberCount *int

	// Project Policy
	ProjectCount   *int
	PrivateProject *bool

	// Publishment Policy
	CustomDomainCount *int
	PublishableCount  *int

	// Asset Policy
	AssetStorageSize    *int64
	MaximumSizePerAsset *int64

	// Import Policy
	ProjectImportingTimeout  *int
	MaximumProjectExportSize *int64

	// Scene Policy
	InstallPluginCount *int
	NLSLayersCount     *int
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

// Workspace Policy
func (p *Policy) EnforceMemberCount(count int) error {
	return p.error(p == nil || p.opts.MemberCount == nil || *p.opts.MemberCount >= count)
}

// Project Policy
func (p *Policy) EnforceProjectCount(count int) error {
	if TechLimited_ProjectCount < count {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.ProjectCount == nil || *p.opts.ProjectCount >= count)
}

func (p *Policy) EnforcePrivateProject(isPrivate bool) error {
	return p.error(p == nil || p.opts.PrivateProject == nil || *p.opts.PrivateProject || !isPrivate)
}

// Publishment Policy
func (p *Policy) EnforceCustomDomainCount(count int) error {
	if TechLimited_CustomDomainCount < count {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.CustomDomainCount == nil || *p.opts.CustomDomainCount >= count)
}

func (p *Policy) EnforcePublishableCount(count int) error {
	if TechLimited_PublishableCount < count {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.PublishableCount == nil || *p.opts.PublishableCount >= count)
}

// Asset Policy
func (p *Policy) EnforceAssetStorageSize(size int64) error {
	if TechLimited_AssetStorageSize < size {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.AssetStorageSize == nil || *p.opts.AssetStorageSize >= size)
}

func (p *Policy) EnforceMaximumSizePerAsset(size int64) error {
	if TechLimited_MaximumSizePerAsset < size {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.MaximumSizePerAsset == nil || *p.opts.MaximumSizePerAsset >= size)
}

// Import Policy
func (p *Policy) EnforceProjectImportingTimeout(timeout int) error {
	if TechLimited_ProjectImportingTimeout < timeout {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.ProjectImportingTimeout == nil || *p.opts.ProjectImportingTimeout >= timeout)
}

func (p *Policy) EnforceMaximumProjectExportSize(zipFile afero.File) error {
	const MB = 1024 * 1024
	fileSize, err := zipFile.Seek(0, io.SeekEnd)
	if err != nil {
		return fmt.Errorf("failed to get file size: %w", err)
	}

	if *p.opts.MaximumProjectExportSize <= fileSize {
		return fmt.Errorf("file size (%.0f byte) exceeds %d byte limit", float64(fileSize), *p.opts.MaximumProjectExportSize)
	}
	if _, err := zipFile.Seek(0, io.SeekStart); err != nil {
		return fmt.Errorf("failed to reset file position: %w", err)
	}
	return nil
}

// Scene Policy
func (p *Policy) EnforceInstallPluginCount(count int) error {
	if TechLimited_InstallPluginCount < count {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.InstallPluginCount == nil || *p.opts.InstallPluginCount >= count)
}

func (p *Policy) EnforceNLSLayersCount(count int) error {
	if TechLimited_NLSLayersCount < count {
		return p.error(false)
	}
	return p.error(p == nil || p.opts.NLSLayersCount == nil || *p.opts.NLSLayersCount >= count)
}

func (*Policy) error(ok bool) error {
	fmt.Println("error ok => ", ok)
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
		ID:                       p.ID,
		Name:                     p.Name,
		MemberCount:              util.CloneRef(p.MemberCount),
		ProjectCount:             util.CloneRef(p.ProjectCount),
		PrivateProject:           util.CloneRef(p.PrivateProject),
		CustomDomainCount:        util.CloneRef(p.CustomDomainCount),
		PublishableCount:         util.CloneRef(p.PublishableCount),
		AssetStorageSize:         util.CloneRef(p.AssetStorageSize),
		MaximumSizePerAsset:      util.CloneRef(p.MaximumSizePerAsset),
		ProjectImportingTimeout:  util.CloneRef(p.ProjectImportingTimeout),
		MaximumProjectExportSize: util.CloneRef(p.MaximumProjectExportSize),
		InstallPluginCount:       util.CloneRef(p.InstallPluginCount),
		NLSLayersCount:           util.CloneRef(p.NLSLayersCount),
	}
}
