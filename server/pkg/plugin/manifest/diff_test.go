package manifest

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestDiffFrom(t *testing.T) {
	oldp := plugin.MustID("aaaaaa~1.0.0")
	newp := plugin.MustID("aaaaaa~1.1.0")
	oldps := property.MustSchemaID("aaaaaa~1.0.0/@")
	olde1ps := property.MustSchemaID("aaaaaa~1.0.0/a")
	olde2ps := property.MustSchemaID("aaaaaa~1.0.0/b")
	olde3ps := property.MustSchemaID("aaaaaa~1.0.0/c")
	olde4ps := property.MustSchemaID("aaaaaa~1.0.0/d")
	olde5ps := property.MustSchemaID("aaaaaa~1.0.0/e")
	newe1ps := property.MustSchemaID("aaaaaa~1.1.0/a")
	old := Manifest{
		Plugin: plugin.New().ID(oldp).Schema(&oldps).Extensions([]*plugin.Extension{
			plugin.NewExtension().ID("a").Schema(olde1ps).Type(plugin.ExtensionTypeBlock).MustBuild(),
			plugin.NewExtension().ID("b").Schema(olde2ps).MustBuild(), // deleted
			plugin.NewExtension().ID("c").Schema(olde3ps).Type(plugin.ExtensionTypeBlock).MustBuild(),
			plugin.NewExtension().ID("d").Schema(olde4ps).Type(plugin.ExtensionTypeBlock).MustBuild(),
			plugin.NewExtension().ID("e").Schema(olde5ps).Type(plugin.ExtensionTypeBlock).MustBuild(),
		}).MustBuild(),
		Schema: property.NewSchema().ID(oldps).MustBuild(),
		ExtensionSchema: []*property.Schema{
			property.NewSchema().ID(olde1ps).MustBuild(),
			property.NewSchema().ID(olde2ps).MustBuild(),
			property.NewSchema().ID(olde3ps).MustBuild(),
			property.NewSchema().ID(olde4ps).MustBuild(),
			property.NewSchema().ID(olde5ps).Groups(property.NewSchemaGroupList([]*property.SchemaGroup{
				property.NewSchemaGroup().ID("x").Fields([]*property.SchemaField{
					property.NewSchemaField().ID("y").Type(property.ValueTypeString).MustBuild(),
				}).MustBuild(), // updated
			})).MustBuild(),
		},
	}
	new := Manifest{
		Plugin: plugin.New().ID(newp).Extensions([]*plugin.Extension{
			plugin.NewExtension().ID("a").Schema(newe1ps).Type(plugin.ExtensionTypePrimitive).MustBuild(), // updated
			plugin.NewExtension().ID("c").Schema(olde3ps).Type(plugin.ExtensionTypeBlock).MustBuild(),     // same
			plugin.NewExtension().ID("d").Schema(olde4ps).Type(plugin.ExtensionTypeBlock).MustBuild(),     // property schema update
			plugin.NewExtension().ID("e").Schema(olde5ps).Type(plugin.ExtensionTypeBlock).MustBuild(),     // property schema update
		}).MustBuild(),
		ExtensionSchema: []*property.Schema{
			property.NewSchema().ID(newe1ps).MustBuild(),
			property.NewSchema().ID(olde3ps).MustBuild(),
			property.NewSchema().ID(olde4ps).Groups(property.NewSchemaGroupList([]*property.SchemaGroup{
				property.NewSchemaGroup().ID("x").MustBuild(), // added
			})).MustBuild(),
			property.NewSchema().ID(olde5ps).Groups(property.NewSchemaGroupList([]*property.SchemaGroup{
				property.NewSchemaGroup().ID("x").Fields([]*property.SchemaField{
					property.NewSchemaField().ID("y").Type(property.ValueTypeBool).MustBuild(),
				}).MustBuild(), // updated
			})).MustBuild(),
		},
	}

	type args struct {
		old Manifest
		new Manifest
	}
	tests := []struct {
		name string
		args args
		want Diff
	}{
		{
			name: "diff",
			args: args{old: old, new: new},
			want: Diff{
				From:                  oldp,
				To:                    newp,
				PropertySchemaDiff:    property.SchemaDiff{From: oldps},
				PropertySchemaDeleted: true,
				DeletedExtensions:     []DiffExtensionDeleted{{ExtensionID: "b", PropertySchemaID: olde2ps}},
				UpdatedExtensions: []DiffExtensionUpdated{
					{
						ExtensionID:        "a",
						OldType:            plugin.ExtensionTypeBlock,
						NewType:            plugin.ExtensionTypePrimitive,
						PropertySchemaDiff: property.SchemaDiff{From: olde1ps, To: newe1ps},
					},
					{
						ExtensionID: "e",
						OldType:     plugin.ExtensionTypeBlock,
						NewType:     plugin.ExtensionTypeBlock,
						PropertySchemaDiff: property.SchemaDiff{
							From: olde5ps,
							To:   olde5ps,
							TypeChanged: []property.SchemaDiffTypeChanged{
								{SchemaFieldPointer: property.SchemaFieldPointer{SchemaGroup: "x", Field: "y"}, NewType: property.ValueTypeBool},
							},
						},
					},
				},
			},
		},
		{
			name: "same",
			args: args{
				old: old,
				new: old,
			},
			want: Diff{
				From:               oldp,
				To:                 oldp,
				PropertySchemaDiff: property.SchemaDiff{From: oldps, To: oldps},
			},
		},
		{
			name: "nil",
			args: args{},
			want: Diff{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, DiffFrom(tt.args.old, tt.args.new))
		})
	}
}

