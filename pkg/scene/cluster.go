package scene

import "github.com/reearth/reearth-backend/pkg/id"

type Cluster struct {
	id       id.ClusterID
	name     string
	property id.PropertyID
}

func NewCluster(cid id.ClusterID, name string, pid id.PropertyID) (*Cluster, error) {
	if id.ID(cid).IsNil() {
		return nil, id.ErrInvalidID
	}
	return &Cluster{
		id:       cid,
		name:     name,
		property: pid,
	}, nil
}

func (c *Cluster) ID() id.ClusterID {
	if c == nil {
		return id.ClusterID{}
	}
	return c.id
}

func (c *Cluster) Name() string {
	if c == nil {
		return ""
	}
	return c.name
}

func (c *Cluster) Property() id.PropertyID {
	if c == nil {
		return id.PropertyID{}
	}
	return c.property
}

func (c *Cluster) Rename(name string) {
	if c == nil {
		return
	}
	c.name = name
}

func (c *Cluster) UpdateProperty(pid id.PropertyID) {
	if c == nil {
		return
	}
	c.property = pid
}
