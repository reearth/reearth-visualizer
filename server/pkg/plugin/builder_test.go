package plugin

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_ID(t *testing.T) {
	var b = New()
	res := b.ID(MustID("aaa~1.1.1")).MustBuild()
	assert.Equal(t, MustID("aaa~1.1.1"), res.ID())
}

func TestBuilder_Name(t *testing.T) {
	var b = New()
	res := b.ID(MustID("aaa~1.1.1")).Name(i18n.StringFrom("fooo")).MustBuild()
	assert.Equal(t, i18n.StringFrom("fooo"), res.Name())
}

func TestBuilder_Author(t *testing.T) {
	var b = New()
	res := b.ID(MustID("aaa~1.1.1")).Author("xxx").MustBuild()
	assert.Equal(t, "xxx", res.Author())
}

func TestBuilder_Description(t *testing.T) {
	var b = New()
	res := b.ID(MustID("aaa~1.1.1")).Description(i18n.StringFrom("ddd")).MustBuild()
	assert.Equal(t, i18n.StringFrom("ddd"), res.Description())
}

func TestBuilder_Schema(t *testing.T) {
	tests := []struct {
		name          string
		sid, expected *PropertySchemaID
	}{
		{
			name:     "nil schema",
			sid:      nil,
			expected: nil,
		},
		{
			name:     "build schema",
			sid:      MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
			expected: MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := New().ID(MustID("aaa~1.1.1")).Schema(tt.sid).MustBuild()
			assert.Equal(t, tt.expected, res.Schema())
		})
	}
}

func TestBuilder_Extensions(t *testing.T) {
	b := New()
	ext := []*Extension{
		NewExtension().ID("xxx").MustBuild(),
		NewExtension().ID("yyy").MustBuild(),
	}
	res := b.ID(MustID("aaa~1.1.1")).Extensions(ext).MustBuild()
	assert.Equal(t, ext, res.Extensions())
}

func TestBuilder_RepositoryURL(t *testing.T) {
	var b = New()
	res := b.ID(MustID("aaa~1.1.1")).RepositoryURL("hoge").MustBuild()
	assert.Equal(t, "hoge", res.RepositoryURL())
}

func TestBuilder_Build(t *testing.T) {
	type args struct {
		id                    ID
		author, repositoryURL string
		pname, description    i18n.String
		ext                   []*Extension
		schema                *PropertySchemaID
	}

	tests := []struct {
		name     string
		args     args
		expected *Plugin
		err      error // skip for now as error is always nil
	}{
		{
			name: "success build new plugin",
			args: args{
				id:            MustID("hoge~0.1.0"),
				author:        "aaa",
				repositoryURL: "uuu",
				pname:         i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				ext: []*Extension{
					NewExtension().ID("xxx").MustBuild(),
					NewExtension().ID("yyy").MustBuild(),
				},
				schema: MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
			},
			expected: &Plugin{
				id:            MustID("hoge~0.1.0"),
				name:          i18n.StringFrom("nnn"),
				author:        "aaa",
				description:   i18n.StringFrom("ddd"),
				repositoryURL: "uuu",
				extensions: map[ExtensionID]*Extension{
					ExtensionID("xxx"): NewExtension().ID("xxx").MustBuild(),
					ExtensionID("yyy"): NewExtension().ID("yyy").MustBuild(),
				},
				extensionOrder: []ExtensionID{ExtensionID("xxx"), ExtensionID("yyy")},
				schema:         MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p, err := New().
				ID(tt.args.id).
				Extensions(tt.args.ext).
				RepositoryURL(tt.args.repositoryURL).
				Description(tt.args.description).
				Name(tt.args.pname).
				Schema(tt.args.schema).
				Author(tt.args.author).
				Build()
			if tt.err == nil {
				assert.Equal(t, tt.expected, p)
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	type args struct {
		author, repositoryURL string
		id                    ID
		pname, description    i18n.String
		ext                   []*Extension
		schema                *PropertySchemaID
	}

	tests := []struct {
		name     string
		args     args
		expected *Plugin
		err      error // skip for now as error is always nil
	}{
		{
			name: "success build new plugin",
			args: args{
				id:            MustID("hoge~0.1.0"),
				author:        "aaa",
				repositoryURL: "uuu",
				pname:         i18n.StringFrom("nnn"),
				description:   i18n.StringFrom("ddd"),
				ext: []*Extension{
					NewExtension().ID("xxx").MustBuild(),
					NewExtension().ID("yyy").MustBuild(),
				},
				schema: MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
			},
			expected: &Plugin{
				id:            MustID("hoge~0.1.0"),
				name:          i18n.StringFrom("nnn"),
				author:        "aaa",
				description:   i18n.StringFrom("ddd"),
				repositoryURL: "uuu",
				extensions: map[ExtensionID]*Extension{
					ExtensionID("xxx"): NewExtension().ID("xxx").MustBuild(),
					ExtensionID("yyy"): NewExtension().ID("yyy").MustBuild(),
				},
				extensionOrder: []ExtensionID{ExtensionID("xxx"), ExtensionID("yyy")},
				schema:         MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			build := func() *Plugin {
				t.Helper()
				return New().
					ID(tt.args.id).
					Extensions(tt.args.ext).
					RepositoryURL(tt.args.repositoryURL).
					Description(tt.args.description).
					Name(tt.args.pname).
					Schema(tt.args.schema).
					Author(tt.args.author).
					MustBuild()
			}

			if tt.err != nil {
				assert.PanicsWithValue(t, tt.err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.expected, build())
			}
		})
	}
}

func TestNew(t *testing.T) {
	assert.NotNil(t, New())
}
