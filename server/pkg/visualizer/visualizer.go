package visualizer

import (
	"context"
	"runtime"

	"github.com/reearth/reearth/server/pkg/apperr"
	"github.com/reearth/reearthx/log"
)

type Visualizer string

const (
	VisualizerCesium     Visualizer = "cesium"
	VisualizerCesiumBeta Visualizer = "cesium-beta"
)

// ErrorWithCallerLogging logs err together with the location of the caller and
// returns it unchanged. Expected failures (not found, operation denied, invalid
// input, client disconnect) are logged at WARN so that only real defects reach
// the ERROR-based alerting.
func ErrorWithCallerLogging(ctx context.Context, msg string, err error) error {
	_, file, line, _ := runtime.Caller(1)
	if apperr.Expected(err) {
		log.Warnfc(ctx, "[Warn] error with caller logging: %s at %s:%d %+v", msg, file, line, err)
		return err
	}
	log.Errorfc(ctx, "[Error] error with caller logging: %s at %s:%d %+v", msg, file, line, err)
	return err
}

func WarnWithCallerLogging(ctx context.Context, msg string) {
	_, file, line, _ := runtime.Caller(1)
	log.Warnfc(ctx, "[Warn] error with caller logging: %s at %s:%d", msg, file, line)
}
