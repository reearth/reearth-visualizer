package scene

import "github.com/reearth/reearth-backend/pkg/id"

type ClusterList struct {
	clusters []*Cluster
}

func NewClusterList() *ClusterList {
	return &ClusterList{}
}

func NewClusterListFrom(clusters []*Cluster) *ClusterList {
	return &ClusterList{clusters: append([]*Cluster{}, clusters...)}
}

func (tl *ClusterList) Clusters() []*Cluster {
	if tl == nil {
		return nil
	}
	return append([]*Cluster{}, tl.clusters...)
}

func (tl *ClusterList) Has(tid id.ClusterID) bool {
	if tl == nil {
		return false
	}
	for _, cluster := range tl.clusters {
		if cluster.ID() == tid {
			return true
		}
	}
	return false
}

func (tl *ClusterList) Add(clusters ...*Cluster) {
	if tl == nil {
		return
	}
	tl.clusters = append(tl.clusters, clusters...)
}

func (tl *ClusterList) Get(cid id.ClusterID) *Cluster {
	if tl == nil {
		return nil
	}
	for _, c := range tl.clusters {
		if c.ID() == cid {
			return c
		}
	}
	return nil
}

func (tl *ClusterList) Remove(clusters ...id.ClusterID) {
	if tl == nil {
		return
	}
	for i := 0; i < len(tl.clusters); i++ {
		for _, tid := range clusters {
			if tl.clusters[i].id == tid {
				tl.clusters = append(tl.clusters[:i], tl.clusters[i+1:]...)
				i--
			}
		}
	}
}

func (tl *ClusterList) Properties() []id.PropertyID {
	if tl == nil {
		return nil
	}
	res := make([]id.PropertyID, 0, len(tl.clusters))
	for _, c := range tl.clusters {
		res = append(res, c.property)
	}
	return res
}
