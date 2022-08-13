package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ Tag = &TagItem{}
var _ Tag = &TagGroup{}

func TestNewTagItem(t *testing.T) {
	tag := NewTagID()
	type args struct {
		t TagID
	}

	tests := []struct {
		name string
		args args
		want *TagItem
	}{
		{
			name: "ok",
			args: args{t: tag},
			want: &TagItem{id: tag},
		},
		{
			name: "nil id",
			args: args{t: TagID{}},
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewTagItem(tt.args.t))
		})
	}
}

func TestTagItemFrom(t *testing.T) {
	tag := NewTagID()
	type args struct {
		t Tag
	}

	tests := []struct {
		name string
		args args
		want *TagItem
	}{
		{
			name: "item",
			args: args{t: &TagItem{id: tag}},
			want: &TagItem{id: tag},
		},
		{
			name: "group",
			args: args{t: &TagGroup{id: tag}},
			want: nil,
		},
		{
			name: "nil item",
			args: args{t: (*TagItem)(nil)},
			want: nil,
		},
		{
			name: "nil group",
			args: args{t: (*TagGroup)(nil)},
			want: nil,
		},
		{
			name: "nil",
			args: args{t: nil},
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, TagItemFrom(tt.args.t))
		})
	}
}

func TestTagItem_ID(t *testing.T) {
	tag := NewTagID()

	tests := []struct {
		name   string
		target *TagItem
		want   TagID
	}{
		{
			name:   "ok",
			target: &TagItem{id: tag},
			want:   tag,
		},
		{
			name:   "nil",
			target: nil,
			want:   TagID{},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.ID())
		})
	}
}

func TestTagItem_Clone(t *testing.T) {
	tag := NewTagID()

	tests := []struct {
		name   string
		target *TagItem
	}{
		{
			name:   "ok",
			target: &TagItem{id: tag},
		},
		{
			name:   "nil",
			target: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.Clone()
			assert.Equal(t, tt.target, res)
			if tt.target != nil {
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}

func TestTagItem_CloneItem(t *testing.T) {
	tag := NewTagID()

	tests := []struct {
		name   string
		target *TagItem
	}{
		{
			name:   "ok",
			target: &TagItem{id: tag},
		},
		{
			name:   "nil",
			target: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.CloneItem()
			assert.Equal(t, tt.target, res)
			if tt.target != nil {
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}

func TestNewTagGroup(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	type args struct {
		t        TagID
		children []*TagItem
	}

	tests := []struct {
		name string
		args args
		want *TagGroup
	}{
		{
			name: "ok",
			args: args{
				t: tag1,
				children: []*TagItem{
					{id: tag2},
					{id: tag3},
				},
			},
			want: &TagGroup{
				id: tag1,
				children: []*TagItem{
					{id: tag2},
					{id: tag3},
				},
			},
		},
		{
			name: "nil id",
			args: args{t: TagID{}},
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewTagGroup(tt.args.t, tt.args.children))
		})
	}
}

func TestTagGroupFrom(t *testing.T) {
	tag := NewTagID()
	type args struct {
		t Tag
	}

	tests := []struct {
		name string
		args args
		want *TagGroup
	}{
		{
			name: "group",
			args: args{t: &TagGroup{id: tag}},
			want: &TagGroup{id: tag},
		},
		{
			name: "item",
			args: args{t: &TagItem{id: tag}},
			want: nil,
		},
		{
			name: "nil item",
			args: args{t: (*TagItem)(nil)},
			want: nil,
		},
		{
			name: "nil group",
			args: args{t: (*TagGroup)(nil)},
			want: nil,
		},
		{
			name: "nil",
			args: args{t: nil},
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, TagGroupFrom(tt.args.t))
		})
	}
}

func TestTagGroup_ID(t *testing.T) {
	tag := NewTagID()

	tests := []struct {
		name   string
		target *TagGroup
		want   TagID
	}{
		{
			name:   "ok",
			target: &TagGroup{id: tag},
			want:   tag,
		},
		{
			name:   "nil",
			target: nil,
			want:   TagID{},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.ID())
		})
	}
}

