package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestCluster_ID(t *testing.T) {
	cid := id.NewClusterID()
	clusterA := &Cluster{
		id: cid,
	}
	tests := []struct {
		name    string
		cluster *Cluster
		want    id.ClusterID
	}{
		{
			name:    "should return cluster id",
			cluster: clusterA,
			want:    cid,
		},
		{
			name:    "should return empty if cluster is nil",
			cluster: nil,
			want:    id.ClusterID{},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := tc.cluster.ID()
			assert.Equal(tt, tc.want, got)
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
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := tc.cluster.Name()
			assert.Equal(tt, tc.want, got)
		})
	}
}
func TestCluster_Property(t *testing.T) {
	propertyId := id.NewPropertyID()
	clusterA := &Cluster{
		property: propertyId,
	}
	tests := []struct {
		name    string
		cluster *Cluster
		want    id.PropertyID
	}{
		{
			name:    "should return cluster property",
			cluster: clusterA,
			want:    propertyId,
		},
		{
			name:    "should return empty cluster property",
			cluster: nil,
			want:    id.PropertyID{},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := tc.cluster.Property()
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestNew(t *testing.T) {
	propertyId := id.NewPropertyID()
	clusterId := id.NewClusterID()
	type args struct {
		cid  id.ClusterID
		name string
		pid  id.PropertyID
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
				cid:  id.ClusterID{},
				name: "xxx",
				pid:  propertyId,
			},
			want:    nil,
			wantErr: true,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got, err := NewCluster(tc.args.cid, tc.args.name, tc.args.pid)
			assert.Equal(tt, tc.wantErr, err != nil)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestCluster_Rename(t *testing.T) {
	propertyId := id.NewPropertyID()
	clusterId := id.NewClusterID()

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
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.cluster.Rename(tc.args.name)
			assert.Equal(tt, tc.want, tc.cluster)
		})
	}
}

func TestCluster_UpdateProperty(t *testing.T) {
	propertyId := id.NewPropertyID()
	propertyId2 := id.NewPropertyID()
	clusterId := id.NewClusterID()

	type args struct {
		property id.PropertyID
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
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.cluster.UpdateProperty(tc.args.property)
			assert.Equal(tt, tc.want, tc.cluster)
		})
	}
}
