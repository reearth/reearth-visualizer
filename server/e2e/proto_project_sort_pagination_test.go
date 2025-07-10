package e2e

import (
	"context"
	"fmt"
	"testing"
	"time"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestInternalAPI_GetProjectList ./e2e/...

func TestInternalAPI_GetProjectList(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	testDataCount := 20
	testWorkspace := wID2.String()
	limit := 5

	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		SetupTestProjectDatas(t, ctx, r, wID2, testDataCount)

		// ASC UpdateAt
		checkGetProjectsASC(
			t,
			client,
			ctx,
			true,
			&testWorkspace,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*2,
		)

		// ASC Name
		checkGetProjectsASC(
			t,
			client,
			ctx,
			true,
			&testWorkspace,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*2,
		)

		// DESC UpdateAt
		checkGetProjectsDESC(
			t,
			client,
			ctx,
			true,
			&testWorkspace,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*2,
		)

		// DESC Name
		checkGetProjectsDESC(
			t,
			client,
			ctx,
			true,
			&testWorkspace,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*2,
		)

		// keyword search
		keyword := "2"
		checkGetProjectsASCWithKeyword(
			t,
			client,
			ctx,
			true,
			&testWorkspace,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_ASC,
			},
			&keyword,
			limit,
			22,
		)

	})
}

func checkGetProjectsASC(
	t *testing.T,
	client pb.ReEarthVisualizerClient,
	ctx context.Context,
	authenticated bool,
	workspaceId *string,
	sort *pb.ProjectSort,
	limit int,
	testDataCount int,
) {
	var endCursor *string
	limit_int32 := int32(limit)

	for i := 0; i < testDataCount/limit; i++ {

		var pagination *pb.Pagination
		if i == 0 {
			// firtst loop
			pagination = &pb.Pagination{
				First: &limit_int32,
			}
		} else {
			pagination = &pb.Pagination{
				First: &limit_int32,
				After: endCursor,
			}
		}

		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: authenticated,
			WorkspaceId:   workspaceId,
			Sort:          sort,
			Pagination:    pagination,
		})
		assert.Nil(t, err)
		assert.Equal(t, int64(testDataCount), res.PageInfo.TotalCount)

		// for _, v := range res.Projects {
		// 	fmt.Println("==============", v.Id, v.Name)
		// }
		// PbDump(res.PageInfo)

		if i < testDataCount/limit-1 {
			assert.Equal(t, limit, len(res.Projects))
			assert.Equal(t, true, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
			endCursor = res.PageInfo.EndCursor
		} else {
			// last loop
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
		}
	}

}

func checkGetProjectsASCWithKeyword(
	t *testing.T,
	client pb.ReEarthVisualizerClient,
	ctx context.Context,
	authenticated bool,
	workspaceId *string,
	sort *pb.ProjectSort,
	keyword *string,
	limit int,
	testDataCount int,
) {
	var endCursor *string
	limit_int32 := int32(limit)

	for i := 0; i < testDataCount/limit; i++ {

		var pagination *pb.Pagination
		if i == 0 {
			// firtst loop
			pagination = &pb.Pagination{
				First: &limit_int32,
			}
		} else {
			pagination = &pb.Pagination{
				First: &limit_int32,
				After: endCursor,
			}
		}

		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: authenticated,
			WorkspaceId:   workspaceId,
			Sort:          sort,
			Keyword:       keyword,
			Pagination:    pagination,
		})
		assert.Nil(t, err)
		assert.Equal(t, int64(testDataCount), res.PageInfo.TotalCount)

		// for _, v := range res.Projects {
		// 	fmt.Println("==============", v.Id, v.Name)
		// }
		// PbDump(res.PageInfo)

		if i < testDataCount/limit {
			assert.Equal(t, limit, len(res.Projects))
			assert.Equal(t, true, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
			endCursor = res.PageInfo.EndCursor
		} else {
			// last loop
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
		}
	}

}

func checkGetProjectsDESC(
	t *testing.T,
	client pb.ReEarthVisualizerClient,
	ctx context.Context,
	authenticated bool,
	workspaceId *string,
	sort *pb.ProjectSort,
	limit int,
	testDataCount int,
) {
	var startCursor *string
	limit_int32 := int32(limit)

	for i := 0; i < testDataCount/limit; i++ {

		var pagination *pb.Pagination
		if i == 0 {
			// firtst loop
			pagination = &pb.Pagination{
				Last: &limit_int32,
			}
		} else {
			pagination = &pb.Pagination{
				Last:   &limit_int32,
				Before: startCursor,
			}
		}

		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: authenticated,
			WorkspaceId:   workspaceId,
			Sort:          sort,
			Pagination:    pagination,
		})
		assert.Nil(t, err)
		assert.Equal(t, int64(testDataCount), res.PageInfo.TotalCount)

		// for _, v := range res.Projects {
		// 	fmt.Println("==============", v.Id, v.Name)
		// }
		// PbDump(res.PageInfo)

		if i < testDataCount/limit-1 {
			assert.Equal(t, limit, len(res.Projects))
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, true, res.PageInfo.HasPreviousPage)
			startCursor = res.PageInfo.StartCursor
		} else {
			// last loop
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
		}
	}
}

