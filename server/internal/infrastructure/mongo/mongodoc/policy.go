package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/mongox"
)

type PolicyDocument struct {
	ID                       policy.ID
	Name                     string `bson:"name,omitempty"`
	MemberCount              *int
	ProjectCount             *int
	PrivateProject           *bool
	CustomDomainCount        *int
	PublishableCount         *int
	AssetStorageSize         *int64
	MaximumSizePerAsset      *int64
	ProjectImportingTimeout  *int
	MaximumProjectExportSize *int64
	InstallPluginCount       *int
	NLSLayersCount           *int
}

func (d PolicyDocument) Model() *policy.Policy {
	return policy.New(policy.Option{
		ID:                       d.ID,
		Name:                     d.Name,
		MemberCount:              d.MemberCount,
		ProjectCount:             d.ProjectCount,
		PrivateProject:           d.PrivateProject,
		CustomDomainCount:        d.CustomDomainCount,
		PublishableCount:         d.PublishableCount,
		AssetStorageSize:         d.AssetStorageSize,
		MaximumSizePerAsset:      d.MaximumSizePerAsset,
		ProjectImportingTimeout:  d.ProjectImportingTimeout,
		MaximumProjectExportSize: d.MaximumProjectExportSize,
		InstallPluginCount:       d.InstallPluginCount,
		NLSLayersCount:           d.NLSLayersCount,
	})
}

type PolicyConsumer = mongox.SliceFuncConsumer[*PolicyDocument, *policy.Policy]

func NewPolicyConsumer() *PolicyConsumer {
	return mongox.NewSliceFuncConsumer(func(d *PolicyDocument) (*policy.Policy, error) {
		return d.Model(), nil
	})
}

func NewPolicyDoc(po *policy.Policy) (*PolicyDocument, string) {

	if po == nil {
		return nil, ""
	}

	poo := po.Option()

	doc := PolicyDocument{
		ID:                       po.ID(),
		Name:                     po.Name(),
		MemberCount:              poo.MemberCount,
		ProjectCount:             poo.ProjectCount,
		PrivateProject:           poo.PrivateProject,
		CustomDomainCount:        poo.CustomDomainCount,
		PublishableCount:         poo.PublishableCount,
		AssetStorageSize:         poo.AssetStorageSize,
		MaximumSizePerAsset:      poo.MaximumSizePerAsset,
		ProjectImportingTimeout:  poo.ProjectImportingTimeout,
		MaximumProjectExportSize: poo.MaximumProjectExportSize,
		InstallPluginCount:       poo.InstallPluginCount,
		NLSLayersCount:           poo.NLSLayersCount,
	}

	return &doc, po.ID().String()
}
