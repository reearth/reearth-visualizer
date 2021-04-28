package layer

import "github.com/reearth/reearth-backend/pkg/id"

// IDList _
type IDList struct {
	layers []id.LayerID
	// for checking duplication
	layerIDs map[id.LayerID]struct{}
}

// NewIDList _
func NewIDList(layers []id.LayerID) *IDList {
	ll := IDList{}
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

// Layers _
func (l *IDList) Layers() []id.LayerID {
	if l == nil {
		return nil
	}
	result := append([]id.LayerID{}, l.layers...)
	return result
}

// HasLayer _
func (l *IDList) HasLayer(id id.LayerID) bool {
	if l == nil || len(l.layerIDs) == 0 {
		return false
	}
	_, ok := l.layerIDs[id]
	return ok
}

// LayerAt _
func (l *IDList) LayerAt(index int) id.LayerID {
	if l == nil || index < 0 || len(l.layers) <= index {
		return id.LayerID{}
	}
	return l.layers[index]
}

func (l *IDList) AtRef(index int) *id.LayerID {
	if l == nil || index < 0 || len(l.layers) <= index {
		return nil
	}
	return &l.layers[index]
}

// FindLayerIndex _
func (l *IDList) FindLayerIndex(id id.LayerID) int {
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

// LayerCount _
func (l *IDList) LayerCount() int {
	if l == nil {
		return 0
	}
	return len(l.layers)
}

// AddLayer _
func (l *IDList) AddLayer(lid id.LayerID, index int) {
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

// AppendLayers _
func (l *IDList) AppendLayers(lid ...id.LayerID) *IDList {
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

// AddOrMoveLayer _
func (l *IDList) AddOrMoveLayer(lid id.LayerID, index int) {
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

// MoveLayer _
func (l *IDList) MoveLayer(id id.LayerID, toIndex int) {
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

// MoveLayerAt _
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
	newSlice := make([]id.LayerID, toIndex+1)
	copy(newSlice, l.layers[:toIndex])
	newSlice[toIndex] = f
	l.layers = append(newSlice, l.layers[toIndex:]...)
}

// RemoveLayer _
func (l *IDList) RemoveLayer(id id.LayerID) {
	if l == nil {
		return
	}

	for index, layer := range l.layers {
		if layer == id {
			l.RemoveLayerAt(index)
			return
		}
	}
}

// RemoveLayerAt _
func (l *IDList) RemoveLayerAt(index int) {
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

// Empty _
func (l *IDList) Empty() {
	if l == nil {
		return
	}

	l.layers = nil
	l.layerIDs = nil
}
