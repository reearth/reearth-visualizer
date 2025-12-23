//go:build e2e

package e2e

import (
	"fmt"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/pkg/alias"
	"golang.org/x/text/language"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

// go test -v -run TestDefaultAlias ./e2e/...

func TestDefaultAlias(t *testing.T) {
	e, result := Server(t, baseSeeder)

	projectId, sceneId, storyId := createProjectSet(e, result)

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"workspaceId": result.WID.String(),
			"pagination": map[string]any{
				"first": 16,
			},
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
		},
	}

	edges := Request(e, result.UID.String(), requestBody).
		Path("$.data.projects.edges").Array()

	// Project/Scene alias
	for _, edge := range edges.Iter() {
		node := edge.Object().Value("node").Object()
		id := node.Value("id").Raw().(string)
		if id == projectId {
			node.Value("projectAlias").IsEqual("p-" + projectId) // projectId
			node.Value("alias").IsEqual("c-" + sceneId)          // sceneId
		}
	}
	r := getScene(e, result.UID, sceneId, language.English.String())
	r.Object().Value("alias").IsEqual("c-" + sceneId) // sceneId

	// Story alias
	r = r.Path("$.stories[0]")
	r.Object().Value("alias").IsEqual("s-" + storyId) // storyId

}

/////// TestPublish Project ///////

func TestPublishProject(t *testing.T) {
	e, result := Server(t, baseSeeder)

	projectId, sceneId, _ := createProjectSet(e, result)

	// default
	res := publishProject(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     "",
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             alias.ReservedReearthPrefixScene + sceneId, // default prefix + self id
		"publishmentStatus": "LIMITED",
	})

	projectId, sceneId, _ = createProjectSet(e, result)

	// self sceneId
	res = publishProject(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     sceneId,
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             sceneId, // ok
		"publishmentStatus": "LIMITED",
	})

	// publish
	res = publishProject(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     "xxxxxxxx", // update
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             "xxxxxxxx", // update
		"publishmentStatus": "LIMITED",
	})

	// unpublish
	res = publishProject(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     "", // empty
		"status":    "PRIVATE",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             "xxxxxxxx", // keep
		"publishmentStatus": "PRIVATE",
	})

	// publish
	res = publishProject(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     "", // empty
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             "xxxxxxxx", // keep
		"publishmentStatus": "LIMITED",
	})

}

func TestPublishProjectAliasPattern(t *testing.T) {
	e, result := Server(t, baseSeeder)

	projectId, _, _ := createProjectSet(e, result)

	tests := []struct {
		name  string
		alias string
	}{
		{name: "Illegal characters1", alias: "a!aaaaa"},
		{name: "Illegal characters2", alias: "aあaaaaa"},
		{name: "Illegal characters3", alias: "-xxxxxxxxxx"}, // first hyphen
		{name: "Illegal characters4", alias: "xxxxxxxxxx-"}, // last hyphen
		{name: "Too short", alias: strings.Repeat("x", 4)},
		{name: "Too long", alias: strings.Repeat("x", 33)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := publishProjectErrors(e, result.UID, map[string]any{
				"projectId": projectId,
				"alias":     tt.alias,
				"status":    "LIMITED",
			})
			checkProjectInvalidAlias(tt.alias, res, err)
		})
	}
}

func checkProjectInvalidAlias(alias string, res *httpexpect.Value, err *httpexpect.Value) {
	message := fmt.Sprintf("Invalid alias name: %s", alias)
	description := fmt.Sprintf("The alias '%s' must be 5-32 characters long and can only contain alphanumeric, hyphen (a-z, 0-9, -).", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishProject"},
			"extensions": map[string]any{
				"code":         "invalid_alias",
				"description":  description,
				"message":      message,
				"system_error": "",
			},
		},
	})
}

func TestPublishProjectAliasReserved(t *testing.T) {
	e, result := Server(t, baseSeeder)
	projectId, _, _ := createProjectSet(e, result)

	tests := []struct {
		name  string
		alias string
	}{
		{name: "Reserved 'visualizer'", alias: "visualizer"},
		{name: "Reserved 'authentication'", alias: "authentication"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := publishProjectErrors(e, result.UID, map[string]any{
				"projectId": projectId,
				"alias":     tt.alias,
				"status":    "LIMITED",
			})
			checkProjectInvalidReservedAlias(tt.alias, res, err)
		})
	}
}

