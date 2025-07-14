package e2e

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestCreateWorkspace(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)
	query := `mutation { createWorkspace(input: {name: "test"}){ workspace{ id name } }}`
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("data").Object().Value("createWorkspace").Object().Value("workspace").Object().Value("name").String().IsEqual("test")
}

func TestDeleteWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)
	_, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	query := fmt.Sprintf(`mutation { deleteWorkspace(input: {workspaceId: "%s"}){ workspaceId }}`, wId1)
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("data").Object().Value("deleteWorkspace").Object().Value("workspaceId").String().IsEqual(wId1.String())

	_, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Equal(t, rerror.ErrNotFound, err)

	query = fmt.Sprintf(`mutation { deleteWorkspace(input: {workspaceId: "%s"}){ workspaceId }}`, accountdomain.NewWorkspaceID())
	request = GraphQLRequest{
		Query: query,
	}
	o = Request(e, uId1.String(), request).Object()

	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("operation denied")
}

func TestUpdateWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "e2e", w.Name())

	query := fmt.Sprintf(`mutation { updateWorkspace(input: {workspaceId: "%s",name: "%s"}){ workspace{ id name } }}`, wId1, "updated")
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("data").Object().Value("updateWorkspace").Object().Value("workspace").Object().Value("name").String().IsEqual("updated")

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "updated", w.Name())

	query = fmt.Sprintf(`mutation { updateWorkspace(input: {workspaceId: "%s",name: "%s"}){ workspace{ id name } }}`, accountdomain.NewWorkspaceID(), "updated")
	request = GraphQLRequest{
		Query: query,
	}
	o = Request(e, uId1.String(), request).Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("not found")
}

func TestAddMemberToWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId2))

	query := fmt.Sprintf(`mutation { addMemberToWorkspace(input: {workspaceId: "%s", userId: "%s", role: READER}){ workspace{ id } }}`, wId1, uId2)
	request := GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request)

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId2))
	assert.Equal(t, w.Members().User(uId2).Role, workspace.RoleReader)

	query = fmt.Sprintf(`mutation { addMemberToWorkspace(input: {workspaceId: "%s", userId: "%s", role: READER}){ workspace{ id } }}`, wId1, uId2)
	request = GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request).Object().
		Value("errors").Array().Value(0).Object().Value("message").IsEqual("user already joined")
}

func TestRemoveMemberFromWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId3))

	query := fmt.Sprintf(`mutation { removeMemberFromWorkspace(input: {workspaceId: "%s", userId: "%s"}){ workspace{ id } }}`, wId2, uId3)
	request := GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request)

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId3))

	o := Request(e, uId1.String(), request).Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("target user does not exist in the workspace")
}

func TestUpdateMemberOfWorkspace(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleReader)
	query := fmt.Sprintf(`mutation { updateMemberOfWorkspace(input: {workspaceId: "%s", userId: "%s", role: WRITER}){ workspace{ id } }}`, wId2, uId3)
	request := GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request)
	w, err = r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleWriter)

	query = fmt.Sprintf(`mutation { updateMemberOfWorkspace(input: {workspaceId: "%s", userId: "%s", role: WRITER}){ workspace{ id } }}`, accountdomain.NewWorkspaceID(), uId3)
	request = GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("operation denied")
}
