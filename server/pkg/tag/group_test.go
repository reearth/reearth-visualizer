package tag

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"

	"github.com/stretchr/testify/assert"
)

var _ Tag = &Group{}

func TestGroupBuilder_NewID(t *testing.T) {
	b := NewGroup().NewID()
	assert.NotEqual(t, ID{}, b.g.id)
}

func TestGroupBuilder_Build(t *testing.T) {
	tid := NewID()
	sid := NewSceneID()
	tags := IDList{
		NewID(),
		NewID(),
	}

	tests := []struct {
		Name, Label string
		Id          ID
		Scene       SceneID
		Tags        IDList
		Expected    struct {
			Group Group
			Error error
		}
	}{
		{
			Name:  "fail: nil tag ID",
			Label: "xxx",
			Scene: NewSceneID(),
			Expected: struct {
				Group Group
				Error error
			}{
				Error: ErrInvalidID,
			},
		},
		{
			Name:  "fail: empty label",
			Id:    NewID(),
			Scene: NewSceneID(),
			Expected: struct {
				Group Group
				Error error
			}{
				Error: ErrEmptyLabel,
			},
		},
		{
			Name:  "fail: nil scene ID",
			Label: "xxx",
			Id:    NewID(),
			Expected: struct {
				Group Group
				Error error
			}{
				Error: ErrInvalidSceneID,
			},
		},
		{
			Name:  "success",
			Id:    tid,
			Label: "xxx",
			Scene: sid,
			Tags:  tags,
			Expected: struct {
				Group Group
				Error error
			}{
				Group: Group{
					tag: tag{
						id:      tid,
						label:   "xxx",
						sceneId: sid,
					},
					tags: tags,
				},
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewGroup().
				ID(tc.Id).
				Scene(tc.Scene).
				Label(tc.Label).
				Tags(tc.Tags).
				Build()
			if tc.Expected.Error == nil {
				assert.Equal(t, tc.Expected.Group.ID(), res.ID())
				assert.Equal(t, tc.Expected.Group.Scene(), res.Scene())
				assert.Equal(t, tc.Expected.Group.Label(), res.Label())
				assert.Equal(t, tc.Expected.Group.Tags(), res.Tags())
			} else {
				assert.Equal(t, tc.Expected.Error, err)
			}
		})
	}
}

func TestGroup_AddTag(t *testing.T) {
	sid := id.NewSceneID()
	tid := id.NewTagID()
	tests := []struct {
		name     string
		tag      *Group
		input    IDList
		expected IDList
	}{
		{
			name:     "should add a tag",
			tag:      NewGroup().NewID().Scene(sid).Label("foo").MustBuild(),
			input:    IDList{tid},
			expected: IDList{tid},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.tag.AddTag(tt.input...)
			assert.Equal(t, tt.tag.tags, tt.expected)
		})
	}
}

func TestGroup_RemoveTag(t *testing.T) {
	sid := id.NewSceneID()
	tid := id.NewTagID()
	tid2 := id.NewTagID()
	tests := []struct {
		name     string
		tag      *Group
		input    IDList
		expected IDList
	}{
		{
			name:     "should remove a tag",
			tag:      NewGroup().NewID().Scene(sid).Label("foo").Tags(IDList{tid, tid2}).MustBuild(),
			input:    IDList{tid2},
			expected: IDList{tid},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.tag.RemoveTag(tt.input...)
			assert.Equal(t, tt.tag.tags, tt.expected)
		})
	}
}
