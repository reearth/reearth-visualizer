package mongodoc

import (
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/mongox"
)

type PolicyDocument struct {
	ID                    workspace.PolicyID
	Name                  string `bson:"name,omitempty"`
	ProjectCount          *int
	PublishedProjectCount *int
	MemberCount           *int
	LayerCount            *int
	DatasetCount          *int
	DatasetSchemaCount    *int
	AssetStorageSize      *int64
}

func (d PolicyDocument) Model() *workspace.Policy {
	return workspace.NewPolicy(workspace.PolicyOption{
		ID:                    d.ID,
		Name:                  d.Name,
		ProjectCount:          d.ProjectCount,
		PublishedProjectCount: d.PublishedProjectCount,
		MemberCount:           d.MemberCount,
		LayerCount:            d.LayerCount,
		DatasetCount:          d.DatasetCount,
		DatasetSchemaCount:    d.DatasetSchemaCount,
		AssetStorageSize:      d.AssetStorageSize,
	})
}

type PolicyConsumer = mongox.SliceFuncConsumer[*PolicyDocument, *workspace.Policy]

func NewPolicyConsumer() *PolicyConsumer {
	return mongox.NewSliceFuncConsumer(func(d *PolicyDocument) (*workspace.Policy, error) {
		return d.Model(), nil
	})
}
