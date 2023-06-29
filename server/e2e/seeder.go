package e2e

import (
	"context"
	"net/url"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var (
	uId    = user.NewID()
	uEmail = "e2e@e2e.com"
	uName  = "e2e"
	wId    = workspace.NewID()
	pId    = id.NewProjectID()
	pAlias = "PROJECT_ALIAS"

	sId   = id.NewSceneID()
	dssId = dataset.NewSchemaID()

	now = time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC)
)

func baseSeeder(ctx context.Context, r *repo.Container) error {
	defer util.MockNow(now)()

	u := user.New().
		ID(uId).
		Workspace(wId).
		Name(uName).
		Email(uEmail).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}

	w := workspace.New().ID(wId).
		Name("e2e").
		Personal(false).
		Members(map[id.UserID]workspace.Role{u.ID(): workspace.RoleOwner}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	p := project.New().ID(pId).
		Name("p1").
		Description("p1 desc").
		ImageURL(lo.Must(url.Parse("https://test.com"))).
		Workspace(w.ID()).
		Alias(pAlias).
		MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	fId1, fId2, fId3, fId4 := dataset.NewFieldID(), dataset.NewFieldID(), dataset.NewFieldID(), dataset.NewFieldID()
	dss := dataset.NewSchema().ID(dssId).
		Name("test.csv").
		Scene(sId).
		Fields([]*dataset.SchemaField{
			dataset.NewSchemaField().ID(fId1).Name("f1").Type(dataset.ValueTypeString).MustBuild(),
			dataset.NewSchemaField().ID(fId2).Name("f2").Type(dataset.ValueTypeNumber).MustBuild(),
			dataset.NewSchemaField().ID(fId3).Name("f3").Type(dataset.ValueTypeBool).MustBuild(),
			dataset.NewSchemaField().ID(fId4).Name("location").Type(dataset.ValueTypeLatLng).MustBuild(),
		}).
		Source("file:///dss.csv").
		MustBuild()
	if err := r.DatasetSchema.Save(ctx, dss); err != nil {
		return err
	}

	ds := dataset.New().ID(id.NewDatasetID()).Schema(dss.ID()).Scene(sId).
		Fields([]*dataset.Field{
			dataset.NewField(fId1, dataset.ValueTypeString.ValueFrom("test"), ""),
			dataset.NewField(fId2, dataset.ValueTypeNumber.ValueFrom(123), ""),
			dataset.NewField(fId3, dataset.ValueTypeBool.ValueFrom(true), ""),
			dataset.NewField(fId4, dataset.ValueTypeLatLng.ValueFrom(dataset.LatLng{Lat: 11, Lng: 12}), ""),
		}).
		MustBuild()
	if err := r.Dataset.Save(ctx, ds); err != nil {
		return err
	}

	return nil
}
