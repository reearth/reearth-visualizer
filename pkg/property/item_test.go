package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInitItemFrom(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aa").Fields([]*SchemaField{sf}).MustBuild()
	sgl := NewSchemaGroup().ID("aa").IsList(true).Fields([]*SchemaField{sf}).MustBuild()
	iid := NewItemID()
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
			Expected: NewGroup().ID(iid).SchemaGroup(propertySchemaField1ID).MustBuild(),
		},
		{
			Name:     "init item from group list",
			SG:       sgl,
			Expected: NewGroupList().ID(iid).SchemaGroup(propertySchemaField1ID).MustBuild(),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := InitItemFrom(tt.SG)
			if res != nil {
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
		NewGroup().ID(iid).SchemaGroup(propertySchemaGroup1ID).
			Fields([]*Field{
				NewField(propertySchemaField1ID).
					Value(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
					MustBuild(),
			}).MustBuild(),
	}
	p := New().NewID().Scene(NewSceneID()).Items(il).Schema(propertySchemaID).MustBuild()
	g := ToGroup(p.ItemBySchema(propertySchemaGroup1ID))
	assert.Equal(t, propertySchemaGroup1ID, g.SchemaGroup())
	assert.Equal(t, iid, g.ID())
}

func TestToGroupList(t *testing.T) {
	iid := NewItemID()
	propertySchemaID := MustSchemaID("xxx~1.1.1/aa")
	propertySchemaGroup1ID := SchemaGroupID("A")
	il := []Item{
		NewGroupList().ID(iid).SchemaGroup(propertySchemaGroup1ID).MustBuild(),
	}
	p := New().NewID().Scene(NewSceneID()).Items(il).Schema(propertySchemaID).MustBuild()
	g := ToGroupList(p.ItemBySchema(propertySchemaGroup1ID))
	assert.Equal(t, propertySchemaGroup1ID, g.SchemaGroup())
	assert.Equal(t, iid, g.ID())
}

func TestGroupAndField_SchemaFieldPointer(t *testing.T) {
	tests := []struct {
		name   string
		target GroupAndField
		want   SchemaFieldPointer
	}{
		{
			name: "group",
			target: GroupAndField{
				ParentGroup: nil,
				Group:       testGroup1,
				Field:       testField1,
			},
			want: SchemaFieldPointer{
				SchemaGroup: testGroup1.SchemaGroup(),
				Field:       testField1.Field(),
			},
		},
		{
			name: "group list",
			target: GroupAndField{
				ParentGroup: testGroupList1,
				Group:       testGroup2,
				Field:       testField2,
			},
			want: SchemaFieldPointer{
				SchemaGroup: testGroup2.SchemaGroup(),
				Field:       testField2.Field(),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.SchemaFieldPointer())
		})
	}
}
