package scene

import "github.com/reearth/reearthx/util"

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

func (tl *ClusterList) Has(tid ClusterID) bool {
	if tl == nil {
		return false
	}
	return util.ListHas[ClusterID, Cluster](tl.clusters, (*Cluster).ID, tid)
}

func (tl *ClusterList) Add(clusters ...*Cluster) {
	if tl == nil {
		return
	}
	tl.clusters = append(tl.clusters, clusters...)
}

func (tl *ClusterList) Get(cid ClusterID) *Cluster {
	if tl == nil {
		return nil
	}
	return util.Get[ClusterID, Cluster](tl.clusters, (*Cluster).ID, cid)
}

func (tl *ClusterList) Remove(clusters ...ClusterID) {
	if tl == nil {
		return
	}
	tl.clusters = util.RemoveByIds[ClusterID, Cluster](tl.clusters, (*Cluster).ID, clusters...)
}

func (tl *ClusterList) Properties() []PropertyID {
	if tl == nil {
		return nil
	}
	return util.Properties[PropertyID, Cluster](tl.clusters, (*Cluster).Property)
}
