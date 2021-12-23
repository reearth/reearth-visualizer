package memory

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfig(t *testing.T) {
	ctx := context.Background()
	c := NewConfig()
	assert.NoError(t, c.Unlock(ctx))
}
