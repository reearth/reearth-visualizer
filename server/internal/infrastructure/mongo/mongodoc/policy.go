package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/workspace"
	"go.mongodb.org/mongo-driver/bson"
)

type PolicyDocument struct {
	ID                    workspace.PolicyID
	ProjectCount          *int
	PublishedProjectCount *int
	MemberCount           *int
	LayerCount            *int
	DatasetCount          *int
	AssetStorageSize      *int64
}

func (d PolicyDocument) Model() *workspace.Policy {
	return workspace.NewPolicy(workspace.PolicyOption{
		ID:                    d.ID,
		ProjectCount:          d.ProjectCount,
		PublishedProjectCount: d.PublishedProjectCount,
		MemberCount:           d.MemberCount,
		LayerCount:            d.LayerCount,
		DatasetCount:          d.DatasetCount,
		AssetStorageSize:      d.AssetStorageSize,
	})
}

type PolicyConsumer struct {
	Rows []*workspace.Policy
}

func (c *PolicyConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc PolicyDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	p := doc.Model()
	c.Rows = append(c.Rows, p)
	return nil
}
