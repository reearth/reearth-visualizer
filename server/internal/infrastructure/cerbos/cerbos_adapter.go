package redis

import (
	"context"

	"github.com/cerbos/cerbos-sdk-go/cerbos"
)

type CerbosAdapter struct {
	client *cerbos.GRPCClient
}

func NewCerbosAdapter(client *cerbos.GRPCClient) *CerbosAdapter {
	return &CerbosAdapter{client: client}
}

func (c *CerbosAdapter) CheckPermissions(ctx context.Context, principal *cerbos.Principal, resources []*cerbos.Resource, actions []string) (*cerbos.CheckResourcesResponse, error) {
	batch := cerbos.NewResourceBatch()
	for _, resource := range resources {
		batch.Add(resource, actions...)
	}
	return c.client.CheckResources(ctx, principal, batch)
}
