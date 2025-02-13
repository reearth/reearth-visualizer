package plugin

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestList_Find(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, p1, PluginList{p1, p2}.Find(p1.ID()))
	assert.Nil(t, PluginList{p1, p2}.Find(id.MustPluginID("hoge~1.0.0")))
	assert.Nil(t, PluginList(nil).Find(p1.ID()))
}

func TestList_Concat(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, PluginList{p1, p2, p2}, PluginList{p1, p2}.Concat(PluginList{p2}))
	assert.Equal(t, PluginList{p1}, PluginList(nil).Concat(PluginList{p1}))
	assert.Equal(t, PluginList{p1}, PluginList{p1}.Concat(nil))
}

func TestList_Map(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, Map{p1.ID(): p1, p2.ID(): p2}, PluginList{p1, p2}.Map())
	assert.Equal(t, Map{}, PluginList(nil).Map())
}

func TestList_MapToIDs(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, PluginList{nil, p2}, PluginList{p1, p2}.MapToIDs([]id.PluginID{id.MustPluginID("hoge~1.0.0"), p2.ID()}))
	assert.Equal(t, PluginList{}, PluginList{p1, p2}.MapToIDs(nil))
	assert.Equal(t, PluginList{nil}, PluginList(nil).MapToIDs([]id.PluginID{p1.ID()}))
}

func TestMap_PluginList(t *testing.T) {
	p1 := &Plugin{id: id.MustPluginID("foo~1.0.0")}
	p2 := &Plugin{id: id.MustPluginID("bar~1.0.0")}
	assert.Equal(t, PluginList{p1, p2}, Map{p1.ID(): p1, p2.ID(): p2}.List())
	assert.Nil(t, Map(nil).List())
}
