package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfigNextMigrations(t *testing.T) {
	c := &Config{
		Migration: 100,
	}
	assert.Equal(t, []int64{200, 500}, c.NextMigrations([]int64{1, 100, 500, 200, 2}))
}
