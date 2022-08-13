package tag

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ Tag = &Item{}

func TestItemBuilder_NewID(t *testing.T) {
	b := NewItem().NewID()
	assert.NotEqual(t, ID{}, b.i.id)
}

func TestItemBuilder_Build(t *testing.T) {
	tid := NewID()
	sid := NewSceneID()
	dfid := NewDatasetFieldID()
	did := NewDatasetID()
	dsid := NewDatasetSchemaID()

	tests := []struct {
		Name, Label           string
		Id                    ID
		Scene                 SceneID
		LinkedDatasetFieldID  *DatasetFieldID
		LinkedDatasetID       *DatasetID
		LinkedDatasetSchemaID *DatasetSchemaID
		Expected              struct {
			Item  Item
			Error error
		}
	}{
		{
			Name:  "fail: nil tag ID",
			Label: "xxx",
			Scene: NewSceneID(),
			Expected: struct {
				Item  Item
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
				Item  Item
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewItem().
				ID(tc.Id).
				Scene(tc.Scene).
				Label(tc.Label).
				LinkedDatasetSchemaID(tc.LinkedDatasetSchemaID).
				LinkedDatasetID(tc.LinkedDatasetID).
				LinkedDatasetFieldID(tc.LinkedDatasetFieldID).
				Build()
			if tc.Expected.Error == nil {
				assert.Equal(t, tc.Expected.Item.ID(), res.ID())
				assert.Equal(t, tc.Expected.Item.Scene(), res.Scene())
				assert.Equal(t, tc.Expected.Item.Label(), res.Label())
				assert.Equal(t, tc.Expected.Item.LinkedDatasetFieldID(), res.LinkedDatasetFieldID())
				assert.Equal(t, tc.Expected.Item.LinkedDatasetSchemaID(), res.LinkedDatasetSchemaID())
				assert.Equal(t, tc.Expected.Item.LinkedDatasetID(), res.LinkedDatasetID())
			} else {
				assert.Equal(t, tc.Expected.Error, err)
			}
		})
	}
}
