package tag

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

var _ Tag = &Item{}

func TestItemBuilder_NewID(t *testing.T) {
	b := NewItem().NewID()
	assert.NotEqual(t, id.TagID{}, b.i.id)
}

func TestItemBuilder_Build(t *testing.T) {
	tid := id.NewTagID()
	sid := id.NewSceneID()
	dfid := id.NewDatasetSchemaFieldID()
	did := id.NewDatasetID()
	dsid := id.NewDatasetSchemaID()
	testCases := []struct {
		Name, Label           string
		Id                    id.TagID
		Scene                 id.SceneID
		LinkedDatasetFieldID  *id.DatasetSchemaFieldID
		LinkedDatasetID       *id.DatasetID
		LinkedDatasetSchemaID *id.DatasetSchemaID
		Expected              struct {
			Item  Item
			Error error
		}
	}{
		{
			Name:  "fail: nil tag ID",
			Label: "xxx",
			Scene: id.NewSceneID(),
			Expected: struct {
				Item  Item
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
				Item  Item
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
				Item  Item
				Error error
			}{
				Error: ErrInvalidSceneID,
			},
		},
		{
			Name:                  "success",
			Label:                 "xxx",
			Id:                    tid,
			Scene:                 sid,
			LinkedDatasetFieldID:  dfid.Ref(),
			LinkedDatasetID:       did.Ref(),
			LinkedDatasetSchemaID: dsid.Ref(),
			Expected: struct {
				Item  Item
				Error error
			}{
				Item: Item{
					tag: tag{
						id:      tid,
						label:   "xxx",
						sceneId: sid,
					},
					linkedDatasetFieldID:  dfid.Ref(),
					linkedDatasetID:       did.Ref(),
					linkedDatasetSchemaID: dsid.Ref(),
				},
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewItem().
				ID(tc.Id).
				Scene(tc.Scene).
				Label(tc.Label).
				LinkedDatasetSchemaID(tc.LinkedDatasetSchemaID).
				LinkedDatasetID(tc.LinkedDatasetID).
				LinkedDatasetFieldID(tc.LinkedDatasetFieldID).
				Build()
			if tc.Expected.Error == nil {
				assert.Equal(tt, tc.Expected.Item.ID(), res.ID())
				assert.Equal(tt, tc.Expected.Item.Scene(), res.Scene())
				assert.Equal(tt, tc.Expected.Item.Label(), res.Label())
				assert.Equal(tt, tc.Expected.Item.LinkedDatasetFieldID(), res.LinkedDatasetFieldID())
				assert.Equal(tt, tc.Expected.Item.LinkedDatasetSchemaID(), res.LinkedDatasetSchemaID())
				assert.Equal(tt, tc.Expected.Item.LinkedDatasetID(), res.LinkedDatasetID())
			} else {
				assert.Equal(tt, tc.Expected.Error, err)
			}
		})
	}
}
