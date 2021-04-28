package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestSchemaGroup(t *testing.T) {
	scid := id.PropertySchemaFieldID("aa")
	sid := id.MustPropertySchemaID("xx/aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()

	testCases := []struct {
		Name     string
		G        *SchemaGroup
		Expected struct {
			GIDRef        *id.PropertySchemaFieldID
			SIDRef        *id.PropertySchemaID
			GID           id.PropertySchemaFieldID
			SID           id.PropertySchemaID
			Fields        []*SchemaField
			Title         i18n.String
			IsAvailableIf *Condition
			IsList        bool
		}
	}{
		{
			Name: "nil schema group",
		},
		{
			Name: "success",
			G:    NewSchemaGroup().ID(scid).Schema(sid).Fields([]*SchemaField{sf}).MustBuild(),
			Expected: struct {
				GIDRef        *id.PropertySchemaFieldID
				SIDRef        *id.PropertySchemaID
				GID           id.PropertySchemaFieldID
				SID           id.PropertySchemaID
				Fields        []*SchemaField
				Title         i18n.String
				IsAvailableIf *Condition
				IsList        bool
			}{
				GIDRef: scid.Ref(),
				SIDRef: sid.Ref(),
				GID:    scid,
				SID:    sid,
				Fields: []*SchemaField{sf},
				Title:  make(i18n.String),
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()

			assert.Equal(tt, tc.Expected.GID, tc.G.ID())
			assert.Equal(tt, tc.Expected.GIDRef, tc.G.IDRef())
			assert.Equal(tt, tc.Expected.SID, tc.G.Schema())
			assert.Equal(tt, tc.Expected.SIDRef, tc.G.SchemaRef())
			assert.Equal(tt, tc.Expected.Fields, tc.G.Fields())
			assert.Equal(tt, tc.Expected.IsList, tc.G.IsList())
			assert.Equal(tt, tc.Expected.IsAvailableIf, tc.G.IsAvailableIf())
			assert.Equal(tt, tc.Expected.Title, tc.G.Title())
		})
	}
}

func TestSchemaGroup_Field(t *testing.T) {
	scid := id.PropertySchemaFieldID("aa")
	sid := id.MustPropertySchemaID("xx/aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()

	testCases := []struct {
		Name     string
		G        *SchemaGroup
		PTR      *Pointer
		Input    id.PropertySchemaFieldID
		Expected *SchemaField
	}{
		{
			Name: "nil schema group",
		},
		{
			Name:     "found",
			G:        NewSchemaGroup().ID(scid).Schema(sid).Fields([]*SchemaField{sf}).MustBuild(),
			PTR:      NewPointer(nil, nil, sf.ID().Ref()),
			Input:    sf.ID(),
			Expected: sf,
		},
		{
			Name:  "not found",
			G:     NewSchemaGroup().ID(scid).Schema(sid).Fields([]*SchemaField{sf}).MustBuild(),
			PTR:   NewPointer(nil, nil, id.PropertySchemaFieldID("zz").Ref()),
			Input: id.PropertySchemaFieldID("zz"),
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected, tc.G.Field(tc.Input))
			assert.Equal(tt, tc.Expected, tc.G.FieldByPointer(tc.PTR))
			assert.Equal(tt, tc.Expected != nil, tc.G.HasField(tc.Input))
		})
	}
}

func TestSchemaGroup_SetTitle(t *testing.T) {
	sg := NewSchemaGroup().ID(id.PropertySchemaFieldID("aa")).Schema(id.MustPropertySchemaID("xx/aa")).Fields([]*SchemaField{sf}).MustBuild()
	sg.SetTitle(i18n.StringFrom("ttt"))
	assert.Equal(t, i18n.StringFrom("ttt"), sg.Title())
}
