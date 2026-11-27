package apiv1

import (
	"context"
	"fmt"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/apperr"
)

func resolveWorkspace(ctx context.Context, raw string) (accountsID.WorkspaceID, error) {
	if wid, err := accountsID.WorkspaceIDFrom(raw); err == nil {
		return wid, nil
	}
	var zero accountsID.WorkspaceID
	uc, op := usecases(ctx)
	if raw == "" || op == nil || op.AcOperator == nil {
		return zero, notFound(fmt.Sprintf("workspace %q", raw))
	}
	ws, err := uc.Workspace.FindByAlias(ctx, raw, op.AcOperator)
	if err != nil {
		if apperr.Classify(err) == apperr.ClassNotFound {
			return zero, notFound(fmt.Sprintf("workspace %q", raw))
		}
		return zero, err
	}
	return ws.ID(), nil
}
