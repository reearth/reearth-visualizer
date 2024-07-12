package e2e

import (
	"context"
	"net/url"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var (
	uID    = user.NewID()
	uEmail = "e2e@e2e.com"
	uName  = "e2e"
	wID    = accountdomain.NewWorkspaceID()
	pID    = id.NewProjectID()
	pAlias = "PROJECT_ALIAS"

	sID   = id.NewSceneID()
	dssID = id.NewDatasetSchemaID()
	dsID  = id.NewDatasetID()

	now = time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC)
)

func baseSeeder(ctx context.Context, r *repo.Container) error {
	defer util.MockNow(now)()

	u := user.New().
		ID(uID).
		Workspace(wID).
		Name(uName).
		Email(uEmail).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}

	m := workspace.Member{
		Role: workspace.RoleOwner,
	}
	w := workspace.New().ID(wID).
		Name("e2e").
		Personal(false).
		Members(map[accountdomain.UserID]workspace.Member{u.ID(): m}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	p := project.New().ID(pID).
		Name("p1").
		Description("p1 desc").
		ImageURL(lo.Must(url.Parse("https://test.com"))).
		Workspace(w.ID()).
		Alias(pAlias).
		MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	return nil
}