func TestTagGroup_Children(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()

	tests := []struct {
		name   string
		target *TagGroup
		want   []*TagItem
	}{
		{
			name:   "ok",
			target: &TagGroup{id: tag1, children: []*TagItem{{id: tag2}}},
			want:   []*TagItem{{id: tag2}},
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.Children()
			assert.Equal(t, tt.want, res)
			if tt.want != nil {
				assert.NotSame(t, tt.target.children, res)
			}
		})
	}
}

func TestTagGroup_Find(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	type args struct {
		ti TagID
	}

	tests := []struct {
		name   string
		target *TagGroup
		args   args
		want   *TagItem
	}{
		{
			name:   "ok",
			target: &TagGroup{id: tag1, children: []*TagItem{{id: tag2}, {id: tag3}}},
			args:   args{ti: tag2},
			want:   &TagItem{id: tag2},
		},
		{
			name:   "not found",
			target: &TagGroup{id: tag1, children: []*TagItem{{id: tag2}, {id: tag3}}},
			args:   args{ti: tag1},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{ti: tag1},
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.Find(tt.args.ti)
			assert.Equal(t, tt.want, res)
		})
	}
}

func TestTagGroup_Add(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	type args struct {
		ti *TagItem
	}

	tests := []struct {
		name         string
		target       *TagGroup
		args         args
		want         bool
		wantChildren []*TagItem
	}{
		{
			name:         "ok",
			target:       &TagGroup{id: tag1, children: []*TagItem{{id: tag3}}},
			args:         args{ti: &TagItem{id: tag2}},
			want:         true,
			wantChildren: []*TagItem{{id: tag3}, {id: tag2}},
		},
		{
			name:         "not added",
			target:       &TagGroup{id: tag1, children: []*TagItem{{id: tag2}, {id: tag3}}},
			args:         args{ti: &TagItem{id: tag2}},
			want:         false,
			wantChildren: []*TagItem{{id: tag2}, {id: tag3}},
		},
		{
			name:         "nil item",
			target:       &TagGroup{id: tag1, children: []*TagItem{{id: tag2}}},
			args:         args{ti: nil},
			wantChildren: []*TagItem{{id: tag2}},
		},
		{
			name:         "nil",
			target:       nil,
			args:         args{ti: &TagItem{id: tag2}},
			wantChildren: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Add(tt.args.ti))
			assert.Equal(t, tt.wantChildren, tt.target.Children())
		})
	}
}

func TestTagGroup_Delete(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	type args struct {
		ti TagID
	}

	tests := []struct {
		name         string
		target       *TagGroup
		args         args
		want         bool
		wantChildren []*TagItem
	}{
		{
			name:         "ok",
			target:       &TagGroup{id: tag1, children: []*TagItem{{id: tag2}, {id: tag3}}},
			args:         args{ti: tag2},
			want:         true,
			wantChildren: []*TagItem{{id: tag3}},
		},
		{
			name:         "not found",
			target:       &TagGroup{id: tag1, children: []*TagItem{{id: tag2}, {id: tag3}}},
			args:         args{ti: tag1},
			want:         false,
			wantChildren: []*TagItem{{id: tag2}, {id: tag3}},
		},
		{
			name:         "nil",
			target:       nil,
			args:         args{ti: tag1},
			wantChildren: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Delete(tt.args.ti))
			assert.Equal(t, tt.wantChildren, tt.target.Children())
		})
	}
}

