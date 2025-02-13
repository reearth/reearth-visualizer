package scene

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

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
	return util.ListHas[id.ClusterID, Cluster](tl.clusters, (*Cluster).ID, tid)
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
	return util.Get[id.ClusterID, Cluster](tl.clusters, (*Cluster).ID, cid)
}

func (tl *ClusterList) Remove(clusters ...id.ClusterID) {
	if tl == nil {
		return
	}
	tl.clusters = util.RemoveByIds[id.ClusterID, Cluster](tl.clusters, (*Cluster).ID, clusters...)
}

func (tl *ClusterList) Properties() []id.PropertyID {
	if tl == nil {
		return nil
	}
	return util.Properties[id.PropertyID, Cluster](tl.clusters, (*Cluster).Property)
}
