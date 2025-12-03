package e2e

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

const workspaceNode = `
workspace {
	id
	name
	members {
		userId
		role
	}
	personal
	enableToCreatePrivateProject
	alias
}`

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCreateWorkspace ./e2e/...

func TestCreateWorkspace(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)

	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation { 
			createWorkspace(input: {name: "test"}){ %s } 
		}`, workspaceNode),
	})
	wid := res.Path("$.data.createWorkspace.workspace.id").Raw().(string)
	res.Path("$.data.createWorkspace.workspace.name").IsEqual("test")
	res.Path("$.data.createWorkspace.workspace.personal").IsEqual(false)
	res.Path("$.data.createWorkspace.workspace.enableToCreatePrivateProject").IsEqual(false)
	res.Path("$.data.createWorkspace.workspace.alias").IsEqual("w-" + wid)

	res = Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation { 
			createWorkspace(input: {name: "test" alias: "test-alias"}){ %s } 
		}`, workspaceNode),
	})

	res.Path("$.data.createWorkspace.workspace.name").IsEqual("test")
	res.Path("$.data.createWorkspace.workspace.personal").IsEqual(false)
	res.Path("$.data.createWorkspace.workspace.enableToCreatePrivateProject").IsEqual(false)
	res.Path("$.data.createWorkspace.workspace.alias").IsEqual("test-alias")

	res = Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation { 
			createWorkspace(input: {name: "test" alias: "test-alias"}){ %s } 
		}`, workspaceNode),
	})

	res.Path("$.errors[0].message").IsEqual("alias is already used in another workspace")
}

func TestDeleteWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	_, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)

	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation { 
			deleteWorkspace(input: {workspaceId: "%s"}){ workspaceId }}`,
			wId1),
	})
	res.Path("$.data.deleteWorkspace.workspaceId").IsEqual(wId1.String())

	_, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Equal(t, rerror.ErrNotFound, err)

	res = Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation { 
			deleteWorkspace(input: {workspaceId: "%s"}){ workspaceId }}`,
			accountsID.NewWorkspaceID()),
	})
	res.Path("$.errors[0].message").IsEqual("operation denied")
}

// go test -v -run TestUpdateWorkspace ./e2e/...

func TestUpdateWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "e2e", w.Name())

	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			updateWorkspace(input: { workspaceId: "%s", name: "%s", alias: "%s" }) { %s } }`,
			wId1, "updated", "updated-alias", workspaceNode),
	})
	res.Path("$.data.updateWorkspace.workspace.name").IsEqual("updated")
	res.Path("$.data.updateWorkspace.workspace.alias").IsEqual("updated-alias")

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "updated", w.Name())

	res = Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			updateWorkspace(input: { workspaceId: "%s", name: "%s" }) { %s } }`,
			accountsID.NewWorkspaceID(), "updated", workspaceNode),
	})

	res.Path("$.errors[0].message").IsEqual("not found")

	res = Request(e, uId2.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation { 
			createWorkspace(input: {name: "test2"}){ %s } 
		}`, workspaceNode),
	})
	wid2 := res.Path("$.data.createWorkspace.workspace.id").Raw().(string)
	res.Path("$.data.createWorkspace.workspace.alias").IsEqual("w-" + wid2)

	res = Request(e, uId2.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			updateWorkspace(input: { workspaceId: "%s", name: "%s", alias: "%s" }) { %s } }`,
			wid2, "updated", "updated-alias", workspaceNode),
	})

	res.Path("$.errors[0].message").IsEqual("alias is already used in another workspace")
}

func TestAddMemberToWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId2))

	Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			addMemberToWorkspace( input: { workspaceId: "%s", userId: "%s", role: READER } ) { %s } }`,
			wId1, uId2, workspaceNode),
	})

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId2))
	assert.Equal(t, w.Members().User(uId2).Role, accountsWorkspace.RoleReader)

	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			addMemberToWorkspace( input: { workspaceId: "%s", userId: "%s", role: READER } ) { %s } }`,
			wId1, uId2, workspaceNode),
	})
	res.Path("$.errors[0].message").IsEqual("user already joined")
}

func TestRemoveMemberFromWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId3))

	Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			removeMemberFromWorkspace(input: { workspaceId: "%s", userId: "%s" }) { %s } }`,
			wId2, uId3, workspaceNode),
	})

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId3))

	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			removeMemberFromWorkspace(input: { workspaceId: "%s", userId: "%s" }) { %s } }`,
			wId2, uId3, workspaceNode),
	})
	res.Path("$.errors[0].message").IsEqual("target user does not exist in the workspace")
}

func TestUpdateMemberOfWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, accountsWorkspace.RoleReader)

	Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			updateMemberOfWorkspace( input: { workspaceId: "%s", userId: "%s", role: WRITER } ) { %s } }`,
			wId2, uId3, workspaceNode),
	})

	w, err = r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, accountsWorkspace.RoleWriter)

	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`mutation {
			updateMemberOfWorkspace( input: { workspaceId: "%s", userId: "%s", role: WRITER } ) { %s } }`,
			accountsID.NewWorkspaceID(), uId3, workspaceNode),
	})
	res.Path("$.errors[0].message").IsEqual("operation denied")
}
