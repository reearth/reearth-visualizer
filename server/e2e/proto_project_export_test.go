package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/stretchr/testify/assert"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI_export ./e2e/...

func TestInternalAPI_export(t *testing.T) {
	GRPCServer(t, fullSeeder)

	// call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: pID.String(),
		})

		assert.NotNil(t, exp.ProjectDataPath)
		assert.Nil(t, err)

	})
}
