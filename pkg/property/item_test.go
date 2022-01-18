package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInitItemFrom(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aa").Schema(MustSchemaID("xx~1.0.0/aa")).Fields([]*SchemaField{sf}).MustBuild()
	sgl := NewSchemaGroup().ID("aa").IsList(true).Schema(MustSchemaID("xx~1.0.0/aa")).Fields([]*SchemaField{sf}).MustBuild()
	iid := NewItemID()
	propertySchemaID := MustSchemaID("xx~1.0.0/aa")
	propertySchemaField1ID := SchemaGroupID("aa")

	tests := []struct {
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

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := InitItemFrom(tt.SG)
			if res != nil {
				assert.Equal(t, tt.Expected.Schema(), res.Schema())
				assert.Equal(t, tt.Expected.SchemaGroup(), res.SchemaGroup())
			} else {
				assert.Nil(t, tt.Expected)
			}
		})
	}
}

func TestToGroup(t *testing.T) {
	iid := NewItemID()
	propertySchemaID := MustSchemaID("xxx~1.1.1/aa")
	propertySchemaField1ID := FieldID("a")
	propertySchemaGroup1ID := SchemaGroupID("A")
	il := []Item{
		NewGroup().ID(iid).Schema(propertySchemaID, propertySchemaGroup1ID).
			Fields([]*Field{
				NewFieldUnsafe().
					FieldUnsafe(propertySchemaField1ID).
					ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
					Build(),
			}).MustBuild(),
	}
	p := New().NewID().Scene(NewSceneID()).Items(il).Schema(propertySchemaID).MustBuild()
	g := ToGroup(p.ItemBySchema(propertySchemaGroup1ID))
	assert.Equal(t, propertySchemaID, g.Schema())
	assert.Equal(t, propertySchemaGroup1ID, g.SchemaGroup())
	assert.Equal(t, iid, g.ID())
}

func TestToGroupList(t *testing.T) {
	iid := NewItemID()
	propertySchemaID := MustSchemaID("xxx~1.1.1/aa")
	propertySchemaGroup1ID := SchemaGroupID("A")
	il := []Item{
		NewGroupList().ID(iid).Schema(propertySchemaID, propertySchemaGroup1ID).MustBuild(),
	}
	p := New().NewID().Scene(NewSceneID()).Items(il).Schema(propertySchemaID).MustBuild()
	g := ToGroupList(p.ItemBySchema(propertySchemaGroup1ID))
	assert.Equal(t, propertySchemaID, g.Schema())
	assert.Equal(t, propertySchemaGroup1ID, g.SchemaGroup())
	assert.Equal(t, iid, g.ID())
}
