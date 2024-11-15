package e2e

import (
	"context"
	"net/url"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/text/language"
)

var (
	uID    = user.NewID()
	uEmail = "e2e@e2e.com"
	uName  = "e2e"
	wID    = accountdomain.NewWorkspaceID()
	pID    = id.NewProjectID()
	pName  = "p1"
	pAlias = "PROJECT_ALIAS"

	sID    = id.NewSceneID()
	dssID  = id.NewDatasetSchemaID()
	dsID   = id.NewDatasetID()
	dsfID1 = dataset.NewFieldID()
	dsfID2 = dataset.NewFieldID()
	dsfID3 = dataset.NewFieldID()
	dsfID4 = dataset.NewFieldID()

	now = time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC)

	uId1 = accountdomain.NewUserID()
	uId2 = accountdomain.NewUserID()
	uId3 = accountdomain.NewUserID()
	wId1 = accountdomain.NewWorkspaceID()
	wId2 = accountdomain.NewWorkspaceID()
	iId1 = accountdomain.NewIntegrationID()
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
	return baseSetup(ctx, r, u)
}

func baseSeederWithLang(ctx context.Context, r *repo.Container, lang language.Tag) error {
	defer util.MockNow(now)()

	u := user.New().
		ID(uID).
		Workspace(wID).
		Name(uName).
		Email(uEmail).
		Lang(lang).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	return baseSetup(ctx, r, u)
}

func baseSetup(ctx context.Context, r *repo.Container, u *user.User) error {

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
		Name(pName).
		Description(pName + " desc").
		ImageURL(lo.Must(url.Parse("https://test.com"))).
		Workspace(w.ID()).
		Alias(pAlias).
		MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	dss := dataset.NewSchema().ID(dssID).
		Name("test.csv").
		Scene(sID).
		Fields([]*dataset.SchemaField{
			dataset.NewSchemaField().ID(dsfID1).Name("f1").Type(dataset.ValueTypeString).MustBuild(),
			dataset.NewSchemaField().ID(dsfID2).Name("f2").Type(dataset.ValueTypeNumber).MustBuild(),
			dataset.NewSchemaField().ID(dsfID3).Name("f3").Type(dataset.ValueTypeBool).MustBuild(),
			dataset.NewSchemaField().ID(dsfID4).Name("location").Type(dataset.ValueTypeLatLng).MustBuild(),
		}).
		Source("file:///dss.csv").
		MustBuild()
	if err := r.DatasetSchema.Save(ctx, dss); err != nil {
		return err
	}

	ds := dataset.New().ID(dsID).Schema(dss.ID()).Scene(sID).
		Fields([]*dataset.Field{
			dataset.NewField(dsfID1, dataset.ValueTypeString.ValueFrom("test"), ""),
			dataset.NewField(dsfID2, dataset.ValueTypeNumber.ValueFrom(123), ""),
			dataset.NewField(dsfID3, dataset.ValueTypeBool.ValueFrom(true), ""),
			dataset.NewField(dsfID4, dataset.ValueTypeLatLng.ValueFrom(dataset.LatLng{Lat: 11, Lng: 12}), ""),
		}).
		MustBuild()
	if err := r.Dataset.Save(ctx, ds); err != nil {
		return err
	}

	return nil
}

func baseSeederUser(ctx context.Context, r *repo.Container) error {
	auth := user.ReearthSub(uId1.String())
	u := user.New().ID(uId1).
		Name("e2e").
		Email("e2e@e2e.com").
		Auths([]user.Auth{*auth}).
		Theme(user.ThemeDark).
		Lang(language.Japanese).
		Workspace(wId1).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	u2 := user.New().ID(uId2).
		Name("e2e2").
		Workspace(wId2).
		Email("e2e2@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u2); err != nil {
		return err
	}
	u3 := user.New().ID(uId3).
		Name("e2e3").
		Workspace(wId2).
		Email("e2e3@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u3); err != nil {
		return err
	}
	roleOwner := workspace.Member{
		Role:      workspace.RoleOwner,
		InvitedBy: uId1,
	}
	roleReader := workspace.Member{
		Role:      workspace.RoleReader,
		InvitedBy: uId2,
	}

	w := workspace.New().ID(wId1).
		Name("e2e").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	w2 := workspace.New().ID(wId2).
		Name("e2e2").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
			uId3: roleReader,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w2); err != nil {
		return err
	}

	return nil
}