func TestDiff_IsEmpty(t *testing.T) {
	tests := []struct {
		name   string
		target *Diff
		want   bool
	}{
		{
			name: "presemt",
			target: &Diff{
				PropertySchemaDeleted: true,
			},
			want: false,
		},
		{
			name:   "empty",
			target: &Diff{},
			want:   true,
		},
		{
			name: "empty2",
			target: &Diff{
				From: plugin.MustID("a~1.0.0"),
			},
			want: true,
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

func TestDiff_DeletedPropertySchemas(t *testing.T) {
	ps1 := property.MustSchemaID("a~1.0.0/a")
	ps2 := property.MustSchemaID("a~1.0.0/b")
	tests := []struct {
		name   string
		target Diff
		want   []property.SchemaID
	}{
		{
			name: "ok",
			target: Diff{
				PropertySchemaDiff: property.SchemaDiff{
					From: ps1,
				},
				PropertySchemaDeleted: true,
				DeletedExtensions: []DiffExtensionDeleted{
					{PropertySchemaID: ps2},
					{PropertySchemaID: ps2},
				},
			},
			want: []property.SchemaID{
				ps1,
				ps2,
			},
		},
		{
			name:   "empty",
			target: Diff{},
			want:   []property.SchemaID{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.DeletedPropertySchemas())
		})
	}
}

func TestDiff_PropertySchmaDiffs(t *testing.T) {
	ps1 := property.MustSchemaID("a~1.0.0/a")
	ps2 := property.MustSchemaID("a~1.0.0/b")
	tests := []struct {
		name   string
		target Diff
		want   property.SchemaDiffList
	}{
		{
			name: "ok",
			target: Diff{
				PropertySchemaDiff: property.SchemaDiff{
					From: ps1,
				},
				UpdatedExtensions: []DiffExtensionUpdated{
					{PropertySchemaDiff: property.SchemaDiff{
						From: ps2,
					}},
				},
			},
			want: property.SchemaDiffList{
				{
					From: ps1,
				},
				{
					From: ps2,
				},
			},
		},
		{
			name:   "empty",
			target: Diff{},
			want:   property.SchemaDiffList{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.PropertySchmaDiffs())
		})
	}
}
