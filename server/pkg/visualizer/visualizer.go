package visualizer

import (
	"context"
	"runtime"

	"github.com/reearth/reearthx/log"
)

type Visualizer string

const (
	VisualizerCesium     Visualizer = "cesium"
	VisualizerCesiumBeta Visualizer = "cesium-beta"
)

// ErrorWithCallerLogging logs err at ERROR with caller info and returns it unchanged.
// Use for unexpected failures. For expected user-facing failures (not found, permission
// denied, invalid input), prefer WarnErrorWithCallerLogging to keep ERROR-level metrics
// meaningful.
func ErrorWithCallerLogging(ctx context.Context, msg string, err error) error {
	_, file, line, _ := runtime.Caller(1)
	log.Errorfc(ctx, "[Error] error with caller logging: %s at %s:%d %+v", msg, file, line, err)
	return err
}

// WarnErrorWithCallerLogging is the WARN-level counterpart of ErrorWithCallerLogging.
// Use for expected user-facing failures that should not pollute ERROR-level metrics.
func WarnErrorWithCallerLogging(ctx context.Context, msg string, err error) error {
	_, file, line, _ := runtime.Caller(1)
	log.Warnfc(ctx, "[Warn] error with caller logging: %s at %s:%d %+v", msg, file, line, err)
	return err
}

func WarnWithCallerLogging(ctx context.Context, msg string) {
	_, file, line, _ := runtime.Caller(1)
	log.Warnfc(ctx, "[Warn] error with caller logging: %s at %s:%d", msg, file, line)
}
