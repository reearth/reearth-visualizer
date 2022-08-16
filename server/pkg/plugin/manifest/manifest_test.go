package manifest

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestManifest_PropertySchemas(t *testing.T) {
	s1 := property.NewSchema().ID(property.MustSchemaID("xx~1.0.0/aa")).MustBuild()
	s2 := property.NewSchema().ID(property.MustSchemaID("xx~1.0.0/bb")).MustBuild()

	tests := []struct {
		name   string
		target Manifest
		want   property.SchemaList
	}{
		{
			name: "schema and extensions",
			target: Manifest{
				Schema:          s1,
				ExtensionSchema: property.SchemaList{s2},
			},
			want: property.SchemaList{s2, s1},
		},
		{
			name: "schema only",
			target: Manifest{
				Schema: s1,
			},
			want: property.SchemaList{s1},
		},
		{
			name: "extensions only",
			target: Manifest{
				ExtensionSchema: property.SchemaList{s2},
			},
			want: property.SchemaList{s2},
		},
		{
			name:   "empty",
			target: Manifest{},
			want:   property.SchemaList{},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.PropertySchemas())
		})
	}
}

func TestManifest_PropertySchema(t *testing.T) {
	s1 := property.NewSchema().ID(property.MustSchemaID("xx~1.0.0/aa")).MustBuild()
	s2 := property.NewSchema().ID(property.MustSchemaID("xx~1.0.0/bb")).MustBuild()
	m := Manifest{
		Schema:          s1,
		ExtensionSchema: property.SchemaList{s2},
	}

	type args struct {
		psid property.SchemaID
	}
	tests := []struct {
		name   string
		target Manifest
		args   args
		want   *property.Schema
	}{
		{
			name:   "schema",
			target: m,
			args:   args{psid: s1.ID()},
			want:   s1,
		},
		{
			name:   "extension",
			target: m,
			args:   args{psid: s2.ID()},
			want:   s2,
		},
		{
			name:   "empty",
			target: Manifest{},
			args:   args{psid: s2.ID()},
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			res := tt.target.PropertySchema(tt.args.psid)
			if tt.want == nil {
				assert.Nil(t, res)
			} else {
				assert.Same(t, tt.want, res)
			}
		})
	}
}
