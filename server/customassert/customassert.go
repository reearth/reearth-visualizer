package customassert

import (
	"github.com/stretchr/testify/assert"
)

func NotSame(t assert.TestingT, expected, actual interface{}, msgAndArgs ...interface{}) bool {
	return assert.NotSame(t, &expected, &actual, msgAndArgs...)
}
