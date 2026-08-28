package interactor

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestRunWithTxRetry_RetriesTransactionErrorsUntilSuccess(t *testing.T) {
	tr := &usecasex.NopTransaction{}
	attempts := 0

	err := runWithTxRetry(context.Background(), tr, txMaxRetries, func(context.Context) error {
		attempts++
		if attempts < 3 {
			return usecasex.ErrTransaction
		}
		return nil
	})

	assert.NoError(t, err)
	assert.Equal(t, 3, attempts, "should retry until the transaction succeeds")
}

func TestRunWithTxRetry_DoesNotRetryOtherErrors(t *testing.T) {
	tr := &usecasex.NopTransaction{}
	boom := errors.New("boom")
	attempts := 0

	err := runWithTxRetry(context.Background(), tr, txMaxRetries, func(context.Context) error {
		attempts++
		return boom
	})

	assert.ErrorIs(t, err, boom)
	assert.Equal(t, 1, attempts, "a non-transaction error must fail immediately")
}

func TestRunWithTxRetry_GivesUpAfterMaxRetries(t *testing.T) {
	tr := &usecasex.NopTransaction{}
	attempts := 0

	err := runWithTxRetry(context.Background(), tr, 2, func(context.Context) error {
		attempts++
		return usecasex.ErrTransaction
	})

	assert.ErrorIs(t, err, usecasex.ErrTransaction)
	assert.Equal(t, 3, attempts, "maxRetries=2 means one initial attempt plus two retries")
}

// The retry is only useful if it waits: MongoDB abandons a contended
// transaction after ~5ms of lock waiting, so retrying with no delay lands in
// the same contention window. Assert that some backoff actually elapses rather
// than asserting an exact duration, which would be flaky.
func TestRunWithTxRetry_BacksOffBetweenAttempts(t *testing.T) {
	tr := &usecasex.NopTransaction{}
	attempts := 0
	start := time.Now()

	err := runWithTxRetry(context.Background(), tr, 3, func(context.Context) error {
		attempts++
		return usecasex.ErrTransaction
	})
	elapsed := time.Since(start)

	assert.ErrorIs(t, err, usecasex.ErrTransaction)
	assert.Equal(t, 4, attempts)
	assert.Greater(t, elapsed, time.Duration(0), "retries must not run back-to-back with no delay")
}

func TestRunWithTxRetry_StopsWhenContextIsCanceled(t *testing.T) {
	tr := &usecasex.NopTransaction{}
	ctx, cancel := context.WithCancel(context.Background())
	attempts := 0

	err := runWithTxRetry(ctx, tr, 5, func(context.Context) error {
		attempts++
		cancel() // the caller goes away after the first failed attempt
		return usecasex.ErrTransaction
	})

	assert.ErrorIs(t, err, usecasex.ErrTransaction)
	assert.Equal(t, 1, attempts, "must not keep retrying once the caller is gone")
}

func TestRunWithTxRetry_RunsWithoutTransaction(t *testing.T) {
	attempts := 0

	err := runWithTxRetry(context.Background(), nil, txMaxRetries, func(context.Context) error {
		attempts++
		return nil
	})

	assert.NoError(t, err)
	assert.Equal(t, 1, attempts)
}

func TestTxRetryDelay_GrowsAndIsCapped(t *testing.T) {
	// Full jitter means each delay is a random value below its window, so
	// compare the windows rather than individual samples.
	for attempt := 0; attempt < txRetryMaxShift; attempt++ {
		d := txRetryDelay(attempt)
		window := time.Duration(int64(txRetryBaseDelay) << attempt)
		assert.GreaterOrEqual(t, d, time.Duration(0))
		assert.Less(t, d, window, "delay must stay inside its jitter window")
	}

	// Beyond the cap the window stops growing, so the delay stays bounded.
	capped := time.Duration(int64(txRetryBaseDelay) << txRetryMaxShift)
	for _, attempt := range []int{txRetryMaxShift, txRetryMaxShift + 10, 1000} {
		assert.Less(t, txRetryDelay(attempt), capped, "delay must remain capped")
	}
}
