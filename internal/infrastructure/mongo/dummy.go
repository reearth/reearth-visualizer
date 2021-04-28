package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	user1 "github.com/reearth/reearth-backend/pkg/user"
)

func generateDummyData(ctx context.Context, c *repo.Container) {
	// check if duumy data are already created
	userID, _ := id.UserIDFrom("01d7yt9zdyb74v2bvx76vw0jfj")
	if user, err2 := c.User.FindByID(ctx, userID); err2 != nil {
		if err2 != err1.ErrNotFound {
			panic(err2)
		}
	} else if user != nil {
		return
	}

	// team
	team, _ := user1.NewTeam().NewID().Personal(true).Members(map[id.UserID]user1.Role{
		userID: user1.RoleOwner,
	}).Build()
	err := c.Team.Save(ctx, team)
	if err != nil {
		panic(err)
	}

	// user
	user, _ := user1.New().
		ID(userID).
		Name("dummy").
		Email("dummy@dummy.com").
		Team(team.ID()).
		Build()
	err = c.User.Save(ctx, user)
	if err != nil {
		panic(err)
	}

	println("dummy user: ", userID.String())
	println("dummy team: ", team.ID().String())
}
