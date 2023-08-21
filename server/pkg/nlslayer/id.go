package nlslayer

import (
	"sort"

	"github.com/reearth/reearth/server/pkg/id"
)

type ID = id.NLSLayerID
type SceneID = id.SceneID
type LayerID = id.LayerID

var NewID = id.NewNLSLayerID

var ErrInvalidID = id.ErrInvalidID

func sortIDs(a []ID) {
	sort.SliceStable(a, func(i, j int) bool {
		return a[i].Compare(a[j]) < 0
	})
}