func TestTagGroup_Clone(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()

	tests := []struct {
		name   string
		target *TagGroup
	}{
		{
			name:   "ok",
			target: &TagGroup{id: tag1, children: []*TagItem{{id: tag2}}},
		},
		{
			name:   "nil",
			target: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.Clone()
			assert.Equal(t, tt.target, res)
			if tt.target != nil {
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}

func TestTagGroup_CloneGroup(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()

	tests := []struct {
		name   string
		target *TagGroup
	}{
		{
			name:   "ok",
			target: &TagGroup{id: tag1, children: []*TagItem{{id: tag2}}},
		},
		{
			name:   "nil",
			target: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.CloneGroup()
			assert.Equal(t, tt.target, res)
			if tt.target != nil {
				assert.NotSame(t, tt.target, res)
				if tt.target.children != nil {
					assert.NotSame(t, tt.target.children, res.children)
				}
			}
		})
	}
}

func TestNewTagList(t *testing.T) {
	tag := NewTagID()

	type args struct {
		tags []Tag
	}

	tests := []struct {
		name string
		args args
		want *TagList
	}{
		{
			name: "ok",
			args: args{tags: []Tag{&TagItem{id: tag}}},
			want: &TagList{tags: []Tag{&TagItem{id: tag}}},
		},
		{
			name: "nil",
			args: args{tags: nil},
			want: &TagList{tags: nil},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := NewTagList(tt.args.tags)
			assert.Equal(t, tt.want, res)
			assert.NotSame(t, res.tags, tt.args.tags)
		})
	}
}

func TestTagList_Tags(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	tests := []struct {
		name   string
		target *TagList
		want   []Tag
	}{
		{
			name: "ok",
			target: &TagList{
				tags: []Tag{&TagGroup{id: tag1, children: []*TagItem{{id: tag2}}}, &TagItem{id: tag3}},
			},
			want: []Tag{&TagGroup{id: tag1, children: []*TagItem{{id: tag2}}}, &TagItem{id: tag3}},
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.Tags()
			assert.Equal(t, tt.want, res)
			if tt.want != nil {
				assert.NotSame(t, tt.target.tags, res)
			}
		})
	}
}

func TestTagList_Add(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	type args struct {
		ti Tag
	}

	tests := []struct {
		name         string
		target       *TagList
		args         args
		want         bool
		wantChildren []Tag
	}{
		{
			name: "item added",
			target: &TagList{
				tags: []Tag{
					&TagGroup{id: tag1, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: &TagItem{id: tag2}},
			want: true,
			wantChildren: []Tag{
				&TagGroup{id: tag1, children: []*TagItem{{id: tag3}}},
				&TagItem{id: tag2},
			},
		},
		{
			name: "group added",
			target: &TagList{
				tags: []Tag{
					&TagGroup{id: tag1, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: &TagGroup{id: tag2}},
			want: true,
			wantChildren: []Tag{
				&TagGroup{id: tag1, children: []*TagItem{{id: tag3}}},
				&TagGroup{id: tag2},
			},
		},
		{
			name: "not added",
			target: &TagList{
				tags: []Tag{&TagItem{id: tag2}, &TagGroup{id: tag1, children: []*TagItem{{id: tag3}}}},
			},
			args: args{ti: &TagGroup{id: tag2}},
			want: false,
			wantChildren: []Tag{
				&TagItem{id: tag2},
				&TagGroup{id: tag1, children: []*TagItem{{id: tag3}}},
			},
		},
		{
			name: "nil tag",
			target: &TagList{
				tags: []Tag{&TagItem{id: tag2}, &TagGroup{id: tag1, children: []*TagItem{{id: tag3}}}},
			},
			args:         args{ti: nil},
			want:         false,
			wantChildren: []Tag{&TagItem{id: tag2}, &TagGroup{id: tag1, children: []*TagItem{{id: tag3}}}},
		},
		{
			name: "nil item tag",
			target: &TagList{
				tags: []Tag{&TagItem{id: tag2}, &TagGroup{id: tag1, children: []*TagItem{{id: tag3}}}},
			},
			args:         args{ti: (*TagItem)(nil)},
			want:         false,
			wantChildren: []Tag{&TagItem{id: tag2}, &TagGroup{id: tag1, children: []*TagItem{{id: tag3}}}},
		},
		{
			name:         "nil",
			args:         args{ti: &TagGroup{id: tag2}},
			target:       nil,
			wantChildren: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Add(tt.args.ti))
			assert.Equal(t, tt.wantChildren, tt.target.Tags())
		})
	}
}

func TestTagList_Delete(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()
	tag4 := NewTagID()

	type args struct {
		ti TagID
	}

	tests := []struct {
		name     string
		target   *TagList
		args     args
		want     bool
		wantTags []Tag
	}{
		{
			name: "ok",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: tag1},
			want: true,
			wantTags: []Tag{
				&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
			},
		},
		{
			name: "not found",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: tag4},
			want: false,
			wantTags: []Tag{
				&TagItem{id: tag1},
				&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
			},
		},
		{
			name:     "nil",
			target:   nil,
			args:     args{ti: tag1},
			wantTags: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Delete(tt.args.ti))
			assert.Equal(t, tt.wantTags, tt.target.Tags())
		})
	}
}