func checkProjectInvalidReservedAlias(alias string, res *httpexpect.Value, err *httpexpect.Value) {
	message := fmt.Sprintf("The alias '%s' is reserved and cannot be used.", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishProject"},
			"extensions": map[string]any{
				"code":         "invalid_reserved_alias",
				"description":  "The following aliases are reserved and cannot be used: administrator,development",
				"message":      message,
				"system_error": "",
			},
		},
	})
}

func TestPublishProjectUniqueAlias(t *testing.T) {
	e, result := Server(t, baseSeeder)
	projectId1, _, storyId1 := createProjectSet(e, result)
	_, sceneId2, storyId2 := createProjectSet(e, result)

	testCases := []struct {
		name   string
		alias  string
		expect func(res *httpexpect.Value, err *httpexpect.Value)
	}{
		{"self storyId", storyId1, checkSceneAliasAlreadyExists},
		{"other projectId", sceneId2, checkSceneAliasAlreadyExists},
		{"other storyId", storyId2, checkSceneAliasAlreadyExists},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			res, err := publishProjectErrors(e, result.UID, map[string]any{
				"projectId": projectId1,
				"alias":     tc.alias,
				"status":    "LIMITED",
			})
			tc.expect(res, err)
		})
	}
}

func checkSceneAliasAlreadyExists(res *httpexpect.Value, err *httpexpect.Value) {
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": "This alias is already in use. Please try another one.",
			"path":    []any{"publishProject"},
			"extensions": map[string]any{
				"code":         "alias_already_exists",
				"description":  "Each alias must be unique across projects and stories.",
				"message":      "This alias is already in use. Please try another one.",
				"system_error": "",
			},
		},
	})
}

func TestReservedReearthPrefixScene(t *testing.T) {
	e, result := Server(t, baseSeeder)

	projectId, sceneId, _ := createProjectSet(e, result)

	// prefix 'c-'
	res, err := publishProjectErrors(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     "c-test",
		"status":    "LIMITED",
	})
	checkReservedReearthPrefixScene("c-test", res, err)

	// prefix 's-'
	res, err = publishProjectErrors(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     "s-test",
		"status":    "LIMITED",
	})
	checkReservedReearthPrefixScene("s-test", res, err)

	// prefix + self id
	res = publishProject(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     alias.ReservedReearthPrefixScene + sceneId,
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             alias.ReservedReearthPrefixScene + sceneId, // ok
		"publishmentStatus": "LIMITED",
	})

}

func checkReservedReearthPrefixScene(alias string, res *httpexpect.Value, err *httpexpect.Value) {
	message := fmt.Sprintf("Aliases starting with 'c-' or 's-' are not allowed: %s", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishProject"},
			"extensions": map[string]any{
				"code":         "invalid_prefix_alias",
				"description":  "Aliases that start with 'c-' or 's-' are reserved and cannot be used.",
				"message":      message,
				"system_error": "",
			},
		},
	})
}

/////// TestPublishStory ///////

func TestPublishStory(t *testing.T) {
	e, result := Server(t, baseSeeder)

	_, _, storyId := createProjectSet(e, result)

	// default
	res := publishStory(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   "",
		"status":  "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                storyId,
		"alias":             alias.ReservedReearthPrefixStory + storyId, // default self id
		"publishmentStatus": "LIMITED",
	})

	_, _, storyId = createProjectSet(e, result)

	// self story id
	res = publishStory(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   storyId,
		"status":  "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                storyId,
		"alias":             storyId, // ok
		"publishmentStatus": "LIMITED",
	})

	// publish
	res = publishStory(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   "xxxxxxxx", // update
		"status":  "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                storyId,
		"alias":             "xxxxxxxx", // update
		"publishmentStatus": "LIMITED",
	})

	// unpublish
	res = publishStory(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   "", // empty
		"status":  "PRIVATE",
	})
	res.Object().IsEqual(map[string]any{
		"id":                storyId,
		"alias":             "xxxxxxxx", // keep
		"publishmentStatus": "PRIVATE",
	})

	// publish
	res = publishStory(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   "", // empty
		"status":  "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                storyId,
		"alias":             "xxxxxxxx", // keep
		"publishmentStatus": "LIMITED",
	})

}

