package plugin

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestList_Find(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, p1, List{p1, p2}.Find(p1.ID()))
	assert.Nil(t, List{p1, p2}.Find(id.MustPluginID("hoge~1.0.0")))
	assert.Nil(t, List(nil).Find(p1.ID()))
}

func TestList_Concat(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, List{p1, p2, p2}, List{p1, p2}.Concat(List{p2}))
	assert.Equal(t, List{p1}, List(nil).Concat(List{p1}))
	assert.Equal(t, List{p1}, List{p1}.Concat(nil))
}

func TestList_Map(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, Map{p1.ID(): p1, p2.ID(): p2}, List{p1, p2}.Map())
	assert.Equal(t, Map{}, List(nil).Map())
}

func TestList_MapToIDs(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, List{nil, p2}, List{p1, p2}.MapToIDs([]id.PluginID{id.MustPluginID("hoge~1.0.0"), p2.ID()}))
	assert.Equal(t, List{}, List{p1, p2}.MapToIDs(nil))
	assert.Equal(t, List{nil}, List(nil).MapToIDs([]id.PluginID{p1.ID()}))
}

func TestMap_List(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, List{p1, p2}, Map{p1.ID(): p1, p2.ID(): p2}.List())
	assert.Nil(t, Map(nil).List())
}
