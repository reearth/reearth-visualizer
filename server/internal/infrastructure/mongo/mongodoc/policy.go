package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/mongox"
)

type PolicyDocument struct {
	ID                    policy.ID
	Name                  string `bson:"name,omitempty"`
	ProjectCount          *int
	PublishedProjectCount *int
	MemberCount           *int
	LayerCount            *int
	DatasetCount          *int
	DatasetSchemaCount    *int
	AssetStorageSize      *int64
}

func (d PolicyDocument) Model() *policy.Policy {
	return policy.New(policy.Option{
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

type PolicyConsumer = mongox.SliceFuncConsumer[*PolicyDocument, *policy.Policy]

func NewPolicyConsumer() *PolicyConsumer {
	return mongox.NewSliceFuncConsumer(func(d *PolicyDocument) (*policy.Policy, error) {
		return d.Model(), nil
	})
}