func TestPublishStoryAliasPattern(t *testing.T) {
	e, result := Server(t, baseSeeder)

	_, _, storyId := createProjectSet(e, result)

	tests := []struct {
		name  string
		alias string
	}{
		{name: "Illegal characters1", alias: "a!aaaaa"},
		{name: "Illegal characters2", alias: "aあaaaaa"},
		{name: "Illegal characters3", alias: "-xxxxxxxxxx"}, // first hyphen
		{name: "Illegal characters4", alias: "xxxxxxxxxx-"}, // last hyphen
		{name: "Too short", alias: strings.Repeat("x", 4)},
		{name: "Too long", alias: strings.Repeat("x", 33)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := publishStoryErrors(e, result.UID, map[string]any{
				"storyId": storyId,
				"alias":   tt.alias,
				"status":  "LIMITED",
			})
			checkStoryInvalidAlias(tt.alias, res, err)
		})
	}
}

func checkStoryInvalidAlias(alias string, res *httpexpect.Value, err *httpexpect.Value) {
	message := fmt.Sprintf("Invalid alias name: %s", alias)
	description := fmt.Sprintf("The alias '%s' must be 5-32 characters long and can only contain alphanumeric, hyphen (a-z, 0-9, -).", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishStory"},
			"extensions": map[string]any{
				"code":         "invalid_alias",
				"description":  description,
				"message":      message,
				"system_error": "",
			},
		},
	})
}

func TestPublishStoryAliasReserved(t *testing.T) {
	e, result := Server(t, baseSeeder)
	_, _, storyId := createProjectSet(e, result)

	tests := []struct {
		name  string
		alias string
	}{
		{name: "Reserved 'visualizer'", alias: "visualizer"},
		{name: "Reserved 'authentication'", alias: "authentication"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := publishStoryErrors(e, result.UID, map[string]any{
				"storyId": storyId,
				"alias":   tt.alias,
				"status":  "LIMITED",
			})
			checkStoryInvalidReservedAlias(tt.alias, res, err)
		})
	}
}

func checkStoryInvalidReservedAlias(alias string, res *httpexpect.Value, err *httpexpect.Value) {
	message := fmt.Sprintf("The alias '%s' is reserved and cannot be used.", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishStory"},
			"extensions": map[string]any{
				"code":         "invalid_reserved_alias",
				"description":  "The following aliases are reserved and cannot be used: administrator,development",
				"message":      message,
				"system_error": "",
			},
		},
	})
}

func TestPublishStoryUniqueAlias(t *testing.T) {
	e, result := Server(t, baseSeeder)
	_, sceneId1, storyId1 := createProjectSet(e, result)
	_, sceneId2, storyId2 := createProjectSet(e, result)

	testCases := []struct {
		name   string
		alias  string
		expect func(res *httpexpect.Value, err *httpexpect.Value)
	}{
		{"self projectId", sceneId1, checkStoryAliasAlreadyExists},
		{"other projectId", sceneId2, checkStoryAliasAlreadyExists},
		{"other storyId", storyId2, checkStoryAliasAlreadyExists},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			res, err := publishStoryErrors(e, result.UID, map[string]any{
				"storyId": storyId1,
				"alias":   tc.alias,
				"status":  "LIMITED",
			})
			tc.expect(res, err)
		})
	}
}

func checkStoryAliasAlreadyExists(res *httpexpect.Value, err *httpexpect.Value) {
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": "This alias is already in use. Please try another one.",
			"path":    []any{"publishStory"},
			"extensions": map[string]any{
				"code":         "alias_already_exists",
				"description":  "Each alias must be unique across projects and stories.",
				"message":      "This alias is already in use. Please try another one.",
				"system_error": "",
			},
		},
	})
}

func TestReservedReearthPrefixStory(t *testing.T) {
	e, result := Server(t, baseSeeder)

	_, _, storyId := createProjectSet(e, result)

	// prefix 'c-'
	res, err := publishStoryErrors(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   "c-test",
		"status":  "LIMITED",
	})
	checkReservedReearthPrefixStory("c-test", res, err)

	// prefix 's-'
	res, err = publishStoryErrors(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   "s-test",
		"status":  "LIMITED",
	})
	checkReservedReearthPrefixStory("s-test", res, err)

	// prefix + self id
	res = publishStory(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   alias.ReservedReearthPrefixStory + storyId,
		"status":  "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                storyId,
		"alias":             alias.ReservedReearthPrefixStory + storyId, // ok
		"publishmentStatus": "LIMITED",
	})

}

func checkReservedReearthPrefixStory(alias string, res *httpexpect.Value, err *httpexpect.Value) {
	message := fmt.Sprintf("Aliases starting with 'c-' or 's-' are not allowed: %s", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishStory"},
			"extensions": map[string]any{
				"code":         "invalid_prefix_alias",
				"description":  "Aliases that start with 'c-' or 's-' are reserved and cannot be used.",
				"message":      message,
				"system_error": "",
			},
		},
	})
}

