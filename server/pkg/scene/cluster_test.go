package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCluster_ID(t *testing.T) {
	cid := NewClusterID()
	clusterA := &Cluster{
		id: cid,
	}

	tests := []struct {
		name    string
		cluster *Cluster
		want    ClusterID
	}{
		{
			name:    "should return cluster id",
			cluster: clusterA,
			want:    cid,
		},
		{
			name:    "should return empty if cluster is nil",
			cluster: nil,
			want:    ClusterID{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := tc.cluster.ID()
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestCluster_Name(t *testing.T) {
	clusterA := &Cluster{
		name: "clusterA",
	}

	tests := []struct {
		name    string
		cluster *Cluster
		want    string
	}{
		{
			name:    "should return cluster name",
			cluster: clusterA,
			want:    "clusterA",
		},
		{
			name:    "should return empty if cluster is nil",
			cluster: nil,
			want:    "",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := tc.cluster.Name()
			assert.Equal(t, tc.want, got)
		})
	}
}
func TestCluster_Property(t *testing.T) {
	propertyId := NewPropertyID()
	clusterA := &Cluster{
		property: propertyId,
	}

	tests := []struct {
		name    string
		cluster *Cluster
		want    PropertyID
	}{
		{
			name:    "should return cluster property",
			cluster: clusterA,
			want:    propertyId,
		},
		{
			name:    "should return empty cluster property",
			cluster: nil,
			want:    PropertyID{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := tc.cluster.Property()
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestNew(t *testing.T) {
	propertyId := NewPropertyID()
	clusterId := NewClusterID()
	type args struct {
		cid  ClusterID
		name string
		pid  PropertyID
	}

	tests := []struct {
		name    string
		args    args
		want    *Cluster
		wantErr bool
	}{
		{
			name: "should create a new cluster",
			args: args{
				cid:  clusterId,
				name: "ccc",
				pid:  propertyId,
			},
			want: &Cluster{
				id:       clusterId,
				name:     "ccc",
				property: propertyId,
			},
			wantErr: false,
		},
		{
			name: "should return invalid id error",
			args: args{
				cid:  ClusterID{},
				name: "xxx",
				pid:  propertyId,
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, err := NewCluster(tc.args.cid, tc.args.name, tc.args.pid)
			assert.Equal(t, tc.wantErr, err != nil)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestCluster_Rename(t *testing.T) {
	propertyId := NewPropertyID()
	clusterId := NewClusterID()

	type args struct {
		name string
	}

	tests := []struct {
		name    string
		cluster *Cluster
		args    args
		want    *Cluster
	}{
		{
			name: "should change the name",
			cluster: &Cluster{
				id:       clusterId,
				name:     "ccc",
				property: propertyId,
			},
			args: args{
				name: "new name",
			},
			want: &Cluster{
				id:       clusterId,
				name:     "new name",
				property: propertyId,
			},
		},
		{
			name: "shouldn't change the name",
			args: args{
				name: "xxx",
			},
			want: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			tc.cluster.Rename(tc.args.name)
			assert.Equal(t, tc.want, tc.cluster)
		})
	}
}

func TestCluster_UpdateProperty(t *testing.T) {
	propertyId := NewPropertyID()
	propertyId2 := NewPropertyID()
	clusterId := NewClusterID()

	type args struct {
		property PropertyID
	}

	tests := []struct {
		name    string
		cluster *Cluster
		args    args
		want    *Cluster
	}{
		{
			name: "should update the property",
			cluster: &Cluster{
				id:       clusterId,
				name:     "ccc",
				property: propertyId,
			},
			args: args{
				property: propertyId2,
			},
			want: &Cluster{
				id:       clusterId,
				name:     "ccc",
				property: propertyId2,
			},
		},
		{
			name: "shouldn't update the property",
			args: args{
				property: propertyId2,
			},
			want: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			tc.cluster.UpdateProperty(tc.args.property)
			assert.Equal(t, tc.want, tc.cluster)
		})
	}
}
