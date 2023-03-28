package property

import "github.com/samber/lo"

type FieldIDMap map[ID][]FieldID

func FieldIDMapFrom(s SchemaMap, p List) FieldIDMap {
	return lo.SliceToMap(p, func(p *Property) (ID, []FieldID) {
		return p.ID(), s[p.Schema()].PrivateFields()
	})
}
