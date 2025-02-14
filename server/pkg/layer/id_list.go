package layer

import "github.com/reearth/reearth/server/pkg/id"

type LayerIDList struct {
	layers id.LayerIDList
	// for checking duplication
	layerIDs map[id.LayerID]struct{}
}

func NewIDList(layers []id.LayerID) *LayerIDList {
	ll := LayerIDList{}
	if len(layers) == 0 {
		return &ll
	}

	ll.layers = append([]id.LayerID{}, layers...)
	ll.layerIDs = make(map[id.LayerID]struct{}, len(layers))
	for _, l := range layers {
		ll.layerIDs[l] = struct{}{}
	}
	return &ll
}

func (l *LayerIDList) Layers() []id.LayerID {
	if l == nil {
		return nil
	}
	result := append([]id.LayerID{}, l.layers...)
	return result
}

func (l *LayerIDList) HasLayer(id id.LayerID) bool {
	if l == nil || len(l.layerIDs) == 0 {
		return false
	}
	_, ok := l.layerIDs[id]
	return ok
}

func (l *LayerIDList) LayerAt(index int) id.LayerID {
	if l == nil || index < 0 || len(l.layers) <= index {
		return id.LayerID{}
	}
	return l.layers[index]
}

func (l *LayerIDList) AtRef(index int) *id.LayerID {
	if l == nil || index < 0 || len(l.layers) <= index {
		return nil
	}
	return &l.layers[index]
}

func (l *LayerIDList) FindLayerIndex(id id.LayerID) int {
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

func (l *LayerIDList) LayerCount() int {
	if l == nil {
		return 0
	}
	return len(l.layers)
}

func (l *LayerIDList) AddLayer(lid id.LayerID, index int) {
	if l == nil || l.HasLayer(lid) {
		return
	}
	if l.layerIDs == nil {
		l.layerIDs = make(map[id.LayerID]struct{})
	}

	l.layerIDs[lid] = struct{}{}

	le := len(l.layers)
	if index < 0 || le <= index {
		l.layers = append(l.layers, lid)
	} else {
		l.layers = append(l.layers[:index], append([]id.LayerID{lid}, l.layers[index:]...)...)
	}
}

func (l *LayerIDList) AppendLayers(lid ...id.LayerID) *LayerIDList {
	if l == nil {
		return NewIDList(lid)
	}
	for _, i := range lid {
		l.AddLayer(i, -1)
	}
	return l
}

func (l *LayerIDList) Merge(l2 *LayerIDList) {
	l.AppendLayers(l2.layers...)
}

func (l *LayerIDList) Clone() (l2 *LayerIDList) {
	if l == nil {
		return l2
	}
	return NewIDList(l.layers)
}

func (l *LayerIDList) AddOrMoveLayer(lid id.LayerID, index int) {
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
	l.layers = append(l.layers[:index], append([]id.LayerID{lid}, l.layers[index:]...)...)
	l.layerIDs[lid] = struct{}{}
}

func (l *LayerIDList) MoveLayer(id id.LayerID, toIndex int) {
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

func (l *LayerIDList) MoveLayerAt(fromIndex int, toIndex int) {
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
	newSlice := make([]id.LayerID, toIndex+1)
	copy(newSlice, l.layers[:toIndex])
	newSlice[toIndex] = f
	l.layers = append(newSlice, l.layers[toIndex:]...)
}

func (l *LayerIDList) RemoveLayer(ids ...id.LayerID) int {
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

func (l *LayerIDList) RemoveLayerAt(index int) {
	if l == nil || len(l.layers) == 0 {
		return
	}

	le := len(l.layers)
	if index < 0 || le <= index {
		return
	}

	layer := l.layers[index]
	var layers []id.LayerID
	if index == le {
		layers = []id.LayerID{}
	} else {
		layers = l.layers[index+1:]
	}
	l.layers = append(l.layers[:index], layers...)
	delete(l.layerIDs, layer)
}

func (l *LayerIDList) Empty() {
	if l == nil {
		return
	}

	l.layers = nil
	l.layerIDs = nil
}

func (l *LayerIDList) Strings() []string {
	if l == nil {
		return nil
	}
	return l.layers.Strings()
}
