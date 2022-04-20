package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	testSchemaGroupList1 = NewSchemaGroupList([]*SchemaGroup{testSchemaGroup1, testSchemaGroup2})
)

func TestNewSchemaGroupList(t *testing.T) {
	type args struct {
		p []*SchemaGroup
	}
	tests := []struct {
		name string
		args args
		want *SchemaGroupList
	}{
		{
			name: "ok",
			args: args{
				p: []*SchemaGroup{testSchemaGroup1, testSchemaGroup2},
			},
			want: &SchemaGroupList{groups: []*SchemaGroup{testSchemaGroup1, testSchemaGroup2}},
		},
		{
			name: "duplicated groups",
			args: args{
				p: []*SchemaGroup{testSchemaGroup1, testSchemaGroup1},
			},
			want: nil,
		},
		{
			name: "nil",
			args: args{
				p: nil,
			},
			want: &SchemaGroupList{groups: nil},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, NewSchemaGroupList(tt.args.p))
		})
	}
}

func TestSchemaGroupList_Field(t *testing.T) {
	tests := []struct {
		name   string
		target *SchemaGroupList
		input  FieldID
		want   *SchemaField
	}{
		{
			name: "nil schema",
		},
		{
			name:   "found",
			target: testSchemaGroupList1,
			input:  testSchemaField1.ID(),
			want:   testSchemaField1,
		},
		{
			name:   "not found",
			target: testSchemaGroupList1,
			input:  FieldID("zz"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Field(tt.input))
		})
	}
}

func TestSchemaGroupList_Group(t *testing.T) {
	tests := []struct {
		name   string
		target *SchemaGroupList
		input  SchemaGroupID
		want   *SchemaGroup
	}{
		{
			name:   "nil schema",
			target: nil,
			input:  testSchemaGroup1.ID(),
			want:   nil,
		},
		{
			name:   "found",
			target: testSchemaGroupList1,
			input:  testSchemaGroup1.ID(),
			want:   testSchemaGroup1,
		},
		{
			name:   "not found",
			target: testSchemaGroupList1,
			input:  SchemaGroupID("zz"),
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Group(tt.input))
		})
	}
}

func TestSchemaGroupList_GroupByField(t *testing.T) {
	tests := []struct {
		name   string
		target *SchemaGroupList
		input  FieldID
		want   *SchemaGroup
	}{
		{
			name:   "nil schema",
			target: nil,
			input:  testSchemaField1.ID(),
			want:   nil,
		},
		{
			name:   "found",
			target: testSchemaGroupList1,
			input:  testSchemaField1.ID(),
			want:   testSchemaGroup1,
		},
		{
			name:   "not found",
			target: testSchemaGroupList1,
			input:  FieldID("zz"),
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.GroupByField(tt.input))
		})
	}
}

func TestSchemaGroupList_GroupAndFields(t *testing.T) {
	tests := []struct {
		name   string
		target *SchemaGroupList
		want   []SchemaGroupAndField
	}{
		{
			name:   "ok",
			target: testSchemaGroupList1,
			want: []SchemaGroupAndField{
				{Group: testSchemaGroup1, Field: testSchemaField1},
				{Group: testSchemaGroup1, Field: testSchemaField2},
				{Group: testSchemaGroup2, Field: testSchemaField3},
			},
		},
		{
			name:   "empty",
			target: &SchemaGroupList{},
			want:   []SchemaGroupAndField{},
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.GroupAndFields()
			assert.Equal(t, tt.want, res)
			if len(tt.want) > 0 {
				for i, gf := range res {
					assert.Same(t, tt.want[i].Group, gf.Group)
					assert.Same(t, tt.want[i].Field, gf.Field)
				}
			}
		})
	}
}

func TestSchemaGroupList_GroupAndField(t *testing.T) {
	type args struct {
		f FieldID
	}
	tests := []struct {
		name   string
		args   args
		target *SchemaGroupList
		want   *SchemaGroupAndField
	}{
		{
			name:   "ok1",
			target: testSchemaGroupList1,
			args:   args{f: testSchemaField1.ID()},
			want:   &SchemaGroupAndField{Group: testSchemaGroup1, Field: testSchemaField1},
		},
		{
			name:   "ok2",
			target: testSchemaGroupList1,
			args:   args{f: testSchemaField2.ID()},
			want:   &SchemaGroupAndField{Group: testSchemaGroup1, Field: testSchemaField2},
		},
		{
			name:   "ok3",
			target: testSchemaGroupList1,
			args:   args{f: testSchemaField3.ID()},
			want:   &SchemaGroupAndField{Group: testSchemaGroup2, Field: testSchemaField3},
		},
		{
			name:   "not found",
			target: testSchemaGroupList1,
			args:   args{f: "ddd"},
			want:   nil,
		},
		{
			name:   "empty",
			target: &SchemaGroupList{},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.GroupAndField(tt.args.f)
			assert.Equal(t, tt.want, res)
			if tt.want != nil {
				assert.Same(t, tt.want.Group, res.Group)
				assert.Same(t, tt.want.Field, res.Field)
			}
		})
	}
}

func TestSchemaGroupAndField_IsEmpty(t *testing.T) {
	tests := []struct {
		name   string
		target SchemaGroupAndField
		want   bool
	}{
		{
			name: "present",
			target: SchemaGroupAndField{
				Group: testSchemaGroup1,
				Field: testSchemaField1,
			},
			want: false,
		},
		{
			name:   "empty",
			target: SchemaGroupAndField{},
			want:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gf := SchemaGroupAndField{
				Group: tt.target.Group,
				Field: tt.target.Field,
			}
			assert.Equal(t, tt.want, gf.IsEmpty())
		})
	}
}

func TestSchemaGroupAndField_Pointer(t *testing.T) {
	tests := []struct {
		name   string
		target SchemaGroupAndField
		want   *Pointer
	}{
		{
			name: "ok",
			target: SchemaGroupAndField{
				Group: testSchemaGroup1,
				Field: testSchemaField1,
			},
			want: &Pointer{
				schemaGroup: testSchemaGroup1.ID().Ref(),
				item:        nil,
				field:       testSchemaField1.ID().Ref(),
			},
		},
		{
			name: "nil group",
			target: SchemaGroupAndField{
				Group: nil,
				Field: testSchemaField1,
			},
			want: &Pointer{
				schemaGroup: nil,
				item:        nil,
				field:       testSchemaField1.ID().Ref(),
			},
		},
		{
			name: "nil field",
			target: SchemaGroupAndField{
				Group: testSchemaGroup1,
				Field: nil,
			},
			want: &Pointer{
				schemaGroup: testSchemaGroup1.ID().Ref(),
				item:        nil,
				field:       nil,
			},
		},
		{
			name:   "empty",
			target: SchemaGroupAndField{},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Pointer())
		})
	}
}

func TestSchemaGroupAndField_SchemaFieldPointer(t *testing.T) {
	tests := []struct {
		name   string
		target SchemaGroupAndField
		want   SchemaFieldPointer
	}{
		{
			name: "ok",
			target: SchemaGroupAndField{
				Group: testSchemaGroup1,
				Field: testSchemaField1,
			},
			want: SchemaFieldPointer{
				SchemaGroup: testSchemaGroup1.ID(),
				Field:       testSchemaField1.ID(),
			},
		},
		{
			name:   "empty",
			target: SchemaGroupAndField{},
			want:   SchemaFieldPointer{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.SchemaFieldPointer())
		})
	}
}
