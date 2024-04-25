package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestSchemaDiffFrom(t *testing.T) {
	ps1 := MustSchemaID("x~1.0.0/a")
	ps2 := MustSchemaID("x~1.0.0/b")

	type args struct {
		old *Schema
		new *Schema
	}
	tests := []struct {
		name string
		args args
		want SchemaDiff
	}{
		{
			name: "diff",
			args: args{
				old: &Schema{
					id: ps1,
					groups: &SchemaGroupList{groups: []*SchemaGroup{
						{id: "a", fields: []*SchemaField{
							{id: "aa", propertyType: ValueTypeString}, // deleted
							{id: "ab", propertyType: ValueTypeString},
							{id: "ac", propertyType: ValueTypeString},
							{id: "ad", propertyType: ValueTypeString},
						}},
					}},
				},
				new: &Schema{
					id: ps2,
					groups: &SchemaGroupList{groups: []*SchemaGroup{
						{id: "a", fields: []*SchemaField{
							{id: "ab", propertyType: ValueTypeNumber}, // type changed
							{id: "ae", propertyType: ValueTypeString}, // added
						}},
						{id: "b", list: true, fields: []*SchemaField{
							{id: "ac", propertyType: ValueTypeString}, // moved
							{id: "ad", propertyType: ValueTypeNumber}, // moved and type changed
						}},
					}},
				},
			},
			want: SchemaDiff{
				From: ps1,
				To:   ps2,
				Deleted: []SchemaDiffDeleted{
					{SchemaGroup: "a", Field: "aa"},
				},
				Moved: []SchemaDiffMoved{
					{From: SchemaFieldPointer{SchemaGroup: "a", Field: "ac"}, To: SchemaFieldPointer{SchemaGroup: "b", Field: "ac"}, ToList: true},
					{From: SchemaFieldPointer{SchemaGroup: "a", Field: "ad"}, To: SchemaFieldPointer{SchemaGroup: "b", Field: "ad"}, ToList: true},
				},
				TypeChanged: []SchemaDiffTypeChanged{
					{SchemaFieldPointer: SchemaFieldPointer{SchemaGroup: "a", Field: "ab"}, NewType: ValueTypeNumber},
					{SchemaFieldPointer: SchemaFieldPointer{SchemaGroup: "b", Field: "ad"}, NewType: ValueTypeNumber},
				},
			},
		},
		{
			name: "no diff",
			args: args{
				old: &Schema{
					id: ps1,
					groups: &SchemaGroupList{groups: []*SchemaGroup{
						{id: "a", fields: []*SchemaField{
							{id: "aa", propertyType: ValueTypeNumber},
						}},
					}},
				},
				new: &Schema{
					id: ps2,
					groups: &SchemaGroupList{groups: []*SchemaGroup{
						{id: "a", fields: []*SchemaField{
							{id: "aa", propertyType: ValueTypeNumber},
						}},
						{id: "b", list: true, fields: []*SchemaField{
							{id: "ba", propertyType: ValueTypeString}, // added
						}},
					}},
				},
			},
			want: SchemaDiff{
				From: ps1,
				To:   ps2,
			},
		},
		{
			name: "same schemas",
			args: args{
				old: testSchema1,
				new: testSchema1,
			},
			want: SchemaDiff{
				From: testSchema1.ID(),
				To:   testSchema1.ID(),
			},
		},
		{
			name: "nil",
			args: args{
				old: nil,
				new: nil,
			},
			want: SchemaDiff{},
		},
		{
			name: "old nil",
			args: args{
				old: nil,
				new: testSchema1,
			},
			want: SchemaDiff{
				To: testSchema1.ID(),
			},
		},
		{
			name: "new nil",
			args: args{
				old: testSchema1,
				new: nil,
			},
			want: SchemaDiff{
				From: testSchema1.ID(),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, SchemaDiffFrom(tt.args.old, tt.args.new))
		})
	}
}

