//go:build e2e

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
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

// make e2e-test TEST_NAME=TestInternalAPI_GetProjectList_Owner
func TestInternalAPI_GetProjectList_Owner(t *testing.T) {
	_, r, _, _, _, result := GRPCServeWithCtx(t, baseSeeder)

	testDataCount := 20
	testWorkspace2 := result.WID2.String()
	limit := 5

	// user2(Owner) call api
	runTestWithUser(t, result.UID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		//####################################
		// Add TestData for user2 workspace
		SetupTestProjectDatas(t, ctx, r, result, result.WID2, testDataCount)
		//####################################

		// ASC UpdateAt
		checkGetProjectsASC(t, client, ctx, true,
			&testWorkspace2,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*4, // all project
		)

		// ASC Name
		checkGetProjectsASC(t, client, ctx, true,
			&testWorkspace2,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*4, // all project
		)

		// DESC UpdateAt
		checkGetProjectsDESC(t, client, ctx, true,
			&testWorkspace2,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*4, // all project
		)

		// DESC Name
		checkGetProjectsDESC(t, client, ctx, true,
			&testWorkspace2,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*4, // all project
		)

		// keyword search
		keyword := "2"
		checkGetProjectsASCWithKeyword(t, client, ctx, true,
			&testWorkspace2,
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_ASC,
			},
			&keyword,
			limit,
			26,
		)

	})

}

// make e2e-test TEST_NAME=TestInternalAPI_GetProjectList_Member
func TestInternalAPI_GetProjectList_Member(t *testing.T) {
	_, r, _, ctx, accountsClient, result := GRPCServeWithCtx(t, baseSeeder)

	testDataCount := 20
	testWorkspace2 := result.WID2.String()
	limit := 5

	// user2(Owner) call api
	runTestWithUser(t, result.UID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		//####################################
		// Add TestData for user2 workspace
		SetupTestProjectDatas(t, ctx, r, result, result.WID2, testDataCount)
		//####################################

	})

	// add user1 to workspace2(user2)
	err := addUserToWorkspaceViaAPI(ctx, accountsClient, result.WID2, result.UID, "reader", result.UID2)
	assert.Nil(t, err)
	if err == nil {
		user1, userErr := r.User.FindByID(ctx, result.UID)
		if userErr == nil && user1 != nil {
			_ = JoinMembers(ctx, r, result.WID2, user1, accountsRole.RoleReader, result.UID2)
		}
	}

	// user1(Member) call api
	runTestWithUser(t, result.UID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// ASC UpdateAt
		checkGetProjectsASC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*4, // all project
		)

		// ASC Name
		checkGetProjectsASC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*4, // all project
		)

		// DESC UpdateAt
		checkGetProjectsDESC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*4, // all project
		)

		// DESC Name
		checkGetProjectsDESC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*4, // all project
		)

		// keyword search
		keyword := "2"
		checkGetProjectsASCWithKeyword(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_ASC,
			},
			&keyword,
			limit,
			26,
		)

	})

}

// make e2e-test TEST_NAME=TestInternalAPI_GetProjectList_Anonymous
func TestInternalAPI_GetProjectList_Anonymous(t *testing.T) {
	_, r, _, _, _, result := GRPCServeWithCtx(t, baseSeeder)

	testDataCount := 20
	testWorkspace2 := result.WID2.String()
	limit := 5

	// user2(Owner) call api
	runTestWithUser(t, result.UID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		//####################################
		// Add TestData for user2 workspace
		SetupTestProjectDatas(t, ctx, r, result, result.WID2, testDataCount)
		//####################################

	})

	// user3(Anonymous) call api
	runTestWithUser(t, result.UID3.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// ASC UpdateAt
		checkGetProjectsASC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*2, // public project only
		)

		// ASC Name
		checkGetProjectsASC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_ASC,
			},
			limit,
			testDataCount*2, // public project only
		)

		// DESC UpdateAt
		checkGetProjectsDESC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_UPDATEDAT,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*2, // public project only
		)

		// DESC Name
		checkGetProjectsDESC(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
			&pb.ProjectSort{
				Field:     pb.ProjectSortField_NAME,
				Direction: pb.SortDirection_DESC,
			},
			limit,
			testDataCount*2, // public project only
		)

		// keyword search
		keyword := "2"
		checkGetProjectsASCWithKeyword(t, client, ctx, true,
			&testWorkspace2, // user2 workspace
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

	loop := testDataCount / limit
	if testDataCount%limit != 0 {
		loop++
	}
	// fmt.Println("============== loop:", loop, " testDataCount:", testDataCount, " limit:", limit)

	for i := 0; i < loop; i++ {

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

		if i == loop {
			// last loop
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
			endCursor = res.PageInfo.EndCursor
		} else {
			assert.Equal(t, limit, len(res.Projects))
			assert.Equal(t, true, res.PageInfo.HasNextPage)
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

	loop := testDataCount / limit
	if testDataCount%limit != 0 {
		loop++
	}
	// fmt.Println("============== loop:", loop, " testDataCount:", testDataCount, " limit:", limit)

	for i := 0; i < loop; i++ {

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
		// fmt.Println("============== i:", i, " HasNextPage:", res.PageInfo.HasNextPage, " HasPreviousPage:", res.PageInfo.HasPreviousPage)

		if i == loop {
			// last loop
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
			endCursor = res.PageInfo.EndCursor
		} else {
			assert.Equal(t, limit, len(res.Projects))
			assert.Equal(t, true, res.PageInfo.HasNextPage)
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

	loop := testDataCount / limit
	if testDataCount%limit != 0 {
		loop++
	}

	// fmt.Println("============== loop:", loop, " testDataCount:", testDataCount, " limit:", limit)

	for i := 0; i < loop; i++ {

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

		if i == loop {
			// last loop
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, false, res.PageInfo.HasPreviousPage)
			startCursor = res.PageInfo.StartCursor
		} else {
			assert.Equal(t, limit, len(res.Projects))
			assert.Equal(t, false, res.PageInfo.HasNextPage)
			assert.Equal(t, true, res.PageInfo.HasPreviousPage)
		}
	}
}

// --- test data ---------------------------------------

type ProjectConfig struct {
	workspace   accountsID.WorkspaceID
	name        string
	coreSupport bool
	isDeleted   bool
	visibility  string
	updatedAt   time.Time
}

func SetupTestProjectDatas(t *testing.T, ctx context.Context, r *repo.Container, result *SeederResult, workspace accountsID.WorkspaceID, dataCount int) {

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
		AddProjectSceneStorytelling(t, ctx, r, result, conf)
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
		AddProjectSceneStorytelling(t, ctx, r, result, conf)
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
		AddProjectSceneStorytelling(t, ctx, r, result, conf)
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
		AddProjectSceneStorytelling(t, ctx, r, result, conf)
	}

}

func AddProjectSceneStorytelling(t *testing.T, ctx context.Context, r *repo.Container, result *SeederResult, conf ProjectConfig) {

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
	sceneID := id.NewSceneID()
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sceneID).Build()

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
	page, err := _createPage(ctx, r, result)
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