/////// Test CheckSceneAlias ///////

func TestCheckSceneAlias(t *testing.T) {
	e, result := Server(t, baseSeeder)
	projectId, sceneID, _ := createProjectSet(e, result)

	type args struct {
		alias     string
		projectId string
	}
	type want struct {
		alias     string
		available bool
	}
	tests := []struct {
		name string
		args args
		want want
	}{
		{
			name: "not reserved",
			args: args{"test-xxxxxx", projectId},
			want: want{"test-xxxxxx", true},
		},
		{
			name: "alias equals sceneID",
			args: args{sceneID, projectId},
			want: want{sceneID, true},
		},
		{
			name: "reserved prefix ok for self project",
			args: args{alias.ReservedReearthPrefixScene + sceneID, projectId},
			want: want{alias.ReservedReearthPrefixScene + sceneID, true},
		},
	}

	for _, tt := range tests {
		tt := tt // capture
		t.Run(tt.name, func(t *testing.T) {
			res := checkSceneAlias(e, result.UID, map[string]any{
				"alias":     tt.args.alias,
				"projectId": tt.args.projectId,
			})
			res.Object().IsEqual(map[string]any{
				"alias":     tt.want.alias,
				"available": tt.want.available,
			})
		})
	}

	// Check with the alias set once
	publishProject(e, result.UID, map[string]any{
		"projectId": projectId,
		"alias":     "test-xxxxxx",
		"status":    "LIMITED",
	})
	res := checkSceneAlias(e, result.UID, map[string]any{
		"alias":     "test-xxxxxx", // current self alias
		"projectId": projectId,
	})
	res.Object().IsEqual(map[string]any{
		"alias":     "test-xxxxxx",
		"available": true,
	})

}

func TestCheckSceneAliasError(t *testing.T) {
	e, result := Server(t, baseSeeder)
	projectId, sceneId, storyId := createProjectSet(e, result)

	type args struct {
		alias     string
		projectId string
	}
	type want struct {
		message string
	}

	tests := []struct {
		name string
		args args
		want want
	}{
		{
			name: "project id as alias without project id",
			args: args{sceneId, ""},
			want: want{"This alias is already in use. Please try another one."},
		},
		{
			name: "story id as alias with project id",
			args: args{storyId, projectId},
			want: want{"This alias is already in use. Please try another one."},
		},
		{
			name: "reserved prefix + storyId as alias with project id",
			args: args{alias.ReservedReearthPrefixScene + storyId, projectId},
			want: want{
				fmt.Sprintf(
					"Aliases starting with 'c-' or 's-' are not allowed: %s",
					alias.ReservedReearthPrefixScene+storyId,
				),
			},
		},
	}

	for _, tt := range tests {
		tt := tt // capture loop var
		t.Run(tt.name, func(t *testing.T) {
			res, err := checkSceneAliasError(e, result.UID, map[string]any{
				"alias":     tt.args.alias,
				"projectId": tt.args.projectId,
			})
			res.IsNull()
			err.Array().Value(0).Path("$.message").IsEqual(tt.want.message)
		})
	}
}

/////// Test CheckStoryAlias ///////

// // go test -v -run TestCheckStoryAlias ./e2e/...
func TestCheckStoryAlias(t *testing.T) {
	e, result := Server(t, baseSeeder)
	_, _, storyId := createProjectSet(e, result)

	type args struct {
		alias   string
		storyId string
	}
	type want struct {
		alias     string
		available bool
	}
	tests := []struct {
		name string
		args args
		want want
	}{
		{
			name: "not reserved",
			args: args{"test-xxxxxx", storyId},
			want: want{"test-xxxxxx", true},
		},
		{
			name: "alias equals storyId",
			args: args{storyId, storyId},
			want: want{storyId, true},
		},
		{
			name: "reserved prefix ok for self story",
			args: args{alias.ReservedReearthPrefixStory + storyId, storyId},
			want: want{alias.ReservedReearthPrefixStory + storyId, true},
		},
	}

	for _, tt := range tests {
		tt := tt // capture
		t.Run(tt.name, func(t *testing.T) {
			res := checkStoryAlias(e, result.UID, map[string]any{
				"alias":   tt.args.alias,
				"storyId": tt.args.storyId,
			})
			res.Object().IsEqual(map[string]any{
				"alias":     tt.want.alias,
				"available": tt.want.available,
			})
		})
	}

	// Check with the alias set once
	publishStory(e, result.UID, map[string]any{
		"storyId": storyId,
		"alias":   "test-xxxxxx",
		"status":  "LIMITED",
	})
	res := checkStoryAlias(e, result.UID, map[string]any{
		"alias":   "test-xxxxxx", // current self alias
		"storyId": storyId,
	})
	res.Object().IsEqual(map[string]any{
		"alias":     "test-xxxxxx",
		"available": true,
	})
}

