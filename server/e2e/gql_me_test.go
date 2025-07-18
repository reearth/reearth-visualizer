package e2e

import (
	"testing"
)

const GetMeQuery = `
query GetMe {
  me {
    id
    name
    email
    lang
    theme
    myTeam {
      id
      name
      policyId
      policy {
        id
        name
        projectCount
        memberCount
        publishedProjectCount
        layerCount
        assetStorageSize
        __typename
      }
      enableToCreatePrivateProject
      __typename
    }
    teams {
      id
      name
      personal
      members {
        user {
          id
          name
          email
          __typename
        }
        userId
        role
        __typename
      }
      policyId
      policy {
        id
        name
        projectCount
        memberCount
        publishedProjectCount
        layerCount
        assetStorageSize
        __typename
      }
	  enableToCreatePrivateProject
      __typename
    }
    auths
    __typename
  }
}`

// go test -v -run TestMe ./e2e/...

func TestMe(t *testing.T) {
	e := Server(t, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         GetMeQuery,
		Variables:     map[string]any{},
	}

	res := Request(e, uID.String(), requestBody)

	me := res.Path("$.data.me")

	// ValueDump(me)

	me.Object().HasValue("email", uEmail)
	me.Object().HasValue("id", uID.String())
	me.Object().HasValue("name", uName)

	me.Path("$.myTeam.enableToCreatePrivateProject").IsEqual(false)

	me.Path("$.teams[0].enableToCreatePrivateProject").IsEqual(false)

}
