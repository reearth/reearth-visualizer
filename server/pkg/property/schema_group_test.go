package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/stretchr/testify/assert"
)

var (
	testSchemaGroup1 = NewSchemaGroup().ID("aa").Fields([]*SchemaField{testSchemaField1, testSchemaField2}).MustBuild()
	testSchemaGroup2 = NewSchemaGroup().ID("bb").Fields([]*SchemaField{testSchemaField3}).IsList(true).MustBuild()
)

func TestSchemaGroup(t *testing.T) {
	scid := SchemaGroupID("aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()

	tests := []struct {
		Name     string
		G        *SchemaGroup
		Expected struct {
			GIDRef        *SchemaGroupID
			GID           SchemaGroupID
			Fields        []*SchemaField
			Title         i18n.String
			Collection    i18n.String
			IsAvailableIf *Condition
			IsList        bool
		}
	}{
		{
			Name: "nil schema group",
		},
		{
			Name: "success",
			G:    NewSchemaGroup().ID(scid).Fields([]*SchemaField{sf}).MustBuild(),
			Expected: struct {
				GIDRef        *SchemaGroupID
				GID           SchemaGroupID
				Fields        []*SchemaField
				Title         i18n.String
				Collection    i18n.String
				IsAvailableIf *Condition
				IsList        bool
			}{
				GIDRef:     scid.Ref(),
				GID:        scid,
				Fields:     []*SchemaField{sf},
				Title:      nil,
				Collection: nil,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.Expected.GID, tc.G.ID())
			assert.Equal(t, tc.Expected.GIDRef, tc.G.IDRef())
			assert.Equal(t, tc.Expected.Fields, tc.G.Fields())
			assert.Equal(t, tc.Expected.IsList, tc.G.IsList())
			assert.Equal(t, tc.Expected.IsAvailableIf, tc.G.IsAvailableIf())
			assert.Equal(t, tc.Expected.Title, tc.G.Title())
			assert.Equal(t, tc.Expected.Collection, tc.G.Collection())
		})
	}
}

func TestSchemaGroup_Field(t *testing.T) {
	scid := SchemaGroupID("aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()

	tests := []struct {
		Name     string
		G        *SchemaGroup
		PTR      *Pointer
		Input    FieldID
		Expected *SchemaField
	}{
		{
			Name: "nil schema group",
		},
		{
			Name:     "found",
			G:        NewSchemaGroup().ID(scid).Fields([]*SchemaField{sf}).MustBuild(),
			PTR:      NewPointer(nil, nil, sf.ID().Ref()),
			Input:    sf.ID(),
			Expected: sf,
		},
		{
			Name:  "not found",
			G:     NewSchemaGroup().ID(scid).Fields([]*SchemaField{sf}).MustBuild(),
			PTR:   NewPointer(nil, nil, FieldID("zz").Ref()),
			Input: FieldID("zz"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.G.Field(tc.Input))
			assert.Equal(t, tc.Expected, tc.G.FieldByPointer(tc.PTR))
			assert.Equal(t, tc.Expected != nil, tc.G.HasField(tc.Input))
		})
	}
}

func TestSchemaGroup_SetTitle(t *testing.T) {
	sg := NewSchemaGroup().ID(SchemaGroupID("aa")).Fields([]*SchemaField{sf}).MustBuild()
	sg.SetTitle(i18n.StringFrom("ttt"))
	assert.Equal(t, i18n.StringFrom("ttt"), sg.Title())
}
