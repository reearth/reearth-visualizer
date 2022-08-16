package scene

type Cluster struct {
	id       ClusterID
	name     string
	property PropertyID
}

func NewCluster(cid ClusterID, name string, pid PropertyID) (*Cluster, error) {
	if cid.IsNil() {
		return nil, ErrInvalidID
	}
	return &Cluster{
		id:       cid,
		name:     name,
		property: pid,
	}, nil
}

func (c *Cluster) ID() ClusterID {
	if c == nil {
		return ClusterID{}
	}
	return c.id
}

func (c *Cluster) Name() string {
	if c == nil {
		return ""
	}
	return c.name
}

func (c *Cluster) Property() PropertyID {
	if c == nil {
		return PropertyID{}
	}
	return c.property
}

func (c *Cluster) Rename(name string) {
	if c == nil {
		return
	}
	c.name = name
}

func (c *Cluster) UpdateProperty(pid PropertyID) {
	if c == nil {
		return
	}
	c.property = pid
}
