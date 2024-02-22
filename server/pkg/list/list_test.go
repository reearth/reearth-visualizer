package list_test

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/list"
	"github.com/stretchr/testify/assert"
)

func TestLast(t *testing.T) {
	int1 := 1
	int2 := 2

	tests := []struct {
		name   string
		target []*int
		want   *int
	}{
		{
			name:   "last element",
			target: []*int{&int1, &int2},
			want:   &int2,
		},
		{
			name:   "empty slice",
			target: []*int{},
			want:   nil,
		},
		{
			name:   "nil slice",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, list.Last(tt.target))
		})
	}
}
