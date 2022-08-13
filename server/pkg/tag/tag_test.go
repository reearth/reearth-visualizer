package tag

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestToTagGroup(t *testing.T) {
	tag := Item{}
	group := ToTagGroup(&tag)
	assert.Nil(t, group)
	tag2 := Group{}
	group2 := ToTagGroup(&tag2)
	assert.NotNil(t, group2)
}

func TestToTagItem(t *testing.T) {
	tag := Group{}
	item := ToTagItem(&tag)
	assert.Nil(t, item)
	tag2 := Item{}
	item2 := ToTagItem(&tag2)
	assert.NotNil(t, item2)
}

func TestTag_Rename(t *testing.T) {
	tt := tag{
		label: "xxx",
	}
	tt.Rename("changed")
	assert.Equal(t, "changed", tt.Label())
}
