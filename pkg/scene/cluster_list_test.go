package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestList_Add(t *testing.T) {
	c1, _ := NewCluster(id.NewClusterID(), "c1", id.NewPropertyID())
	c2, _ := NewCluster(id.NewClusterID(), "c2", id.NewPropertyID())
	type args struct {
		clusters []*Cluster
	}
	tests := []struct {
		name string
		list *ClusterList
		args args
		want *ClusterList
	}{
		{
			name: "should add a new cluster",
			list: &ClusterList{clusters: []*Cluster{c1}},
			args: args{clusters: []*Cluster{c2}},
			want: NewClusterListFrom([]*Cluster{c1, c2}),
		},
		{
			name: "nil_list: should not add a new cluster",
			list: nil,
			args: args{clusters: []*Cluster{c1}},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			tc.list.Add(tc.args.clusters...)
			assert.Equal(tt, tc.want, tc.list)
		})
	}
}

func TestList_Clusters(t *testing.T) {
	c1, _ := NewCluster(id.NewClusterID(), "ccc", id.NewPropertyID())
	c2, _ := NewCluster(id.NewClusterID(), "xxx", id.NewPropertyID())
	tests := []struct {
		name string
		list *ClusterList
		want []*Cluster
	}{
		{
			name: "should return clusters",
			list: NewClusterListFrom([]*Cluster{c1, c2}),
			want: []*Cluster{c1, c2},
		},
		{
			name: "nil_list: should return nil",
			list: nil,
			want: nil,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.want, tc.list.Clusters())
		})
	}
}

func TestList_Has(t *testing.T) {
	c1, _ := NewCluster(id.NewClusterID(), "xxx", id.NewPropertyID())

	type args struct {
		tid id.ClusterID
	}
	tests := []struct {
		name string
		list *ClusterList
		args args
		want bool
	}{
		{
			name: "should return true",
			list: NewClusterListFrom([]*Cluster{c1}),
			args: args{
				tid: c1.ID(),
			},
			want: true,
		},
		{
			name: "not existing: should return false",
			list: NewClusterListFrom([]*Cluster{c1}),
			args: args{
				tid: id.NewClusterID(),
			},
			want: false,
		},
		{
			name: "nil_list: should return false",
			args: args{
				tid: c1.ID(),
			},
			want: false,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			assert.Equal(tt, tc.want, tc.list.Has(tc.args.tid))
		})
	}
}

func TestList_Remove(t *testing.T) {
	c1, _ := NewCluster(id.NewClusterID(), "xxx", id.NewPropertyID())
	c2, _ := NewCluster(id.NewClusterID(), "xxx", id.NewPropertyID())
	c3, _ := NewCluster(id.NewClusterID(), "xxx", id.NewPropertyID())

	type args struct {
		cluster id.ClusterID
	}
	tests := []struct {
		name string
		list *ClusterList
		args args
		want *ClusterList
	}{
		{
			name: "should remove a cluster",
			list: NewClusterListFrom([]*Cluster{c1, c2, c3}),
			args: args{
				cluster: c3.ID(),
			},
			want: NewClusterListFrom([]*Cluster{c1, c2}),
		},
		{
			name: "not existing: should remove nothing",
			list: NewClusterListFrom([]*Cluster{c1, c2}),
			args: args{
				cluster: c3.ID(),
			},
			want: NewClusterListFrom([]*Cluster{c1, c2}),
		},
		{
			name: "nil_list: return nothing",
			args: args{
				cluster: c1.ID(),
			},
			want: nil,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.list.Remove(tc.args.cluster)
			assert.Equal(tt, tc.want, tc.list)
		})
	}
}

func TestClusterList_Get(t *testing.T) {
	cid1 := id.NewClusterID()
	cid2 := id.NewClusterID()
	cid3 := id.NewClusterID()
	c1, _ := NewCluster(cid1, "xxx", id.NewPropertyID())
	c2, _ := NewCluster(cid2, "zzz", id.NewPropertyID())
	c3, _ := NewCluster(cid3, "yyy", id.NewPropertyID())
	type args struct {
		cid id.ClusterID
	}
	tests := []struct {
		name string
		list *ClusterList
		args args
		want *Cluster
	}{
		{
			name: "should get a cluster",
			list: NewClusterListFrom([]*Cluster{c1, c2, c3}),
			args: args{
				cid: cid1,
			},
			want: c1,
		},
		{
			name: "not existing: should get nil",
			list: NewClusterListFrom([]*Cluster{c2, c3}),
			args: args{
				cid: cid1,
			},
			want: nil,
		},
		{
			name: "nil_list: should return nil",
			list: nil,
			args: args{
				cid: cid1,
			},
			want: nil,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := tc.list.Get(tc.args.cid)
			assert.Equal(tt, tc.want, got)
		})
	}
}
