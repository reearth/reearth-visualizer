package property

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupBuilder_Build(t *testing.T) {
	iid := NewItemID()
	sid := MustSchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()
	testCases := []struct {
		Name        string
		Id          ItemID
		Schema      SchemaID
		SchemaGroup SchemaGroupID
		Fields      []*Field
		Expected    struct {
			Id          ItemID
			Schema      SchemaID
			SchemaGroup SchemaGroupID
			Fields      []*Field
		}
		Err error
	}{
		{
			Name: "fail invalid id",
			Err:  ErrInvalidID,
		},
		{
			Name:        "success",
			Id:          iid,
			Schema:      sid,
			SchemaGroup: "a",
			Fields:      []*Field{f},
			Expected: struct {
				Id          ItemID
				Schema      SchemaID
				SchemaGroup SchemaGroupID
				Fields      []*Field
			}{
				Id:          iid,
				Schema:      sid,
				SchemaGroup: "a",
				Fields:      []*Field{f},
			},
			Err: nil,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewGroup().ID(tc.Id).Fields(tc.Fields).Schema(tc.Schema, tc.SchemaGroup).Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.Fields, res.Fields())
				assert.Equal(tt, tc.Expected.Schema, res.Schema())
				assert.Equal(tt, tc.Expected.SchemaGroup, res.SchemaGroup())
				assert.Equal(tt, tc.Expected.Id, res.ID())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}

func TestGroupBuilder_MustBuild(t *testing.T) {
	iid := NewItemID()
	sid := MustSchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()
	testCases := []struct {
		Name        string
		Fail        bool
		Id          ItemID
		Schema      SchemaID
		SchemaGroup SchemaGroupID
		Fields      []*Field
		Expected    struct {
			Id          ItemID
			Schema      SchemaID
			SchemaGroup SchemaGroupID
			Fields      []*Field
		}
	}{
		{
			Name: "fail invalid id",
			Fail: true,
		},
		{
			Name:        "success",
			Id:          iid,
			Schema:      sid,
			SchemaGroup: "a",
			Fields:      []*Field{f},
			Expected: struct {
				Id          ItemID
				Schema      SchemaID
				SchemaGroup SchemaGroupID
				Fields      []*Field
			}{
				Id:          iid,
				Schema:      sid,
				SchemaGroup: "a",
				Fields:      []*Field{f},
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var res *Group
			if tc.Fail {
				defer func() {
					if r := recover(); r != nil {
						assert.Nil(tt, res)
					}
				}()
				res = NewGroup().ID(tc.Id).Fields(tc.Fields).Schema(tc.Schema, tc.SchemaGroup).MustBuild()
			} else {
				res = NewGroup().ID(tc.Id).Fields(tc.Fields).Schema(tc.Schema, tc.SchemaGroup).MustBuild()
				assert.Equal(tt, tc.Expected.Fields, res.Fields())
				assert.Equal(tt, tc.Expected.Schema, res.Schema())
				assert.Equal(tt, tc.Expected.SchemaGroup, res.SchemaGroup())
				assert.Equal(tt, tc.Expected.Id, res.ID())
			}

		})
	}
}

func TestGroupBuilder_NewID(t *testing.T) {
	g := NewGroup().NewID().MustBuild()
	assert.False(t, g.ID().IsNil())
}

func TestGroupBuilder_InitGroupFrom(t *testing.T) {
	var sg *SchemaGroup
	assert.Nil(t, InitGroupFrom(sg))
	sg = NewSchemaGroup().ID("a").Schema(MustSchemaID("xx~1.0.0/aa")).MustBuild()
	g := InitGroupFrom(sg)
	assert.Equal(t, sg.ID(), g.SchemaGroup())
	assert.Equal(t, sg.Schema(), g.Schema())
}
