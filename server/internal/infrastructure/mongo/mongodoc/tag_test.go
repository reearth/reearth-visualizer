package mongodoc

import (
	"io"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/tag"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestNewTag(t *testing.T) {
	sid := id.NewSceneID()
	dssid := id.NewDatasetSchemaID()
	dsid := id.NewDatasetID()
	dssfid := id.NewDatasetFieldID()
	ti, _ := tag.NewItem().
		NewID().
		Label("Item").
		Scene(sid).
		LinkedDatasetFieldID(dssfid.Ref()).
		LinkedDatasetID(dsid.Ref()).
		LinkedDatasetSchemaID(dssid.Ref()).
		Build()
	tg, _ := tag.NewGroup().
		NewID().
		Label("group").
		Tags(tag.IDList{ti.ID()}).
		Scene(sid).
		Build()
	type args struct {
		t tag.Tag
	}

	tests := []struct {
		name  string
		args  args
		want  *TagDocument
		want1 string
	}{
		{
			name: "New tag group",
			args: args{
				t: tg,
			},
			want: &TagDocument{
				ID:    tg.ID().String(),
				Label: "group",
				Scene: sid.String(),
				Item:  nil,
				Group: &TagGroupDocument{Tags: []string{ti.ID().String()}},
			},
			want1: tg.ID().String(),
		},
		{
			name: "New tag item",
			args: args{
				t: ti,
			},
			want: &TagDocument{
				ID:    ti.ID().String(),
				Label: "Item",
				Scene: sid.String(),
				Item: &TagItemDocument{
					LinkedDatasetFieldID:  dssfid.StringRef(),
					LinkedDatasetID:       dsid.StringRef(),
					LinkedDatasetSchemaID: dssid.StringRef(),
				},
				Group: nil,
			},
			want1: ti.ID().String(),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, got1 := NewTag(tc.args.t)
			assert.Equal(t, tc.want1, got1)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestNewTags(t *testing.T) {
	sid := id.NewSceneID()
	ti, _ := tag.NewItem().
		NewID().
		Label("Item").
		Scene(sid).
		Build()
	tg, _ := tag.NewGroup().
		NewID().
		Label("group").
		Tags(id.TagIDList{ti.ID()}).
		Scene(sid).
		Build()
	tgi := tag.Tag(tg)

	type args struct {
		tags []*tag.Tag
		f    scene.IDList
	}

	tests := []struct {
		name  string
		args  args
		want  []interface{}
		want1 []string
	}{
		{
			name: "new tags",
			args: args{
				tags: []*tag.Tag{
					&tgi,
				},
			},
			want: []interface{}{
				&TagDocument{
					ID:    tg.ID().String(),
					Label: "group",
					Scene: sid.String(),
					Item:  nil,
					Group: &TagGroupDocument{Tags: []string{ti.ID().String()}},
				},
			},
			want1: []string{tgi.ID().String()},
		},
		{
			name: "filtered tags 1",
			args: args{
				tags: []*tag.Tag{
					&tgi,
				},
				f: scene.IDList{tgi.Scene()},
			},
			want: []interface{}{
				&TagDocument{
					ID:    tg.ID().String(),
					Label: "group",
					Scene: sid.String(),
					Item:  nil,
					Group: &TagGroupDocument{Tags: []string{ti.ID().String()}},
				},
			},
			want1: []string{tgi.ID().String()},
		},
		{
			name: "filtered tags 2",
			args: args{
				tags: []*tag.Tag{
					&tgi,
				},
				f: scene.IDList{},
			},
			want:  []interface{}{},
			want1: []string{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, got1 := NewTags(tc.args.tags, tc.args.f)
			assert.Equal(t, tc.want, got)
			assert.Equal(t, tc.want1, got1)
		})
	}
}

func TestTagConsumer_Consume(t *testing.T) {
	sid := id.NewSceneID()
	tg := tag.NewGroup().
		NewID().
		Label("group").
		Scene(sid).
		MustBuild()
	ti := tag.NewItem().
		NewID().
		Label("group").
		Scene(sid).
		MustBuild()
	doc1, _ := NewTag(tg)
	doc2, _ := NewTag(ti)
	r1 := lo.Must(bson.Marshal(doc1))
	r2 := lo.Must(bson.Marshal(doc2))

	tests := []struct {
		name    string
		filter  []id.SceneID
		arg     bson.Raw
		wantErr bool
		wantEOF bool
		result  []tag.Tag
	}{
		{
			name:    "nil",
			filter:  nil,
			arg:     nil,
			wantErr: false,
			wantEOF: true,
			result:  nil,
		},
		{
			name:    "consume tag group",
			filter:  nil,
			arg:     r1,
			wantErr: false,
			wantEOF: false,
			result:  []tag.Tag{tg},
		},
		{
			name:    "consume tag item",
			filter:  nil,
			arg:     r2,
			wantErr: false,
			wantEOF: false,
			result:  []tag.Tag{ti},
		},
		{
			name:    "filtered",
			filter:  []id.SceneID{sid},
			arg:     r2,
			wantErr: false,
			wantEOF: false,
			result:  []tag.Tag{ti},
		},
		{
			name:    "rejected",
			filter:  []id.SceneID{id.NewSceneID()},
			arg:     r2,
			wantErr: false,
			wantEOF: false,
			result:  nil,
		},
		{
			name:    "fail: unmarshal error",
			filter:  nil,
			arg:     []byte{},
			wantErr: true,
			wantEOF: false,
			result:  nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			c := NewTagConsumer(tc.filter)
			err := c.Consume(tc.arg)
			if tc.wantEOF {
				assert.Equal(t, io.EOF, err)
			} else if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tc.result, c.Result)
		})
	}
}

func TestTagDocument_Model(t *testing.T) {
	sid := id.NewSceneID()
	dssid := id.NewDatasetSchemaID()
	dsid := id.NewDatasetID()
	dssfid := id.NewDatasetFieldID()
	ti, _ := tag.NewItem().
		NewID().
		Label("Item").
		Scene(sid).
		LinkedDatasetFieldID(dssfid.Ref()).
		LinkedDatasetID(dsid.Ref()).
		LinkedDatasetSchemaID(dssid.Ref()).
		Build()
	tg, _ := tag.NewGroup().
		NewID().
		Label("group").
		Tags(tag.IDList{ti.ID()}).
		Scene(sid).
		Build()
	type fields struct {
		ID    string
		Label string
		Scene string
		Item  *TagItemDocument
		Group *TagGroupDocument
	}

	tests := []struct {
		name    string
		fields  fields
		want    tag.Tag
		wantErr bool
	}{
		{
			name: "item model",
			fields: fields{
				ID:    ti.ID().String(),
				Label: "Item",
				Scene: sid.String(),
				Item: &TagItemDocument{
					LinkedDatasetFieldID:  dssfid.StringRef(),
					LinkedDatasetID:       dsid.StringRef(),
					LinkedDatasetSchemaID: dssid.StringRef(),
				},
				Group: nil,
			},
			want:    ti,
			wantErr: false,
		},
		{
			name: "group model",
			fields: fields{
				ID:    tg.ID().String(),
				Label: "group",
				Scene: sid.String(),
				Item:  nil,
				Group: &TagGroupDocument{Tags: []string{ti.ID().String()}},
			},
			want:    tg,
			wantErr: false,
		},
		{
			name:    "fail: invalid tag",
			fields:  fields{},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			d := &TagDocument{
				ID:    tc.fields.ID,
				Label: tc.fields.Label,
				Scene: tc.fields.Scene,
				Item:  tc.fields.Item,
				Group: tc.fields.Group,
			}
			got, err := d.Model()
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tc.want, got)
			}
		})
	}
}

