package tag

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_Add(t *testing.T) {
	tid := NewID()
	var tl *List
	tl.Add(tid)
	assert.Nil(t, tl.Tags())
	tl = NewList()
	tl.Add(tid)
	expected := []ID{tid}
	assert.Equal(t, expected, tl.Tags())
}

func TestList_Remove(t *testing.T) {
	tid := NewID()
	tid2 := NewID()
	tags := []ID{
		tid,
		tid2,
	}
	var tl *List
	tl.Remove(tid2)
	assert.Nil(t, tl.Tags())
	tl = NewListFromTags(tags)
	tl.Remove(tid2)
	expected := []ID{tid}
	assert.Equal(t, expected, tl.Tags())
}

func TestList_Has(t *testing.T) {
	tid1 := NewID()
	tid2 := NewID()
	tags := []ID{
		tid1,
	}

	tests := []struct {
		Name     string
		Tags     []ID
		TID      ID
		Expected bool
	}{
		{
			Name:     "false: nil tag list",
			Expected: false,
		},
		{
			Name:     "false: tag not found",
			Tags:     tags,
			TID:      tid2,
			Expected: false,
		},
		{
			Name:     "true: tag found",
			Tags:     tags,
			TID:      tid1,
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := NewListFromTags(tc.Tags).Has(tc.TID)
			assert.Equal(t, tc.Expected, res)
		})
	}
}