// --- test data ---------------------------------------

type ProjectConfig struct {
	workspace   accountdomain.WorkspaceID
	name        string
	coreSupport bool
	isDeleted   bool
	visibility  string
	updatedAt   time.Time
}

func SetupTestProjectDatas(t *testing.T, ctx context.Context, r *repo.Container, workspace accountdomain.WorkspaceID, dataCount int) {

	startTime := time.Now()

	startCount := 1000 // isDeleted: false visibility: "public"
	for i := startCount; i < startCount+dataCount; i++ {
		conf := ProjectConfig{
			workspace:   workspace,
			name:        fmt.Sprintf("%d", startCount+i),
			coreSupport: true,
			isDeleted:   false,
			visibility:  "public",
			updatedAt:   startTime.Add(time.Duration(i-1000) * time.Second),
		}
		AddProjectSceneStorytelling(t, ctx, r, conf)
	}

	startCount = 2000 // isDeleted: false visibility: "private"
	for i := startCount; i < startCount+dataCount; i++ {
		conf := ProjectConfig{
			workspace:   workspace,
			name:        fmt.Sprintf("%d", startCount+i),
			coreSupport: true,
			isDeleted:   false,
			visibility:  "private",
			updatedAt:   startTime.Add(time.Duration(i-1000) * time.Second),
		}
		AddProjectSceneStorytelling(t, ctx, r, conf)
	}

	startCount = 3000 // isDeleted: true visibility: "public"
	for i := startCount; i < startCount+dataCount; i++ {
		conf := ProjectConfig{
			workspace:   workspace,
			name:        fmt.Sprintf("%d", startCount+i),
			coreSupport: true,
			isDeleted:   true,
			visibility:  "public",
			updatedAt:   startTime.Add(time.Duration(i-1000) * time.Second),
		}
		AddProjectSceneStorytelling(t, ctx, r, conf)
	}

	startCount = 4000 // isDeleted: true visibility: "private"
	for i := startCount; i < startCount+dataCount; i++ {
		conf := ProjectConfig{
			workspace:   workspace,
			name:        fmt.Sprintf("%d", startCount+i),
			coreSupport: true,
			isDeleted:   true,
			visibility:  "private",
			updatedAt:   startTime.Add(time.Duration(i-1000) * time.Second),
		}
		AddProjectSceneStorytelling(t, ctx, r, conf)
	}

}

func AddProjectSceneStorytelling(t *testing.T, ctx context.Context, r *repo.Container, conf ProjectConfig) {

	// project
	pj := project.New().
		NewID().
		Workspace(conf.workspace).
		Name(conf.name).
		Description(conf.name + " Description").
		CoreSupport(conf.coreSupport).
		Deleted(conf.isDeleted).
		Visibility(project.Visibility(conf.visibility)).
		UpdatedAt(conf.updatedAt).
		MustBuild()
	err := r.Project.Save(ctx, pj)
	assert.Nil(t, err)

	schema := builtin.GetPropertySchemaByVisualizer(visualizer.VisualizerCesiumBeta)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sID).Build()

	assert.Nil(t, err)
	ps := scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})

	// scene
	sc := scene.New().
		NewID().
		Project(pj.ID()).
		Property(prop.ID()).
		Workspace(pj.Workspace()).
		UpdatedAt(conf.updatedAt).
		Plugins(ps).
		MustBuild()
	err = r.Scene.Save(ctx, sc)
	assert.Nil(t, err)
	err = r.Property.Save(ctx, prop)
	assert.Nil(t, err)

	schema2 := builtin.GetPropertySchema(builtin.PropertySchemaIDStory)
	prop2, err := property.New().NewID().Schema(schema2.ID()).Scene(sc.ID()).Build()
	assert.Nil(t, err)
	pages := []*storytelling.Page{}
	page, err := _createPage(ctx, r)
	assert.Nil(t, err)
	pages = append(pages, page)

	// storytelling
	st := storytelling.NewStory().
		NewID().
		Title(conf.name).
		Pages(storytelling.NewPageList(pages)).
		Scene(sc.ID()).
		Property(prop2.ID()).
		UpdatedAt(conf.updatedAt).
		MustBuild()
	err = r.Storytelling.Save(ctx, *st)
	assert.Nil(t, err)
	err = r.Property.Save(ctx, prop2)
	assert.Nil(t, err)

}
