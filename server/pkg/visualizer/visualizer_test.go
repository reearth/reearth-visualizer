package visualizer

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"testing"

	"github.com/reearth/reearth/server/pkg/apperr"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestErrorWithCallerLogging_Severity pins the severity that actually reaches
// the log, not just the classification helper behind it. The alerting policy
// counts ERROR entries, so a refactor that keeps IsExpected intact but stops
// consulting it would silently bring the noise back.
func TestErrorWithCallerLogging_Severity(t *testing.T) {
	// JSON encoding gives a machine readable severity field.
	log.GCP = true
	t.Cleanup(func() { log.GCP = false })

	tests := []struct {
		name string
		err  error
		want string
	}{
		{name: "not found", err: rerror.ErrNotFound, want: "WARNING"},
		{name: "operation denied stays an error", err: apperr.ErrOperationDenied, want: "ERROR"},
		{name: "wrapped not found", err: fmt.Errorf("failed to export project: %w", rerror.ErrNotFound), want: "WARNING"},
		{name: "context canceled", err: context.Canceled, want: "WARNING"},
		{name: "anything else is a defect", err: errors.New("boom"), want: "ERROR"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			buf := &bytes.Buffer{}
			ctx := log.ContextWith(context.Background(), log.NewWithOutput(buf))

			returned := ErrorWithCallerLogging(ctx, "failed to do the thing", tt.err)

			assert.Equal(t, tt.err, returned, "the error must be returned unchanged")

			var entry struct {
				Severity string `json:"severity"`
				Message  string `json:"message"`
			}
			require.NoError(t, json.Unmarshal(buf.Bytes(), &entry))
			assert.Equal(t, tt.want, entry.Severity)
			assert.Contains(t, entry.Message, "failed to do the thing")
		})
	}
}
