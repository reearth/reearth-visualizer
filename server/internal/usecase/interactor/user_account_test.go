package interactor

import (
	"context"
	"errors"
	"testing"

	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"
)

func TestUserQueryInteractor_SearchUser_Blank(t *testing.T) {
	for _, keyword := range []string{"", " \t\n"} {
		t.Run(keyword, func(t *testing.T) {
			r := accountsUser.NewMockRepo(gomock.NewController(t))
			q := &UserQueryInteractor{repos: []accountsUser.Repo{r}}
			users, err := q.SearchUser(context.Background(), keyword)
			require.NoError(t, err)
			require.Empty(t, users)
		})
	}
}

func TestUserQueryInteractor_SearchUser_Alias(t *testing.T) {
	r := accountsUser.NewMockRepo(gomock.NewController(t))
	found := accountsUser.New().NewID().Name("Display Name").Alias("user-alias").OptionalEmail("").MustBuild()
	r.EXPECT().FindByAlias(gomock.Any(), "user-alias").Return(found, nil)
	q := &UserQueryInteractor{repos: []accountsUser.Repo{r}}
	users, err := q.SearchUser(context.Background(), " user-alias ")
	require.NoError(t, err)
	require.Equal(t, accountsUser.List{found}, users)
}

func TestUserQueryInteractor_SearchUser_RepositoryErrors(t *testing.T) {
	wantErr := errors.New("repository unavailable")
	t.Run("alias errors propagate without a keyword lookup", func(t *testing.T) {
		r := accountsUser.NewMockRepo(gomock.NewController(t))
		r.EXPECT().FindByAlias(gomock.Any(), "someone").Return(nil, wantErr)
		q := &UserQueryInteractor{repos: []accountsUser.Repo{r}}
		users, err := q.SearchUser(context.Background(), "someone")
		require.ErrorIs(t, err, wantErr)
		require.Nil(t, users)
	})
	t.Run("keyword errors propagate after alias not found", func(t *testing.T) {
		r := accountsUser.NewMockRepo(gomock.NewController(t))
		r.EXPECT().FindByAlias(gomock.Any(), "someone").Return(nil, rerror.ErrNotFound)
		r.EXPECT().SearchByKeyword(gomock.Any(), "someone").Return(nil, wantErr)
		q := &UserQueryInteractor{repos: []accountsUser.Repo{r}}
		users, err := q.SearchUser(context.Background(), "someone")
		require.ErrorIs(t, err, wantErr)
		require.Nil(t, users)
	})
}
