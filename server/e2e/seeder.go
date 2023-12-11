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

	sID    = id.NewSceneID()
	dssID  = id.NewDatasetSchemaID()
	dsID   = id.NewDatasetID()
	dsfID1 = dataset.NewFieldID()
	dsfID2 = dataset.NewFieldID()
	dsfID3 = dataset.NewFieldID()
	dsfID4 = dataset.NewFieldID()

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