func TestTagDocument_ModelGroup(t *testing.T) {
	sid := id.NewSceneID()
	ti, _ := tag.NewItem().
		NewID().
		Label("Item").
		Scene(sid).
		Build()
	tg, _ := tag.NewGroup().
		NewID().
		Label("group").
		Tags(tag.IDList{ti.ID()}).
		Scene(sid).
		Build()
	type fields struct {
		ID    string
		Label string
		Scene string
		Item  *TagItemDocument
		Group *TagGroupDocument
	}

	tests := []struct {
		name    string
		fields  fields
		want    *tag.Group
		wantErr bool
	}{
		{
			name: "invalid id",
			fields: fields{
				ID:    "xxx",
				Group: &TagGroupDocument{},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id",
			fields: fields{
				ID:    id.NewTagID().String(),
				Scene: "xxx",
				Group: &TagGroupDocument{},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid item id",
			fields: fields{
				ID:    id.NewTagID().String(),
				Scene: id.NewSceneID().String(),
				Item:  nil,
				Group: &TagGroupDocument{Tags: []string{"xxx"}},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "pass",
			fields: fields{
				ID:    tg.ID().String(),
				Label: "group",
				Scene: sid.String(),
				Item:  nil,
				Group: &TagGroupDocument{Tags: []string{ti.ID().String()}},
			},
			want:    tg,
			wantErr: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			d := &TagDocument{
				ID:    tc.fields.ID,
				Label: tc.fields.Label,
				Scene: tc.fields.Scene,
				Item:  tc.fields.Item,
				Group: tc.fields.Group,
			}
			got, err := d.ModelGroup()
			if tc.wantErr {
				assert.Error(t, err)
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestTagDocument_ModelItem(t *testing.T) {
	sid := id.NewSceneID()
	dssid := id.NewDatasetSchemaID()
	dsid := id.NewDatasetID()
	dssfid := id.NewDatasetFieldID()
	ti, _ := tag.NewItem().
		NewID().
		Label("Item").
		Scene(sid).
		LinkedDatasetFieldID(dssfid.Ref()).
		LinkedDatasetID(dsid.Ref()).
		LinkedDatasetSchemaID(dssid.Ref()).
		Build()
	type fields struct {
		ID    string
		Label string
		Scene string
		Item  *TagItemDocument
		Group *TagGroupDocument
	}

	tests := []struct {
		name    string
		fields  fields
		want    *tag.Item
		wantErr bool
	}{
		{
			name: "invalid id",
			fields: fields{
				ID:   "xxx",
				Item: &TagItemDocument{},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id",
			fields: fields{
				ID:    id.NewTagID().String(),
				Scene: "xxx",
				Item:  &TagItemDocument{},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "pass",
			fields: fields{
				ID:    ti.ID().String(),
				Label: ti.Label(),
				Scene: ti.Scene().String(),
				Item: &TagItemDocument{
					LinkedDatasetFieldID:  dssfid.StringRef(),
					LinkedDatasetID:       dsid.StringRef(),
					LinkedDatasetSchemaID: dssid.StringRef(),
				},
				Group: nil,
			},
			want:    ti,
			wantErr: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			d := &TagDocument{
				ID:    tc.fields.ID,
				Label: tc.fields.Label,
				Scene: tc.fields.Scene,
				Item:  tc.fields.Item,
				Group: tc.fields.Group,
			}
			got, err := d.ModelItem()
			if tc.wantErr {
				assert.Error(t, err)
			}
			assert.Equal(t, tc.want, got)
		})
	}
}