func TestSchemaDiffFromProperty(t *testing.T) {
	ps := MustSchemaID("x~1.0.0/a")

	type args struct {
		old *Property
		new *Schema
	}
	tests := []struct {
		name string
		args args
		want SchemaDiff
	}{
		{
			name: "diff",
			args: args{
				old: testProperty1,
				new: &Schema{
					id: ps,
					groups: &SchemaGroupList{groups: []*SchemaGroup{
						{id: testSchemaGroup1.ID(), fields: []*SchemaField{
							{id: testSchemaField1.ID(), propertyType: ValueTypeNumber}, // type changed
							{id: testSchemaField3.ID(), propertyType: ValueTypeNumber}, // moved and type changed
							{id: "xxxx", propertyType: ValueTypeString},                // added
						}},
						{id: testSchemaGroup2.ID(), list: true, fields: []*SchemaField{}},
					}},
				},
			},
			want: SchemaDiff{
				From:    testProperty1.Schema(),
				To:      ps,
				Deleted: nil,
				Moved: []SchemaDiffMoved{
					{
						From: SchemaFieldPointer{SchemaGroup: testSchemaGroup2.ID(), Field: testSchemaField3.ID()},
						To:   SchemaFieldPointer{SchemaGroup: testSchemaGroup1.ID(), Field: testSchemaField3.ID()},
					},
				},
				TypeChanged: []SchemaDiffTypeChanged{
					{SchemaFieldPointer: SchemaFieldPointer{SchemaGroup: testSchemaGroup1.ID(), Field: testSchemaField1.ID()}, NewType: ValueTypeNumber},
					{SchemaFieldPointer: SchemaFieldPointer{SchemaGroup: testSchemaGroup1.ID(), Field: testSchemaField3.ID()}, NewType: ValueTypeNumber},
				},
			},
		},
		{
			name: "no diff",
			args: args{
				old: testProperty1,
				new: testSchema1,
			},
			want: SchemaDiff{
				From: testProperty1.Schema(),
				To:   testSchema1.ID(),
			},
		},
		{
			name: "nil",
			args: args{
				old: nil,
				new: nil,
			},
			want: SchemaDiff{},
		},
		{
			name: "old nil",
			args: args{
				old: nil,
				new: testSchema1,
			},
			want: SchemaDiff{
				To: testSchema1.ID(),
			},
		},
		{
			name: "new nil",
			args: args{
				old: testProperty1,
				new: nil,
			},
			want: SchemaDiff{
				From: testProperty1.Schema(),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, SchemaDiffFromProperty(tt.args.old, tt.args.new))
		})
	}
}

