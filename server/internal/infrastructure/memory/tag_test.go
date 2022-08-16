package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/tag"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestNewTag(t *testing.T) {
	repo := NewTag()
	assert.NotNil(t, repo)

}

func TestTag_FindByID(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tti := tag.Tag(t1)
	repo := Tag{
		data: map[id.TagID]tag.Tag{t1.ID(): tti},
	}
	out, err := repo.FindByID(ctx, t1.ID())
	assert.NoError(t, err)
	assert.Equal(t, tti, out)

	_, err = repo.FindByID(ctx, id.TagID{})
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestTag_FindByIDs(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	sid2 := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	t3, _ := tag.NewItem().NewID().Scene(sid2).Label("item2").Build()
	tti := tag.Tag(t1)
	tti2 := tag.Tag(t3)
	ttg := tag.Tag(t2)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): ttg,
			t3.ID(): tti2,
		},
	}
	out, err := repo.FindByIDs(ctx, []id.TagID{t1.ID(), t2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, []*tag.Tag{&tti, &ttg}, out)
}

func TestTag_FindRootsByScene(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	sid2 := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	t3, _ := tag.NewItem().NewID().Scene(sid2).Label("item2").Build()
	tti := tag.Tag(t1)
	tti2 := tag.Tag(t3)
	ttg := tag.Tag(t2)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): ttg,
			t3.ID(): tti2,
		},
	}
	out, err := repo.FindRootsByScene(ctx, sid2)
	assert.NoError(t, err)
	assert.Equal(t, []*tag.Tag{&tti2}, out)
}

func TestTag_FindGroupByID(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	tti := tag.Tag(t1)
	ttg := tag.Tag(t2)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): ttg,
		},
	}
	out, err := repo.FindGroupByID(ctx, t2.ID())
	assert.NoError(t, err)
	assert.Equal(t, t2, out)

	_, err = repo.FindGroupByID(ctx, id.TagID{})
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestTag_FindItemByID(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	tti := tag.Tag(t1)
	ttg := tag.Tag(t2)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): ttg,
		},
	}
	out, err := repo.FindItemByID(ctx, t1.ID())
	assert.NoError(t, err)
	assert.Equal(t, t1, out)

	_, err = repo.FindItemByID(ctx, id.TagID{})
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestTag_FindGroupByIDs(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Build()
	t2, _ := tag.NewGroup().NewID().Scene(sid).Label("group2").Build()
	ttg := tag.Tag(t1)
	ttg2 := tag.Tag(t2)
	r := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): ttg,
			t2.ID(): ttg2,
		},
	}
	out, err := r.FindGroupByIDs(ctx, []id.TagID{t1.ID(), t2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, []*tag.Group{t1, t2}, out)

	out, err = r.Filtered(repo.SceneFilter{
		Readable: []id.SceneID{},
	}).FindGroupByIDs(ctx, []id.TagID{t1.ID(), t2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, 0, len(out))
}

func TestTag_FindItemByIDs(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	t2, _ := tag.NewItem().NewID().Scene(sid).Label("item2").Build()
	tti := tag.Tag(t1)
	tti2 := tag.Tag(t2)
	r := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): tti2,
		},
	}
	out, err := r.FindItemByIDs(ctx, []id.TagID{t1.ID(), t2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, []*tag.Item{t1, t2}, out)

	out, err = r.Filtered(repo.SceneFilter{
		Readable: []id.SceneID{},
	}).FindItemByIDs(ctx, []id.TagID{t1.ID(), t2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, 0, len(out))
}

func TestTag_Save(t *testing.T) {
	ctx := context.Background()
	repo := NewTag()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tti := tag.Tag(t1)

	err := repo.Save(ctx, tti)
	assert.NoError(t, err)
	out, _ := repo.FindByID(ctx, t1.ID())
	assert.Equal(t, tti, out)
}

func TestTag_SaveAll(t *testing.T) {
	ctx := context.Background()
	repo := NewTag()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	t2, _ := tag.NewItem().NewID().Scene(sid).Label("item2").Build()
	tti := tag.Tag(t1)
	tti2 := tag.Tag(t2)

	err := repo.SaveAll(ctx, []*tag.Tag{&tti, &tti2})
	assert.NoError(t, err)
	out, _ := repo.FindByIDs(ctx, []id.TagID{t1.ID(), t2.ID()})
	assert.Equal(t, []*tag.Tag{&tti, &tti2}, out)
}

func TestTag_Remove(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	tti := tag.Tag(t1)
	ttg := tag.Tag(t2)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): ttg,
		},
	}
	err := repo.Remove(ctx, t1.ID())
	assert.NoError(t, err)
	out, _ := repo.FindRootsByScene(ctx, sid)
	assert.Equal(t, []*tag.Tag{&ttg}, out)
}

func TestTag_RemoveAll(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	t3, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	tti := tag.Tag(t1)
	tti2 := tag.Tag(t2)
	ttg := tag.Tag(t3)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): tti2,
			t3.ID(): ttg,
		},
	}
	err := repo.RemoveAll(ctx, []id.TagID{t1.ID(), t3.ID()})
	assert.NoError(t, err)
	out, _ := repo.FindRootsByScene(ctx, sid)
	assert.Equal(t, []*tag.Tag{&tti2}, out)
}

func TestTag_RemoveByScene(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	sid2 := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewItem().NewID().Scene(sid2).Label("item").Build()
	t3, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	tti := tag.Tag(t1)
	tti2 := tag.Tag(t2)
	ttg := tag.Tag(t3)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): tti2,
			t3.ID(): ttg,
		},
	}
	err := repo.RemoveByScene(ctx, sid)
	assert.NoError(t, err)
	out, _ := repo.FindRootsByScene(ctx, sid2)
	assert.Equal(t, []*tag.Tag{&tti2}, out)
}

func TestTag_FindGroupByItem(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := id.TagIDList{t1.ID()}
	t2, _ := tag.NewGroup().NewID().Scene(sid).Label("group").Tags(tl).Build()
	tti := tag.Tag(t1)
	ttg := tag.Tag(t2)
	repo := Tag{
		data: map[id.TagID]tag.Tag{
			t1.ID(): tti,
			t2.ID(): ttg,
		},
	}
	out, err := repo.FindGroupByItem(ctx, t1.ID())
	assert.NoError(t, err)
	assert.Equal(t, t2, out)
}
