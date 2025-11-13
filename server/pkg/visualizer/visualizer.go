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

func ErrorWithCallerLogging(ctx context.Context, msg string, err error) error {
	_, file, line, _ := runtime.Caller(1)
	log.Errorfc(ctx, "[Error] error with caller logging: %s at %s:%d %+v", msg, file, line, err)
	return err
}

func WarnWithCallerLogging(ctx context.Context, msg string) {
	_, file, line, _ := runtime.Caller(1)
	log.Warnfc(ctx, "[Warn] error with caller logging: %s at %s:%d", msg, file, line)
}
