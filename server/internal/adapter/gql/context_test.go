package gql

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoaders_PanicsWhenNotAttached(t *testing.T) {
	assert.PanicsWithValue(t,
		"gql: loaders not attached to context — AttachUsecases middleware may be misconfigured",
		func() { loaders(context.Background()) },
	)
}

func TestDataloaders_PanicsWhenNotAttached(t *testing.T) {
	assert.PanicsWithValue(t,
		"gql: dataloaders not attached to context — AttachUsecases middleware may be misconfigured",
		func() { dataloaders(context.Background()) },
	)
}

func TestLoaders_ReturnsLoaderWhenAttached(t *testing.T) {
	l := &Loaders{}
	ctx := context.WithValue(context.Background(), contextLoaders, l)
	require.NotPanics(t, func() {
		got := loaders(ctx)
		assert.Equal(t, l, got)
	})
}

func TestDataloaders_ReturnsDataloaderWhenAttached(t *testing.T) {
	dl := &DataLoaders{}
	ctx := context.WithValue(context.Background(), contextDataloaders, dl)
	require.NotPanics(t, func() {
		got := dataloaders(ctx)
		assert.Equal(t, dl, got)
	})
}
