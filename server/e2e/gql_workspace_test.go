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

func TestCreateTeam(t *testing.T) {
	e, _, _ := StartGQLServerAndRepos(t, baseSeederUser)
	query := `mutation { createTeam(input: {name: "test"}){ team{ id name } }}`
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("data").Object().Value("createTeam").Object().Value("team").Object().Value("name").String().IsEqual("test")
}

func TestDeleteTeam(t *testing.T) {
	e, r, _ := StartGQLServerAndRepos(t, baseSeederUser)
	_, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	query := fmt.Sprintf(`mutation { deleteTeam(input: {teamId: "%s"}){ teamId }}`, wId1)
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("data").Object().Value("deleteTeam").Object().Value("teamId").String().IsEqual(wId1.String())

	_, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Equal(t, rerror.ErrNotFound, err)

	query = fmt.Sprintf(`mutation { deleteTeam(input: {teamId: "%s"}){ teamId }}`, accountdomain.NewWorkspaceID())
	request = GraphQLRequest{
		Query: query,
	}
	o = Request(e, uId1.String(), request).Object()

	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("operation denied")
}

func TestUpdateTeam(t *testing.T) {
	e, r, _ := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "e2e", w.Name())

	query := fmt.Sprintf(`mutation { updateTeam(input: {teamId: "%s",name: "%s"}){ team{ id name } }}`, wId1, "updated")
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("data").Object().Value("updateTeam").Object().Value("team").Object().Value("name").String().IsEqual("updated")

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "updated", w.Name())

	query = fmt.Sprintf(`mutation { updateTeam(input: {teamId: "%s",name: "%s"}){ team{ id name } }}`, accountdomain.NewWorkspaceID(), "updated")
	request = GraphQLRequest{
		Query: query,
	}
	o = Request(e, uId1.String(), request).Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("not found")
}

// go test -v -run TestAddMemberToTeam ./e2e/...
func TestAddMemberToTeam(t *testing.T) {
	e, r, _ := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId2))

	query := fmt.Sprintf(`mutation { addMemberToTeam(input: {teamId: "%s", userId: "%s", role: READER}){ team{ id } }}`, wId1, uId2)
	request := GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request)

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId2))
	assert.Equal(t, w.Members().User(uId2).Role, workspace.RoleReader)

	query = fmt.Sprintf(`mutation { addMemberToTeam(input: {teamId: "%s", userId: "%s", role: READER}){ team{ id } }}`, wId1, uId2)
	request = GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request).Object().
		Value("errors").Array().Value(0).Object().Value("message").IsEqual("user already joined")
}

func TestRemoveMemberFromTeam(t *testing.T) {
	e, r, _ := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId3))

	query := fmt.Sprintf(`mutation { removeMemberFromTeam(input: {teamId: "%s", userId: "%s"}){ team{ id } }}`, wId2, uId3)
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

func TestUpdateMemberOfTeam(t *testing.T) {
	e, r, _ := StartGQLServerAndRepos(t, baseSeederUser)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleReader)
	query := fmt.Sprintf(`mutation { updateMemberOfTeam(input: {teamId: "%s", userId: "%s", role: WRITER}){ team{ id } }}`, wId2, uId3)
	request := GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request)
	w, err = r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleWriter)

	query = fmt.Sprintf(`mutation { updateMemberOfTeam(input: {teamId: "%s", userId: "%s", role: WRITER}){ team{ id } }}`, accountdomain.NewWorkspaceID(), uId3)
	request = GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("operation denied")
}