func TestCheckStoryAliasError(t *testing.T) {
	e, result := Server(t, baseSeeder)
	_, sceneId, storyId := createProjectSet(e, result)

	type args struct {
		alias   string
		storyId string
	}
	type want struct {
		message string
	}

	tests := []struct {
		name string
		args args
		want want
	}{
		{
			name: "story id as alias without story id",
			args: args{storyId, ""},
			want: want{"This alias is already in use. Please try another one."},
		},
		{
			name: "reserved prefix + storyId as alias without story id",
			args: args{alias.ReservedReearthPrefixStory + storyId, ""},
			want: want{"This alias is already in use. Please try another one."},
		},
		{
			name: "story id as alias with story id",
			args: args{sceneId, storyId},
			want: want{"This alias is already in use. Please try another one."},
		},
		{
			name: "reserved prefix + storyId as alias with story id",
			args: args{alias.ReservedReearthPrefixStory + sceneId, storyId},
			want: want{
				fmt.Sprintf(
					"Aliases starting with 'c-' or 's-' are not allowed: %s",
					alias.ReservedReearthPrefixStory+sceneId,
				),
			},
		},
	}

	for _, tt := range tests {
		tt := tt // capture loop var
		t.Run(tt.name, func(t *testing.T) {
			res, err := checkStoryAliasError(e, result.UID, map[string]any{
				"alias":   tt.args.alias,
				"storyId": tt.args.storyId,
			})
			res.IsNull()
			err.Array().Value(0).Path("$.message").IsEqual(tt.want.message)
		})
	}
}

/////// Common ///////

const PublishProjectMutation = `
mutation PublishProject(
  $projectId: ID!
  $alias: String
  $status: PublishmentStatus!
) {
  publishProject(
    input: { projectId: $projectId, alias: $alias, status: $status }
  ) {
    project {
      id
      alias
      publishmentStatus
    }
  }
}`

const PublishStoryMutation = `
mutation PublishStory(
  $storyId: ID!
  $alias: String
  $status: PublishmentStatus!
) {
  publishStory(input: { storyId: $storyId, alias: $alias, status: $status }) {
    story {
      id
      alias
      publishmentStatus
    }
  }
}`

const CheckSceneAliasQuery = `
query CheckSceneAlias($alias: String!, $projectId: ID) {
  checkSceneAlias(alias: $alias, projectId: $projectId) {
    alias
    available
  }
}`

const CheckStoryAliasQuery = `
query CheckStoryAlias($alias: String!, $storyId: ID) {
  checkStoryAlias(alias: $alias, storyId: $storyId) {
    alias
    available
  }
}`

func createProjectSet(e *httpexpect.Expect, result *SeederResult) (string, string, string) {
	projectId := createProject(e, result.UID, map[string]any{
		"name":        "test project",
		"description": "test description",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sceneId := createScene(e, result.UID, projectId)
	storyId := createStory(e, result.UID, map[string]any{
		"sceneId": sceneId,
		"title":   "test title",
		"index":   1,
	})

	return projectId, sceneId, storyId
}

func publishProject(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "PublishProject",
		Query:         PublishProjectMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.publishProject.project")
}

func publishProjectErrors(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) (*httpexpect.Value, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "PublishProject",
		Query:         PublishProjectMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.publishProject"), res.Path("$.errors")
}

func publishStory(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "PublishStory",
		Query:         PublishStoryMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.publishStory.story")
}

func publishStoryErrors(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) (*httpexpect.Value, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "PublishStory",
		Query:         PublishStoryMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data"), res.Path("$.errors")
}

func checkSceneAlias(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "CheckSceneAlias",
		Query:         CheckSceneAliasQuery,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.checkSceneAlias")
}

func checkSceneAliasError(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) (*httpexpect.Value, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "CheckSceneAlias",
		Query:         CheckSceneAliasQuery,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data"), res.Path("$.errors")
}

func checkStoryAlias(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "CheckStoryAlias",
		Query:         CheckStoryAliasQuery,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.checkStoryAlias")
}

func checkStoryAliasError(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) (*httpexpect.Value, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "CheckStoryAlias",
		Query:         CheckStoryAliasQuery,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data"), res.Path("$.errors")
}
