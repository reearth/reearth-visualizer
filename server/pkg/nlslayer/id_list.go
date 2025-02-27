// moved from github.com/reearth/reearth/server/pkg/layer
package nlslayer

import "github.com/reearth/reearth/server/pkg/id"

type IDList struct {
	layers id.NLSLayerIDList
	// for checking duplication
	layerIDs map[id.NLSLayerID]struct{}
}

func NewIDList(layers []id.NLSLayerID) *IDList {
	ll := IDList{}
	if len(layers) == 0 {
		return &ll
	}

	ll.layers = append([]id.NLSLayerID{}, layers...)
	ll.layerIDs = make(map[id.NLSLayerID]struct{}, len(layers))
	for _, l := range layers {
		ll.layerIDs[l] = struct{}{}
	}
	return &ll
}

func (l *IDList) Layers() []id.NLSLayerID {
	if l == nil {
		return nil
	}
	result := append([]id.NLSLayerID{}, l.layers...)
	return result
}

func (l *IDList) HasLayer(id id.NLSLayerID) bool {
	if l == nil || len(l.layerIDs) == 0 {
		return false
	}
	_, ok := l.layerIDs[id]
	return ok
}

func (l *IDList) LayerAt(index int) id.NLSLayerID {
	if l == nil || index < 0 || len(l.layers) <= index {
		return id.NLSLayerID{}
	}
	return l.layers[index]
}

func (l *IDList) AtRef(index int) *id.NLSLayerID {
	if l == nil || index < 0 || len(l.layers) <= index {
		return nil
	}
	return &l.layers[index]
}

func (l *IDList) FindLayerIndex(id id.NLSLayerID) int {
	if l == nil {
		return -1
	}
	for i, l := range l.layers {
		if l == id {
			return i
		}
	}
	return -1
}

func (l *IDList) LayerCount() int {
	if l == nil {
		return 0
	}
	return len(l.layers)
}

func (l *IDList) AddLayer(lid id.NLSLayerID, index int) {
	if l == nil || l.HasLayer(lid) {
		return
	}
	if l.layerIDs == nil {
		l.layerIDs = make(map[id.NLSLayerID]struct{})
	}

	l.layerIDs[lid] = struct{}{}

	le := len(l.layers)
	if index < 0 || le <= index {
		l.layers = append(l.layers, lid)
	} else {
		l.layers = append(l.layers[:index], append([]id.NLSLayerID{lid}, l.layers[index:]...)...)
	}
}

func (l *IDList) AppendLayers(lid ...id.NLSLayerID) *IDList {
	if l == nil {
		return NewIDList(lid)
	}
	for _, i := range lid {
		l.AddLayer(i, -1)
	}
	return l
}

func (l *IDList) Merge(l2 *IDList) {
	l.AppendLayers(l2.layers...)
}

func (l *IDList) Clone() (l2 *IDList) {
	if l == nil {
		return l2
	}
	return NewIDList(l.layers)
}

func (l *IDList) AddOrMoveLayer(lid id.NLSLayerID, index int) {
	if l == nil {
		return
	}

	le := len(l.layers)
	if index < 0 || le <= index {
		index = le
	}

	if l.HasLayer(lid) {
		l.MoveLayer(lid, index)
		return
	}
	l.layers = append(l.layers[:index], append([]id.NLSLayerID{lid}, l.layers[index:]...)...)
	l.layerIDs[lid] = struct{}{}
}

func (l *IDList) MoveLayer(id id.NLSLayerID, toIndex int) {
	if l == nil {
		return
	}

	for fromIndex, layer := range l.layers {
		if layer == id {
			l.MoveLayerAt(fromIndex, toIndex)
			return
		}
	}
}

func (l *IDList) MoveLayerAt(fromIndex int, toIndex int) {
	if l == nil || len(l.layers) == 0 {
		return
	}

	le := len(l.layers)
	if fromIndex < 0 || le <= fromIndex {
		return
	}
	if toIndex < 0 || le <= toIndex {
		toIndex = le - 1
	}
	if fromIndex == toIndex {
		return
	}

	f := l.layers[fromIndex]
	l.layers = append(l.layers[:fromIndex], l.layers[fromIndex+1:]...)
	newSlice := make([]id.NLSLayerID, toIndex+1)
	copy(newSlice, l.layers[:toIndex])
	newSlice[toIndex] = f
	l.layers = append(newSlice, l.layers[toIndex:]...)
}

func (l *IDList) RemoveLayer(ids ...id.NLSLayerID) int {
	if l == nil {
		return 0
	}
	removed := 0
	for i := 0; i < len(l.layers); i++ {
		layer := l.layers[i]
		for _, id := range ids {
			if layer == id {
				l.RemoveLayerAt(i)
				removed++
				i--
				break
			}
		}
	}
	return removed
}

func (l *IDList) RemoveLayerAt(index int) {
	if l == nil || len(l.layers) == 0 {
		return
	}

	le := len(l.layers)
	if index < 0 || le <= index {
		return
	}

	layer := l.layers[index]
	var layers []id.NLSLayerID
	if index == le {
		layers = []id.NLSLayerID{}
	} else {
		layers = l.layers[index+1:]
	}
	l.layers = append(l.layers[:index], layers...)
	delete(l.layerIDs, layer)
}

func (l *IDList) Empty() {
	if l == nil {
		return
	}

	l.layers = nil
	l.layerIDs = nil
}

func (l *IDList) Strings() []string {
	if l == nil {
		return nil
	}
	return l.layers.Strings()
}
