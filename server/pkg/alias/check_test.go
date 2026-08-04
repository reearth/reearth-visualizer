package alias

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCheckAliasPatternScene(t *testing.T) {
	tests := []struct {
		name    string
		alias   string
		wantErr bool
	}{
		// Valid aliases
		{name: "minimum length (5)", alias: "abcde", wantErr: false},
		{name: "maximum length (32)", alias: "abcdefghijklmnopqrstuvwxyz012345", wantErr: false},
		{name: "with hyphens in middle", alias: "my-project-alias", wantErr: false},
		{name: "alphanumeric only", alias: "myproject123", wantErr: false},
		{name: "starts and ends with digit", alias: "1project1", wantErr: false},
		// Too short
		{name: "too short (4 chars)", alias: "abcd", wantErr: true},
		{name: "too short (1 char)", alias: "a", wantErr: true},
		{name: "empty string", alias: "", wantErr: false}, // empty is allowed (no alias set)
		// Too long
		{name: "too long (33 chars)", alias: "abcdefghijklmnopqrstuvwxyz0123456", wantErr: true},
		// Invalid start/end
		{name: "starts with hyphen", alias: "-myalias", wantErr: true},
		{name: "ends with hyphen", alias: "myalias-", wantErr: true},
		{name: "starts and ends with hyphen", alias: "-myalias-", wantErr: true},
		// Invalid characters
		{name: "contains underscore", alias: "my_alias", wantErr: true},
		{name: "contains space", alias: "my alias", wantErr: true},
		{name: "contains dot", alias: "my.alias", wantErr: true},
		// Reserved words
		{name: "reserved word: admin", alias: "admin", wantErr: true},
		{name: "reserved word: localhost", alias: "localhost", wantErr: true},
		{name: "reserved word: dashboard", alias: "dashboard", wantErr: true},
		{name: "reserved word: reearth", alias: "reearth", wantErr: true},
		{name: "reserved word: api", alias: "api", wantErr: true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			err := CheckAliasPatternScene(tt.alias)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestCheckAliasPatternStorytelling(t *testing.T) {
	tests := []struct {
		name    string
		alias   string
		wantErr bool
	}{
		{name: "valid alias", alias: "my-story", wantErr: false},
		{name: "too short", alias: "abc", wantErr: true},
		{name: "ends with hyphen", alias: "mystory-", wantErr: true},
		{name: "reserved word: admin", alias: "admin", wantErr: true},
		{name: "empty string", alias: "", wantErr: false},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			err := CheckAliasPatternStorytelling(tt.alias)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
