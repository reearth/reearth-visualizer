package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_Add(t *testing.T) {
	c1, _ := NewCluster(NewClusterID(), "c1", NewPropertyID())
	c2, _ := NewCluster(NewClusterID(), "c2", NewPropertyID())
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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			tc.list.Add(tc.args.clusters...)
			assert.Equal(t, tc.want, tc.list)
		})
	}
}

func TestList_Clusters(t *testing.T) {
	c1, _ := NewCluster(NewClusterID(), "ccc", NewPropertyID())
	c2, _ := NewCluster(NewClusterID(), "xxx", NewPropertyID())

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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.list.Clusters())
		})
	}
}

func TestList_Has(t *testing.T) {
	c1, _ := NewCluster(NewClusterID(), "xxx", NewPropertyID())

	type args struct {
		tid ClusterID
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
				tid: NewClusterID(),
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
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.list.Has(tc.args.tid))
		})
	}
}

func TestList_Remove(t *testing.T) {
	c1, _ := NewCluster(NewClusterID(), "xxx", NewPropertyID())
	c2, _ := NewCluster(NewClusterID(), "xxx", NewPropertyID())
	c3, _ := NewCluster(NewClusterID(), "xxx", NewPropertyID())

	type args struct {
		cluster ClusterID
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
			list: nil,
			args: args{
				cluster: c1.ID(),
			},
			want: nil,
		},
		{
			name: "empty list: should remove nothing",
			list: NewClusterListFrom([]*Cluster{}),
			args: args{
				cluster: c1.ID(),
			},
			want: NewClusterListFrom([]*Cluster{}),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			tc.list.Remove(tc.args.cluster)
			assert.Equal(t, tc.want, tc.list)
		})
	}
}

func TestClusterList_Get(t *testing.T) {
	cid1 := NewClusterID()
	cid2 := NewClusterID()
	cid3 := NewClusterID()
	c1, _ := NewCluster(cid1, "xxx", NewPropertyID())
	c2, _ := NewCluster(cid2, "zzz", NewPropertyID())
	c3, _ := NewCluster(cid3, "yyy", NewPropertyID())
	type args struct {
		cid ClusterID
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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := tc.list.Get(tc.args.cid)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestClusterList_Properties(t *testing.T) {
	c1, _ := NewCluster(NewClusterID(), "xxx", NewPropertyID())
	c2, _ := NewCluster(NewClusterID(), "yyy", NewPropertyID())

	tests := []struct {
		name string
		list *ClusterList
		want []PropertyID
	}{
		{
			name: "should return properties",
			list: NewClusterListFrom([]*Cluster{c1, c2}),
			want: []PropertyID{c1.property, c2.property},
		},
		{
			name: "nil_list: should return nil",
			list: nil,
			want: nil,
		},
		{
			name: "empty_list: should return empty",
			list: NewClusterListFrom([]*Cluster{}),
			want: []PropertyID{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.list.Properties())
		})
	}
}
