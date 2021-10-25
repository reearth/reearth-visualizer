package tag

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

var _ Tag = &Group{}

func TestGroupBuilder_NewID(t *testing.T) {
	b := NewGroup().NewID()
	assert.NotEqual(t, id.TagID{}, b.g.id)
}

func TestGroupBuilder_Build(t *testing.T) {
	tid := id.NewTagID()
	sid := id.NewSceneID()
	tags := []id.TagID{
		id.NewTagID(),
		id.NewTagID(),
	}
	testCases := []struct {
		Name, Label string
		Id          id.TagID
		Scene       id.SceneID
		Tags        *List
		Expected    struct {
			Group Group
			Error error
		}
	}{
		{
			Name:  "fail: nil tag ID",
			Label: "xxx",
			Scene: id.NewSceneID(),
			Expected: struct {
				Group Group
				Error error
			}{
				Error: id.ErrInvalidID,
			},
		},
		{
			Name:  "fail: empty label",
			Id:    id.NewTagID(),
			Scene: id.NewSceneID(),
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
			Id:    id.NewTagID(),
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
			Tags: &List{
				tags: tags,
			},
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
					tags: &List{
						tags: tags,
					},
				},
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewGroup().
				ID(tc.Id).
				Scene(tc.Scene).
				Label(tc.Label).
				Tags(tc.Tags).
				Build()
			if tc.Expected.Error == nil {
				assert.Equal(tt, tc.Expected.Group.ID(), res.ID())
				assert.Equal(tt, tc.Expected.Group.Scene(), res.Scene())
				assert.Equal(tt, tc.Expected.Group.Label(), res.Label())
				assert.Equal(tt, tc.Expected.Group.Tags(), res.Tags())
			} else {
				assert.Equal(tt, tc.Expected.Error, err)
			}
		})
	}
}
