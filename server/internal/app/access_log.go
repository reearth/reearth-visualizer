package app

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearthx/log"
)

const accessLogMessage = "visualizer_access"

func accessLogger() graphql.OperationMiddleware {
	return func(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
		if fields := accessLogFields(ctx); fields != nil {
			log.GetLoggerFromContextOrDefault(ctx).WithCaller(false).Infow(accessLogMessage, fields...)
		}
		return next(ctx)
	}
}

func accessLogFields(ctx context.Context) []any {
	u := adapter.User(ctx)
	if u == nil || !graphql.HasOperationContext(ctx) {
		return nil
	}
	opCtx := graphql.GetOperationContext(ctx)
	if opCtx == nil || opCtx.Operation == nil {
		return nil
	}

	fields := []any{
		"user_id", u.ID().String(),
		"operation_name", opCtx.OperationName,
		"operation_type", string(opCtx.Operation.Operation),
	}
	if ws := workspaceIDFromVariables(opCtx.Variables); ws != "" {
		fields = append(fields, "workspace_id", ws)
	}
	return fields
}

func workspaceIDFromVariables(vars map[string]any) string {
	if ws, ok := vars["workspaceId"].(string); ok {
		return ws
	}
	for _, v := range vars {
		if input, ok := v.(map[string]any); ok {
			if ws, ok := input["workspaceId"].(string); ok {
				return ws
			}
		}
	}
	return ""
}
