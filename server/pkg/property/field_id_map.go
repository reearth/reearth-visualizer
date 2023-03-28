package property

import "github.com/samber/lo"

type FieldIDMap map[ID][]FieldID

func FieldIDMapFrom(s SchemaMap, p List) FieldIDMap {
	return lo.SliceToMap(p, func(p *Property) (ID, []FieldID) {
		return p.ID(), s[p.Schema()].PrivateFields()
	})
}

func (f FieldIDMap) Get(ids ...ID) []FieldID {
	if f == nil {
		return nil
	}
	for _, id := range ids {
		if r, ok := f[id]; ok {
			return r
		}
	}
	return nil
}

func (f FieldIDMap) GetRef(ids ...*ID) []FieldID {
	if f == nil {
		return nil
	}
	for _, id := range ids {
		if id == nil {
			continue
		}
		if r, ok := f[*id]; ok {
			return r
		}
	}
	return nil
}
