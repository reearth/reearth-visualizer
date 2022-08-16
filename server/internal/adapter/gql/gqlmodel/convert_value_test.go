package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func Test_FromValueType(t *testing.T) {
	assert.Equal(t, value.TypeString, FromValueType(ValueTypeString))
	assert.Equal(t, value.TypeNumber, FromValueType(ValueTypeNumber))
}