func TestSchemaDiff_Migrate(t *testing.T) {
	itemID := NewItemID()
	newSchemaID := MustSchemaID("x~1.0.0/ax")

	tests := []struct {
		name         string
		target       *SchemaDiff
		args         *Property
		want         bool
		wantProperty *Property
		only         bool
	}{
		{
			name: "deleted and type changed",
			target: &SchemaDiff{
				To: newSchemaID,
				Deleted: []SchemaDiffDeleted{
					{SchemaGroup: testGroup1.SchemaGroup(), Field: testField1.Field()},
				},
				TypeChanged: []SchemaDiffTypeChanged{
					{SchemaFieldPointer: SchemaFieldPointer{SchemaGroup: testGroupList1.SchemaGroup(), Field: testField2.Field()}, NewType: ValueTypeString},
				},
			},
			args: testProperty1.Clone(),
			want: true,
			wantProperty: &Property{
				id:     testProperty1.ID(),
				scene:  testProperty1.Scene(),
				schema: newSchemaID,
				items: []Item{
					&Group{
						itemBase: itemBase{
							ID:          testGroup1.ID(),
							SchemaGroup: testGroup1.SchemaGroup(),
						},
						fields: []*Field{}, // deleted
					},
					&GroupList{
						itemBase: itemBase{
							ID:          testGroupList1.ID(),
							SchemaGroup: testGroupList1.SchemaGroup(),
						},
						groups: []*Group{
							{
								itemBase: itemBase{
									ID:          testGroup2.ID(),
									SchemaGroup: testGroup2.SchemaGroup(),
								},
								fields: []*Field{
									{field: testField2.Field(), v: NewOptionalValue(ValueTypeString, nil)}, // type changed
								},
							},
						},
					},
				},
			},
		},
		{
			name: "moved",
			target: &SchemaDiff{
				To: newSchemaID,
				Moved: []SchemaDiffMoved{
					{
						From: SchemaFieldPointer{SchemaGroup: testGroup1.SchemaGroup(), Field: testField1.Field()},
						To:   SchemaFieldPointer{SchemaGroup: "x", Field: testField1.Field()},
					},
				},
			},
			args: testProperty1.Clone(),
			want: true,
			wantProperty: &Property{
				id:     testProperty1.ID(),
				scene:  testProperty1.Scene(),
				schema: newSchemaID,
				items: []Item{
					&Group{
						itemBase: itemBase{
							ID:          testGroup1.ID(),
							SchemaGroup: testGroup1.SchemaGroup(),
						},
						fields: []*Field{}, // deleted
					},
					testGroupList1,
					&Group{
						itemBase: itemBase{
							ID:          itemID,
							SchemaGroup: "x",
						},
						fields: []*Field{testField1},
					},
				},
			},
		},
		{
			name: "moved and type changed",
			target: &SchemaDiff{
				To: newSchemaID,
				Moved: []SchemaDiffMoved{
					{
						From: SchemaFieldPointer{SchemaGroup: testGroup1.SchemaGroup(), Field: testField1.Field()},
						To:   SchemaFieldPointer{SchemaGroup: "x", Field: testField1.Field()},
					},
				},
				TypeChanged: []SchemaDiffTypeChanged{
					{SchemaFieldPointer: SchemaFieldPointer{SchemaGroup: "x", Field: testField1.Field()}, NewType: ValueTypeNumber},
				},
			},
			args: testProperty1.Clone(),
			want: true,
			wantProperty: &Property{
				id:     testProperty1.ID(),
				scene:  testProperty1.Scene(),
				schema: newSchemaID,
				items: []Item{
					&Group{
						itemBase: itemBase{
							ID:          testGroup1.ID(),
							SchemaGroup: testGroup1.SchemaGroup(),
						},
						fields: []*Field{}, // deleted
					},
					testGroupList1,
					&Group{
						itemBase: itemBase{
							ID:          itemID,
							SchemaGroup: "x",
						},
						fields: []*Field{
							{field: testField1.Field(), v: NewOptionalValue(ValueTypeNumber, nil)},
						},
					},
				},
			},
		},
		{
			name: "group -> list",
			target: &SchemaDiff{
				To: newSchemaID,
				Moved: []SchemaDiffMoved{
					{
						From: SchemaFieldPointer{SchemaGroup: testGroup1.SchemaGroup(), Field: testField1.Field()},
						To:   SchemaFieldPointer{SchemaGroup: testGroup2.SchemaGroup(), Field: testField1.Field()},
					},
				},
			},
			args: testProperty1.Clone(),
			want: true,
			wantProperty: &Property{
				id:     testProperty1.ID(),
				scene:  testProperty1.Scene(),
				schema: newSchemaID,
				items: []Item{
					&Group{
						itemBase: itemBase{
							ID:          testGroup1.ID(),
							SchemaGroup: testGroup1.SchemaGroup(),
						},
						fields: []*Field{}, // deleted
					},
					testGroupList1,
				},
			},
		},
		{
			name: "group -> list (ToList)",
			target: &SchemaDiff{
				To: newSchemaID,
				Moved: []SchemaDiffMoved{
					{
						From:   SchemaFieldPointer{SchemaGroup: testGroup1.SchemaGroup(), Field: testField1.Field()},
						To:     SchemaFieldPointer{SchemaGroup: testGroup2.SchemaGroup(), Field: testField1.Field()},
						ToList: true,
					},
				},
			},
			args: testProperty1.Clone(),
			want: true,
			wantProperty: &Property{
				id:     testProperty1.ID(),
				scene:  testProperty1.Scene(),
				schema: newSchemaID,
				items: []Item{
					&Group{
						itemBase: itemBase{
							ID:          testGroup1.ID(),
							SchemaGroup: testGroup1.SchemaGroup(),
						},
						fields: []*Field{}, // deleted
					},
					testGroupList1,
				},
			},
		},
		{
			name: "list -> group",
			target: &SchemaDiff{
				To: newSchemaID,
				Moved: []SchemaDiffMoved{
					{
						From: SchemaFieldPointer{SchemaGroup: testGroup2.SchemaGroup(), Field: testField2.Field()},
						To:   SchemaFieldPointer{SchemaGroup: testGroup1.SchemaGroup(), Field: testField2.Field()},
					},
				},
			},
			args: testProperty1.Clone(),
			want: true,
			wantProperty: &Property{
				id:     testProperty1.ID(),
				scene:  testProperty1.Scene(),
				schema: newSchemaID,
				items: []Item{
					testGroup1,
					&GroupList{
						itemBase: itemBase{
							ID:          testGroupList1.ID(),
							SchemaGroup: testGroupList1.SchemaGroup(),
						},
						groups: []*Group{
							{
								itemBase: itemBase{
									ID:          testGroup2.ID(),
									SchemaGroup: testGroup2.SchemaGroup(),
								},
								fields: []*Field{}, // deleted
							},
						},
					},
				},
			},
		},
		{
			name:         "empty",
			target:       &SchemaDiff{},
			args:         testProperty1,
			want:         false,
			wantProperty: testProperty1,
		},
		{
			name: "nil property",
			target: &SchemaDiff{
				To:      newSchemaID,
				Deleted: []SchemaDiffDeleted{{SchemaGroup: testGroup1.SchemaGroup(), Field: testField1.Field()}},
			},
			args:         nil,
			want:         false,
			wantProperty: nil,
		},
		{
			name:         "nil",
			target:       nil,
			args:         nil,
			want:         false,
			wantProperty: nil,
		},
	}

	only := false
	for _, tt := range tests {
		if tt.only {
			only = true
			break
		}
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// t.Parallel() // Cannot run tests in parallel due to mocking NewItemID
			if only && !tt.only {
				t.SkipNow()
			}
			defer mockNewItemID(itemID)()
			assert.Equal(t, tt.want, tt.target.Migrate(tt.args))
			assert.Equal(t, tt.wantProperty, tt.args)
		})
	}
}