func TestTagList_Find(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()
	tag4 := NewTagID()

	type args struct {
		ti TagID
	}

	tests := []struct {
		name      string
		target    *TagList
		args      args
		wantGroup *TagGroup
		wantItem  *TagItem
	}{
		{
			name: "group",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args:      args{ti: tag2},
			wantGroup: &TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
			wantItem:  nil,
		},
		{
			name: "item",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args:      args{ti: tag3},
			wantGroup: &TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
			wantItem:  &TagItem{id: tag3},
		},
		{
			name: "root item",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args:      args{ti: tag1},
			wantGroup: nil,
			wantItem:  &TagItem{id: tag1},
		},
		{
			name: "not found",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args:      args{ti: tag4},
			wantGroup: nil,
			wantItem:  nil,
		},
		{
			name:      "nil",
			target:    nil,
			args:      args{ti: tag1},
			wantGroup: nil,
			wantItem:  nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			resGroup, resItem := tt.target.Find(tt.args.ti)
			assert.Equal(t, tt.wantGroup, resGroup)
			assert.Equal(t, tt.wantItem, resItem)
		})
	}
}

func TestTagList_FindGroup(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	type args struct {
		ti TagID
	}

	tests := []struct {
		name   string
		target *TagList
		args   args
		want   *TagGroup
	}{
		{
			name: "ok",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: tag2},
			want: &TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
		},
		{
			name: "not found",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: tag1},
			want: nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{ti: tag1},
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.FindGroup(tt.args.ti))
		})
	}
}

func TestTagList_FindItem(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	type args struct {
		ti TagID
	}

	tests := []struct {
		name   string
		target *TagList
		args   args
		want   *TagItem
	}{
		{
			name: "ok",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: tag3},
			want: &TagItem{id: tag3},
		},
		{
			name: "root item",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: tag1},
			want: &TagItem{id: tag1},
		},
		{
			name: "not found",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			args: args{ti: tag2},
			want: nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{ti: tag1},
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.FindItem(tt.args.ti))
		})
	}
}

func TestTagList_RootItems(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	tests := []struct {
		name   string
		target *TagList
		want   []*TagItem
	}{
		{
			name: "ok",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			want: []*TagItem{{id: tag1}},
		},
		{
			name: "no roots",
			target: &TagList{
				tags: []Tag{
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
			want: []*TagItem{},
		},
		{
			name:   "empty",
			target: &TagList{},
			want:   []*TagItem{},
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.RootItems())
		})
	}
}

func TestTagList_IsEmpty(t *testing.T) {
	tag := NewTagID()

	tests := []struct {
		name   string
		target *TagList
		want   bool
	}{
		{
			name: "ok",
			target: &TagList{
				tags: []Tag{&TagItem{id: tag}},
			},
			want: false,
		},
		{
			name:   "empty",
			target: &TagList{},
			want:   true,
		},
		{
			name:   "nil",
			target: nil,
			want:   true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.IsEmpty())
		})
	}
}

func TestTagList_Clone(t *testing.T) {
	tag1 := NewTagID()
	tag2 := NewTagID()
	tag3 := NewTagID()

	tests := []struct {
		name   string
		target *TagList
	}{
		{
			name: "ok",
			target: &TagList{
				tags: []Tag{
					&TagItem{id: tag1},
					&TagGroup{id: tag2, children: []*TagItem{{id: tag3}}},
				},
			},
		},
		{
			name:   "nil",
			target: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.Clone()
			assert.Equal(t, tt.target, res)
			if tt.target != nil {
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}
