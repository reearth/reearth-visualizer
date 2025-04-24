package e2e

import (
	"fmt"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearthx/account/accountdomain"
)

/////// TestPublish Project ///////

func TestPublishProject(t *testing.T) {
	e := Server(t, baseSeeder)

	projectId, _, _ := createProjectSet(e)

	// default
	res := publishProject(e, uID, map[string]any{
		"projectId": projectId,
		"alias":     "",
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             alias.ReservedReearthPrefixProject + projectId, // default prefix + self id
		"publishmentStatus": "LIMITED",
	})

	projectId, _, _ = createProjectSet(e)

	// self project id
	res = publishProject(e, uID, map[string]any{
		"projectId": projectId,
		"alias":     projectId,
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             projectId, // ok
		"publishmentStatus": "LIMITED",
	})

	// publish
	res = publishProject(e, uID, map[string]any{
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
	res = publishProject(e, uID, map[string]any{
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
	res = publishProject(e, uID, map[string]any{
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
	e := Server(t, baseSeeder)

	projectId, _, _ := createProjectSet(e)

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
			res, err := publishProjectErrors(e, uID, map[string]any{
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
	e := Server(t, baseSeeder)
	projectId, _, _ := createProjectSet(e)

	tests := []struct {
		name  string
		alias string
	}{
		{name: "Reserved 'visualizer'", alias: "visualizer"},
		{name: "Reserved 'authentication'", alias: "authentication"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := publishProjectErrors(e, uID, map[string]any{
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
	e := Server(t, baseSeeder)
	projectId1, _, storyId1 := createProjectSet(e)
	projectId2, _, storyId2 := createProjectSet(e)

	testCases := []struct {
		name   string
		alias  string
		expect func(res *httpexpect.Value, err *httpexpect.Value)
	}{
		{"self storyId", storyId1, checkProjectAliasAlreadyExists},
		{"other projectId", projectId2, checkProjectAliasAlreadyExists},
		{"other storyId", storyId2, checkProjectAliasAlreadyExists},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			res, err := publishProjectErrors(e, uID, map[string]any{
				"projectId": projectId1,
				"alias":     tc.alias,
				"status":    "LIMITED",
			})
			tc.expect(res, err)
		})
	}

	// publish projectId2 => 'project-id2'
	publishProject(e, uID, map[string]any{
		"projectId": projectId2,
		"alias":     "project-id2",
		"status":    "LIMITED",
	})
	// publish storyId1 => 'story-id1'
	publishStory(e, uID, map[string]any{
		"storyId": storyId1,
		"alias":   "story-id1",
		"status":  "LIMITED",
	})
	// publish storyId2 => 'story-id2'
	publishStory(e, uID, map[string]any{
		"storyId": storyId2,
		"alias":   "story-id2",
		"status":  "LIMITED",
	})

	// used aliases
	aliases := []string{"project-id2", "story-id1", "story-id2"}

	for _, alias := range aliases {
		t.Run("alias conflict: "+alias, func(t *testing.T) {
			res, err := publishProjectErrors(e, uID, map[string]any{
				"projectId": projectId1,
				"alias":     alias,
				"status":    "LIMITED",
			})
			checkProjectAliasAlreadyExists(res, err)
		})
	}
}

func checkProjectAliasAlreadyExists(res *httpexpect.Value, err *httpexpect.Value) {
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

func TestReservedReearthPrefixProject(t *testing.T) {
	e := Server(t, baseSeeder)

	projectId, _, _ := createProjectSet(e)

	// prefix 'p-'
	res, err := publishProjectErrors(e, uID, map[string]any{
		"projectId": projectId,
		"alias":     "p-test",
		"status":    "LIMITED",
	})
	checkReservedReearthPrefixProject("p-test", res, err)

	// prefix 's-'
	res, err = publishProjectErrors(e, uID, map[string]any{
		"projectId": projectId,
		"alias":     "s-test",
		"status":    "LIMITED",
	})
	checkReservedReearthPrefixProject("s-test", res, err)

	// prefix + self id
	res = publishProject(e, uID, map[string]any{
		"projectId": projectId,
		"alias":     alias.ReservedReearthPrefixProject + projectId,
		"status":    "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                projectId,
		"alias":             alias.ReservedReearthPrefixProject + projectId, // ok
		"publishmentStatus": "LIMITED",
	})

}

func checkReservedReearthPrefixProject(alias string, res *httpexpect.Value, err *httpexpect.Value) {
	message := fmt.Sprintf("Aliases starting with 'p-' or 's-' are not allowed: %s", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishProject"},
			"extensions": map[string]any{
				"code":         "invalid_prefix_alias",
				"description":  "Aliases that start with 'p-' or 's-' are reserved and cannot be used.",
				"message":      message,
				"system_error": "",
			},
		},
	})
}

/////// TestPublishStory ///////

func TestPublishStory(t *testing.T) {
	e := Server(t, baseSeeder)

	_, _, storyId := createProjectSet(e)

	// default
	res := publishStory(e, uID, map[string]any{
		"storyId": storyId,
		"alias":   "",
		"status":  "LIMITED",
	})
	res.Object().IsEqual(map[string]any{
		"id":                storyId,
		"alias":             alias.ReservedReearthPrefixStory + storyId, // default self id
		"publishmentStatus": "LIMITED",
	})

	_, _, storyId = createProjectSet(e)

	// self story id
	res = publishStory(e, uID, map[string]any{
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
	res = publishStory(e, uID, map[string]any{
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
	res = publishStory(e, uID, map[string]any{
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
	res = publishStory(e, uID, map[string]any{
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
	e := Server(t, baseSeeder)

	_, _, storyId := createProjectSet(e)

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
			res, err := publishStoryErrors(e, uID, map[string]any{
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
	e := Server(t, baseSeeder)
	_, _, storyId := createProjectSet(e)

	tests := []struct {
		name  string
		alias string
	}{
		{name: "Reserved 'visualizer'", alias: "visualizer"},
		{name: "Reserved 'authentication'", alias: "authentication"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := publishStoryErrors(e, uID, map[string]any{
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
	e := Server(t, baseSeeder)
	projectId1, _, storyId1 := createProjectSet(e)
	projectId2, _, storyId2 := createProjectSet(e)

	testCases := []struct {
		name   string
		alias  string
		expect func(res *httpexpect.Value, err *httpexpect.Value)
	}{
		{"self projectId", projectId1, checkStoryAliasAlreadyExists},
		{"other projectId", projectId2, checkStoryAliasAlreadyExists},
		{"other storyId", storyId2, checkStoryAliasAlreadyExists},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			res, err := publishStoryErrors(e, uID, map[string]any{
				"storyId": storyId1,
				"alias":   tc.alias,
				"status":  "LIMITED",
			})
			tc.expect(res, err)
		})
	}

	// publish projectId1 => 'project-id1'
	publishProject(e, uID, map[string]any{
		"projectId": projectId1,
		"alias":     "project-id1",
		"status":    "LIMITED",
	})
	// publish projectId2 => 'project-id2'
	publishProject(e, uID, map[string]any{
		"projectId": projectId2,
		"alias":     "project-id2",
		"status":    "LIMITED",
	})
	// publish storyId2 => 'story-id2'
	publishStory(e, uID, map[string]any{
		"storyId": storyId2,
		"alias":   "story-id2",
		"status":  "LIMITED",
	})

	// used aliases
	aliases := []string{"project-id1", "project-id2", "story-id2"}

	for _, alias := range aliases {
		t.Run("alias conflict: "+alias, func(t *testing.T) {
			res, err := publishStoryErrors(e, uID, map[string]any{
				"storyId": storyId1,
				"alias":   alias,
				"status":  "LIMITED",
			})
			checkStoryAliasAlreadyExists(res, err)
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
	e := Server(t, baseSeeder)

	_, _, storyId := createProjectSet(e)

	// prefix 'p-'
	res, err := publishStoryErrors(e, uID, map[string]any{
		"storyId": storyId,
		"alias":   "p-test",
		"status":  "LIMITED",
	})
	checkReservedReearthPrefixStory("p-test", res, err)

	// prefix 's-'
	res, err = publishStoryErrors(e, uID, map[string]any{
		"storyId": storyId,
		"alias":   "s-test",
		"status":  "LIMITED",
	})
	checkReservedReearthPrefixStory("s-test", res, err)

	// prefix + self id
	res = publishStory(e, uID, map[string]any{
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
	message := fmt.Sprintf("Aliases starting with 'p-' or 's-' are not allowed: %s", alias)
	res.IsNull()
	err.Array().IsEqual([]map[string]any{
		{
			"message": message,
			"path":    []any{"publishStory"},
			"extensions": map[string]any{
				"code":         "invalid_prefix_alias",
				"description":  "Aliases that start with 'p-' or 's-' are reserved and cannot be used.",
				"message":      message,
				"system_error": "",
			},
		},
	})
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

func createProjectSet(e *httpexpect.Expect) (string, string, string) {
	projectId := createProject(e, uID, map[string]any{
		"name":        "test project",
		"description": "test description",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sceneId := createScene(e, projectId)
	storyId := createStory(e, map[string]any{
		"sceneId": sceneId,
		"title":   "test title",
		"index":   1,
	})

	return projectId, sceneId, storyId
}

func publishProject(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "PublishProject",
		Query:         PublishProjectMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.publishProject.project")
}

func publishProjectErrors(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) (*httpexpect.Value, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "PublishProject",
		Query:         PublishProjectMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.publishProject"), res.Path("$.errors")
}

func publishStory(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "PublishStory",
		Query:         PublishStoryMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.publishStory.story")
}

func publishStoryErrors(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) (*httpexpect.Value, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "PublishStory",
		Query:         PublishStoryMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data"), res.Path("$.errors")
}