func TestSchemaDiff_IsEmpty(t *testing.T) {
	tests := []struct {
		name   string
		target *SchemaDiff
		want   bool
	}{
		{
			name: "present",
			target: &SchemaDiff{
				Deleted: []SchemaDiffDeleted{{SchemaGroup: "", Field: ""}},
			},
			want: false,
		},
		{
			name:   "empty",
			target: &SchemaDiff{},
			want:   true,
		},
		{
			name:   "nil",
			target: nil,
			want:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.IsEmpty())
		})
	}
}

func TestSchemaDiff_IsIDChanged(t *testing.T) {
	tests := []struct {
		name   string
		target *SchemaDiff
		want   bool
	}{
		{
			name: "changed1",
			target: &SchemaDiff{
				From: id.MustPropertySchemaID("a~1.0.0/a"),
				To:   id.MustPropertySchemaID("a~1.0.1/a"),
			},
			want: true,
		},
		{
			name: "changed2",
			target: &SchemaDiff{
				From: id.MustPropertySchemaID("a~1.0.0/a"),
			},
			want: true,
		},
		{
			name: "changed3",
			target: &SchemaDiff{
				To: id.MustPropertySchemaID("a~1.0.0/a"),
			},
			want: true,
		},
		{
			name: "unchanged1",
			target: &SchemaDiff{
				From: id.MustPropertySchemaID("a~1.0.0/a"),
				To:   id.MustPropertySchemaID("a~1.0.0/a"),
			},
			want: false,
		},
		{
			name:   "empty",
			target: &SchemaDiff{},
			want:   false,
		},
		{
			name:   "nil",
			target: nil,
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.IsIDChanged())
		})
	}
}

func TestSchemaDiffList_FindByFrom(t *testing.T) {
	p1 := MustSchemaID("a~1.0.0/a")
	p2 := MustSchemaID("a~1.0.0/b")

	assert.Equal(t, &SchemaDiff{From: p1}, SchemaDiffList{{From: p1}}.FindByFrom(p1))
	assert.Nil(t, SchemaDiffList{}.FindByFrom(p2))
	assert.Nil(t, SchemaDiffList{}.FindByFrom(p1))
	assert.Nil(t, SchemaDiffList(nil).FindByFrom(p1))
}

func TestSchemaDiffList_FromSchemas(t *testing.T) {
	p1 := MustSchemaID("a~1.0.0/a")
	p2 := MustSchemaID("a~1.0.0/b")

	assert.Equal(t, []SchemaID{p1, p2}, SchemaDiffList{{From: p1}, {From: p2}, {From: p2}}.FromSchemas())
	assert.Nil(t, SchemaDiffList{}.FromSchemas())
	assert.Nil(t, SchemaDiffList(nil).FromSchemas())
}
