package tag

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestList_Add(t *testing.T) {
	tid := id.NewTagID()
	var tl *List
	tl.Add(tid)
	assert.Nil(t, tl.Tags())
	tl = NewList()
	tl.Add(tid)
	expected := []id.TagID{tid}
	assert.Equal(t, expected, tl.Tags())
}

func TestList_Remove(t *testing.T) {
	tid := id.NewTagID()
	tid2 := id.NewTagID()
	tags := []id.TagID{
		tid,
		tid2,
	}
	var tl *List
	tl.Remove(tid2)
	assert.Nil(t, tl.Tags())
	tl = NewListFromTags(tags)
	tl.Remove(tid2)
	expected := []id.TagID{tid}
	assert.Equal(t, expected, tl.Tags())
}

func TestList_Has(t *testing.T) {
	tid1 := id.NewTagID()
	tid2 := id.NewTagID()
	tags := []id.TagID{
		tid1,
	}
	testCases := []struct {
		Name     string
		Tags     []id.TagID
		TID      id.TagID
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := NewListFromTags(tc.Tags).Has(tc.TID)
			assert.Equal(t, tc.Expected, res)
		})
	}
}
