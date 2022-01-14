package plugin

import (
	"errors"
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
	res := b.Name(i18n.StringFrom("fooo")).MustBuild()
	assert.Equal(t, i18n.StringFrom("fooo"), res.Name())
}

func TestBuilder_Author(t *testing.T) {
	var b = New()
	res := b.Author("xxx").MustBuild()
	assert.Equal(t, "xxx", res.Author())
}

func TestBuilder_Description(t *testing.T) {
	var b = New()
	res := b.Description(i18n.StringFrom("ddd")).MustBuild()
	assert.Equal(t, i18n.StringFrom("ddd"), res.Description())
}

func TestBuilder_Schema(t *testing.T) {
	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res := New().Schema(tc.sid).MustBuild()
			assert.Equal(tt, tc.expected, res.Schema())
		})
	}
}

func TestBuilder_Extensions(t *testing.T) {
	b := New()
	ext := []*Extension{
		NewExtension().ID("xxx").MustBuild(),
		NewExtension().ID("yyy").MustBuild(),
	}
	res := b.Extensions(ext).MustBuild()
	assert.Equal(t, ext, res.Extensions())
}

func TestBuilder_RepositoryURL(t *testing.T) {
	var b = New()
	res := b.RepositoryURL("hoge").MustBuild()
	assert.Equal(t, "hoge", res.RepositoryURL())
}

func TestBuilder_Build(t *testing.T) {
	testCases := []struct {
		name, author, repositoryURL string
		id                          ID
		pname, description          i18n.String
		ext                         []*Extension
		schema                      *PropertySchemaID
		expected                    *Plugin
		err                         error // skip for now as error is always nil
	}{
		{
			id:            MustID("hoge~0.1.0"),
			name:          "success build new plugin",
			author:        "aaa",
			repositoryURL: "uuu",
			pname:         i18n.StringFrom("nnn"),
			description:   i18n.StringFrom("ddd"),
			ext: []*Extension{
				NewExtension().ID("xxx").MustBuild(),
				NewExtension().ID("yyy").MustBuild(),
			},
			schema: MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			p, err := New().
				ID(tc.id).
				Extensions(tc.ext).
				RepositoryURL(tc.repositoryURL).
				Description(tc.description).
				Name(tc.pname).
				Schema(tc.schema).
				Author(tc.author).
				Build()
			if tc.err == nil {
				assert.Equal(tt, tc.expected, p)
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	testCases := []struct {
		name, author, repositoryURL string
		id                          ID
		pname, description          i18n.String
		ext                         []*Extension
		schema                      *PropertySchemaID
		expected                    *Plugin
	}{
		{
			id:            MustID("hoge~0.1.0"),
			name:          "success build new plugin",
			author:        "aaa",
			repositoryURL: "uuu",
			pname:         i18n.StringFrom("nnn"),
			description:   i18n.StringFrom("ddd"),
			ext: []*Extension{
				NewExtension().ID("xxx").MustBuild(),
				NewExtension().ID("yyy").MustBuild(),
			},
			schema: MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			p := New().
				ID(tc.id).
				Extensions(tc.ext).
				RepositoryURL(tc.repositoryURL).
				Description(tc.description).
				Name(tc.pname).
				Schema(tc.schema).
				Author(tc.author).
				MustBuild()
			assert.Equal(tt, tc.expected, p)
		})
	}
}

func TestNew(t *testing.T) {
	assert.NotNil(t, New())
}
