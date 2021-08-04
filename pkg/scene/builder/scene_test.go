package builder

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestScene_FindProperty(t *testing.T) {
	p1 := id.NewPropertyID()
	sid := id.NewSceneID()
	scid := id.MustPropertySchemaID("xx~1.0.0/aa")
	pl := []*property.Property{
		property.New().NewID().Scene(sid).Schema(scid).MustBuild(),
		property.New().ID(p1).Scene(sid).Schema(scid).MustBuild(),
	}
	testCases := []struct {
		Name     string
		PL       []*property.Property
		Input    id.PropertyID
		Expected *property.Property
	}{
		{
			Name:     "Found",
			PL:       pl,
			Input:    p1,
			Expected: property.New().Scene(sid).Schema(scid).ID(p1).MustBuild(),
		},
		{
			Name:     " NotFound",
			PL:       pl,
			Input:    id.NewPropertyID(),
			Expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := findProperty(tc.PL, tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
