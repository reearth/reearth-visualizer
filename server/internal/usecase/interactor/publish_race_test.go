package interactor

import (
	"context"
	"io"
	"net/url"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	gomongo "go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TestPublishWriteConflict demonstrates that concurrent publishProject calls
// cause MongoDB WriteConflict errors because uploadPublishScene runs inside
// the open transaction, holding locks during GCS I/O.
//
// Run with:
//
//	REEARTH_DB_RS=mongodb://localhost:27018/?replicaSet=rs0&directConnection=true \
//	  go test -v -run TestPublishWriteConflict ./internal/usecase/interactor/
//
// Start a local single-node replica set first:
//
//	docker run -d --name mongo-rs -p 27018:27017 mongo:7 mongod --replSet rs0 --bind_ip_all
//	docker exec mongo-rs mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27018'}]})"
//	sleep 2  # wait for election
func TestPublishWriteConflict(t *testing.T) {
	rsURI := os.Getenv("REEARTH_DB_RS")
	if rsURI == "" {
		t.Skip("REEARTH_DB_RS not set; skipping race reproduction test")
	}

	ctx := context.Background()

	client, err := gomongo.Connect(ctx, options.Client().ApplyURI(rsURI).SetConnectTimeout(10*time.Second))
	require.NoError(t, err)
	t.Cleanup(func() { _ = client.Disconnect(ctx) })

	dbName := "publish_race_test"
	db := client.Database(dbName)
	t.Cleanup(func() { _ = db.Drop(ctx) })

	// Build repos with useTransaction=true (same as production)
	accountRepos := lo.Must(accountsInfra.New(ctx, client, dbName, true, false, nil))
	repos := lo.Must(mongo.New(ctx, db, accountRepos, true))

	wsID := accountsID.NewWorkspaceID()
	ws := accountsWorkspace.New().ID(wsID).MustBuild()
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	prj := project.New().NewID().Workspace(wsID).Name("Race Test").MustBuild()
	require.NoError(t, repos.Project.Save(ctx, prj))

	// scene.Property is required by the mongo decoder (PropertyIDFrom rejects empty string)
	scenePropertyID := id.NewPropertyID()
	sc := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Property(scenePropertyID).Build())
	require.NoError(t, repos.Scene.Save(ctx, sc))

	gateways := &gateway.Container{
		File:          &slowFileGateway{delay: 400 * time.Millisecond},
		PolicyChecker: &allowAllPolicyChecker{},
	}

	projectUC := NewProject(repos, gateways)

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{wsID},
			OwningWorkspaces:   accountsID.WorkspaceIDList{wsID},
		},
	}

	published := project.PublishmentStatusPublic
	params := interfaces.PublishProjectParam{
		ID:     prj.ID(),
		Status: published,
	}

	// Fire two concurrent Publish calls for the same project.
	// With transactions enabled and uploadPublishScene inside the tx,
	// one should fail with WriteConflict.
	var (
		wg     sync.WaitGroup
		errs   = make([]error, 2)
		mu     sync.Mutex
		errIdx int
	)
	for i := range 2 {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			_, err := projectUC.Publish(ctx, params, op)
			if err != nil {
				mu.Lock()
				errs[errIdx] = err
				errIdx++
				mu.Unlock()
			}
		}(i)
	}
	wg.Wait()

	// Both concurrent publishes must succeed. The fix moves the GCS upload
	// outside the transaction so the lock window is milliseconds — too short
	// for concurrent callers to conflict.
	for _, e := range errs {
		assert.NoError(t, e, "concurrent publish should not return WriteConflict after fix")
	}
}

// slowFileGateway wraps the no-op fs gateway but adds a delay to UploadBuiltScene
// to widen the transaction window, making the conflict reliably reproducible.
type slowFileGateway struct {
	delay time.Duration
}

func (s *slowFileGateway) UploadBuiltScene(ctx context.Context, r io.Reader, name string) error {
	// Drain the pipe so the builder goroutine doesn't block/error
	_, _ = io.Copy(io.Discard, r)
	time.Sleep(s.delay)
	return nil
}

func (s *slowFileGateway) UploadStory(ctx context.Context, r io.Reader, name string) error {
	_, _ = io.Copy(io.Discard, r)
	time.Sleep(s.delay)
	return nil
}

func (s *slowFileGateway) ReadAsset(_ context.Context, _ string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader("")), nil
}
func (s *slowFileGateway) UploadAsset(_ context.Context, _ *file.File) (*url.URL, int64, error) {
	return &url.URL{}, 0, nil
}
func (s *slowFileGateway) UploadAssetFromURL(_ context.Context, u *url.URL) (*url.URL, int64, error) {
	return u, 0, nil
}
func (s *slowFileGateway) RemoveAsset(_ context.Context, _ *url.URL) error { return nil }
func (s *slowFileGateway) ReadPluginFile(_ context.Context, _ id.PluginID, _ string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader("")), nil
}
func (s *slowFileGateway) UploadPluginFile(_ context.Context, _ id.PluginID, _ *file.File) error {
	return nil
}
func (s *slowFileGateway) RemovePlugin(_ context.Context, _ id.PluginID) error { return nil }
func (s *slowFileGateway) ReadBuiltSceneFile(_ context.Context, _ string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader("")), nil
}
func (s *slowFileGateway) MoveBuiltScene(_ context.Context, _, _ string) error { return nil }
func (s *slowFileGateway) RemoveBuiltScene(_ context.Context, _ string) error  { return nil }
func (s *slowFileGateway) ReadStoryFile(_ context.Context, _ string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader("")), nil
}
func (s *slowFileGateway) MoveStory(_ context.Context, _, _ string) error { return nil }
func (s *slowFileGateway) RemoveStory(_ context.Context, _ string) error  { return nil }
func (s *slowFileGateway) ReadExportProjectZip(_ context.Context, _ string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader("")), nil
}
func (s *slowFileGateway) UploadExportProjectZip(_ context.Context, _ afero.File) error {
	return nil
}
func (s *slowFileGateway) RemoveExportProjectZip(_ context.Context, _ string) error { return nil }
func (s *slowFileGateway) GenerateSignedUploadUrl(_ context.Context, _ string) (*string, int, *string, error) {
	return lo.ToPtr(""), 0, lo.ToPtr(""), nil
}
func (s *slowFileGateway) ReadImportProjectZip(_ context.Context, _ string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader("")), nil
}
func (s *slowFileGateway) RemoveImportProjectZip(_ context.Context, _ string) error { return nil }

// allowAllPolicyChecker always permits operations
type allowAllPolicyChecker struct{}

func (a *allowAllPolicyChecker) CheckPolicy(_ context.Context, _ gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	return &gateway.PolicyCheckResponse{Allowed: true}, nil
}
