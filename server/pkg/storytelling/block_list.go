package storytelling

import (
	"github.com/samber/lo"
)

type BlockList []*Block

func (l BlockList) Clone() BlockList {
	if l == nil {
		return nil
	}

	return lo.Map(l, func(b *Block, i int) *Block {
		return b.Clone()
	})
}
