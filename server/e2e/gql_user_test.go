package e2e

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

// func TestSignUp(t *testing.T) {
// 	e, _ := StartGQLServer(t, &config.Config{
// 		Origins: []string{"https://example.com"},
// 		AuthSrv: config.AuthSrvConfig{
// 			Disabled: true,
// 		},
// 	}, true, baseSeederUser)
// 	query := `mutation { signup(input: {lang: "ja",theme: DEFAULT,secret: "Ajsownndww1"}){ user{ id name email } }}`
// 	request := GraphQLRequest{
// 		Query: query,
// 	}
// 	jsonData, err := json.Marshal(request)
// 	if err != nil {
// 		assert.NoError(t, err)
// 	}
// 	o := e.POST("/api/graphql").
// 		WithHeader("authorization", "Bearer test").
// 		WithHeader("Content-Type", "application/json").
// 		WithHeader("X-Reearth-Debug-User", uId1.String()).
// 		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("signup").Object().Value("user").Object()
// 	o.Value("name").String().Equal("updated")
// 	o.Value("email").String().Equal("hoge@test.com")
// }

func TestUpdateMe(t *testing.T) {
	e, _ := ServerUser(t)
	query := `mutation { updateMe(input: {name: "updated",email:"hoge@test.com",lang: "ja",theme: DEFAULT,password: "Ajsownndww1",passwordConfirmation: "Ajsownndww1"}){ me{ id name email lang theme } }}`
	o := RequestQuery(t, e, query, uId1.String()).Object().Value("data").Object().Value("updateMe").Object().Value("me").Object()
	o.Value("name").String().Equal("updated")
	o.Value("email").String().Equal("hoge@test.com")
	o.Value("lang").String().Equal("ja")
	o.Value("theme").String().Equal("default")
}

func TestRemoveMyAuth(t *testing.T) {
	e, r := ServerUser(t)
	u, err := r.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.Equal(t, &user.Auth{Provider: "reearth", Sub: "reearth|" + uId1.String()}, u.Auths().GetByProvider("reearth"))

	query := `mutation { removeMyAuth(input: {auth: "reearth"}){ me{ id name email lang theme } }}`
	RequestQuery(t, e, query, uId1.String()).Object()

	u, err = r.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.Nil(t, u.Auths().Get("sub"))
}

func TestDeleteMe(t *testing.T) {
	e, r := ServerUser(t)
	u, err := r.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.NotNil(t, u)

	query := fmt.Sprintf(`mutation { deleteMe(input: {userId: "%s"}){ userId }}`, uId1)
	RequestQuery(t, e, query, uId1.String()).Object()

	_, err = r.User.FindByID(context.Background(), uId1)
	assert.Equal(t, rerror.ErrNotFound, err)
}

func TestSearchUser(t *testing.T) {
	e, _ := ServerUser(t)

	query := fmt.Sprintf(` { searchUser(nameOrEmail: "%s"){ id name email } }`, "e2e")
	o := RequestQuery(t, e, query, uId1.String()).Object().Value("data").Object().Value("searchUser").Object()
	o.Value("id").String().Equal(uId1.String())
	o.Value("name").String().Equal("e2e")
	o.Value("email").String().Equal("e2e@e2e.com")

	query = fmt.Sprintf(` { searchUser(nameOrEmail: "%s"){ id name email } }`, "notfound")
	RequestQuery(t, e, query, uId1.String()).Object().
		Value("data").Object().Value("searchUser").Null()
}

func TestNode(t *testing.T) {
	e, _ := ServerUser(t)
	query := fmt.Sprintf(` { node(id: "%s", type: USER){ id } }`, uId1.String())
	o := RequestQuery(t, e, query, uId1.String()).Object().Value("data").Object().Value("node").Object()
	o.Value("id").String().Equal(uId1.String())
}

func TestNodes(t *testing.T) {
	e, _ := ServerUser(t)
	query := fmt.Sprintf(` { nodes(id: "%s", type: USER){ id } }`, uId1.String())
	o := RequestQuery(t, e, query, uId1.String()).Object().Value("data").Object().Value("nodes")
	o.Array().Contains(map[string]string{"id": uId1.String()})
}
