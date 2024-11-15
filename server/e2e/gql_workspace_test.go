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
	e, _ := ServerUser(t)
	query := `mutation { createTeam(input: {name: "test"}){ team{ id name } }}`
	o := RequestQuery(t, e, query, uId1.String()).Object()
	o.Value("data").Object().Value("createTeam").Object().Value("team").Object().Value("name").String().Equal("test")
}

func TestDeleteTeam(t *testing.T) {
	e, r := ServerUser(t)
	_, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)

	query := fmt.Sprintf(`mutation { deleteTeam(input: {teamId: "%s"}){ teamId }}`, wId1)
	o := RequestQuery(t, e, query, uId1.String()).Object()
	o.Value("data").Object().Value("deleteTeam").Object().Value("teamId").String().Equal(wId1.String())

	_, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Equal(t, rerror.ErrNotFound, err)

	query = fmt.Sprintf(`mutation { deleteTeam(input: {teamId: "%s"}){ teamId }}`, accountdomain.NewWorkspaceID())
	o = RequestQuery(t, e, query, uId1.String()).Object()

	o.Value("errors").Array().First().Object().Value("message").Equal("input: deleteTeam operation denied")
}

func TestUpdateTeam(t *testing.T) {
	e, r := ServerUser(t)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "e2e", w.Name())

	query := fmt.Sprintf(`mutation { updateTeam(input: {teamId: "%s",name: "%s"}){ team{ id name } }}`, wId1, "updated")
	o := RequestQuery(t, e, query, uId1.String()).Object()
	o.Value("data").Object().Value("updateTeam").Object().Value("team").Object().Value("name").String().Equal("updated")

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.Equal(t, "updated", w.Name())

	query = fmt.Sprintf(`mutation { updateTeam(input: {teamId: "%s",name: "%s"}){ team{ id name } }}`, accountdomain.NewWorkspaceID(), "updated")
	o = RequestQuery(t, e, query, uId1.String()).Object()
	o.Value("errors").Array().First().Object().Value("message").Equal("input: updateTeam not found")
}

func TestAddMemberToTeam(t *testing.T) {
	e, r := ServerUser(t)

	w, err := r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId2))

	query := fmt.Sprintf(`mutation { addMemberToTeam(input: {teamId: "%s", userId: "%s", role: READER}){ team{ id } }}`, wId1, uId2)
	RequestQuery(t, e, query, uId1.String())

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId2))
	assert.Equal(t, w.Members().User(uId2).Role, workspace.RoleReader)

	query = fmt.Sprintf(`mutation { addMemberToTeam(input: {teamId: "%s", userId: "%s", role: READER}){ team{ id } }}`, wId1, uId2)
	RequestQuery(t, e, query, uId1.String()).Object().
		Value("errors").Array().First().Object().Value("message").Equal("input: addMemberToTeam user already joined")
}

func TestRemoveMemberFromTeam(t *testing.T) {
	e, r := ServerUser(t)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId3))

	query := fmt.Sprintf(`mutation { removeMemberFromTeam(input: {teamId: "%s", userId: "%s"}){ team{ id } }}`, wId2, uId3)
	RequestQuery(t, e, query, uId1.String())

	w, err = r.Workspace.FindByID(context.Background(), wId1)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId3))

	o := RequestQuery(t, e, query, uId1.String()).Object()
	o.Value("errors").Array().First().Object().Value("message").Equal("input: removeMemberFromTeam target user does not exist in the workspace")
}

func TestUpdateMemberOfTeam(t *testing.T) {
	e, r := ServerUser(t)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleReader)

	query := fmt.Sprintf(`mutation { updateMemberOfTeam(input: {teamId: "%s", userId: "%s", role: WRITER}){ team{ id } }}`, wId2, uId3)
	RequestQuery(t, e, query, uId1.String())

	w, err = r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleWriter)

	query = fmt.Sprintf(`mutation { updateMemberOfTeam(input: {teamId: "%s", userId: "%s", role: WRITER}){ team{ id } }}`, accountdomain.NewWorkspaceID(), uId3)
	o := RequestQuery(t, e, query, uId1.String()).Object()
	o.Value("errors").Array().First().Object().Value("message").Equal("input: updateMemberOfTeam operation denied")
}
