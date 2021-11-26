package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestInitItemFrom(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aa").Schema(id.MustPropertySchemaID("xx~1.0.0/aa")).Fields([]*SchemaField{sf}).MustBuild()
	sgl := NewSchemaGroup().ID("aa").IsList(true).Schema(id.MustPropertySchemaID("xx~1.0.0/aa")).Fields([]*SchemaField{sf}).MustBuild()
	iid := id.NewPropertyItemID()
	propertySchemaID := id.MustPropertySchemaID("xx~1.0.0/aa")
	propertySchemaField1ID := id.PropertySchemaGroupID("aa")
	testCases := []struct {
		Name     string
		SG       *SchemaGroup
		Expected Item
	}{
		{
			Name: "nil psg",
		},
		{
			Name:     "init item from group",
			SG:       sg,
			Expected: NewGroup().ID(iid).Schema(propertySchemaID, propertySchemaField1ID).MustBuild(),
		},
		{
			Name:     "init item from group list",
			SG:       sgl,
			Expected: NewGroupList().ID(iid).Schema(propertySchemaID, propertySchemaField1ID).MustBuild(),
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := InitItemFrom(tc.SG)
			if res != nil {
				assert.Equal(tt, tc.Expected.Schema(), res.Schema())
				assert.Equal(tt, tc.Expected.SchemaGroup(), res.SchemaGroup())
			} else {
				assert.Nil(tt, tc.Expected)
			}
		})
	}
}

func TestToGroup(t *testing.T) {
	iid := id.NewPropertyItemID()
	propertySchemaID := id.MustPropertySchemaID("xxx~1.1.1/aa")
	propertySchemaField1ID := id.PropertySchemaFieldID("a")
	propertySchemaGroup1ID := id.PropertySchemaGroupID("A")
	il := []Item{
		NewGroup().ID(iid).Schema(propertySchemaID, propertySchemaGroup1ID).
			Fields([]*Field{
				NewFieldUnsafe().
					FieldUnsafe(propertySchemaField1ID).
					ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
					Build(),
			}).MustBuild(),
	}
	p := New().NewID().Scene(id.NewSceneID()).Items(il).Schema(propertySchemaID).MustBuild()
	g := ToGroup(p.ItemBySchema(propertySchemaGroup1ID))
	assert.Equal(t, propertySchemaID, g.Schema())
	assert.Equal(t, propertySchemaGroup1ID, g.SchemaGroup())
	assert.Equal(t, iid, g.ID())
}

func TestToGroupList(t *testing.T) {
	iid := id.NewPropertyItemID()
	propertySchemaID := id.MustPropertySchemaID("xxx~1.1.1/aa")
	propertySchemaGroup1ID := id.PropertySchemaGroupID("A")
	il := []Item{
		NewGroupList().ID(iid).Schema(propertySchemaID, propertySchemaGroup1ID).MustBuild(),
	}
	p := New().NewID().Scene(id.NewSceneID()).Items(il).Schema(propertySchemaID).MustBuild()
	g := ToGroupList(p.ItemBySchema(propertySchemaGroup1ID))
	assert.Equal(t, propertySchemaID, g.Schema())
	assert.Equal(t, propertySchemaGroup1ID, g.SchemaGroup())
	assert.Equal(t, iid, g.ID())
}
