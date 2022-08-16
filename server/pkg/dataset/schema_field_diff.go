package dataset

type SchemaFieldDiff struct {
	Added    []*SchemaField
	Removed  []*SchemaField
	Replaced map[FieldID]*SchemaField
}

func (d *Schema) FieldDiffBySource(d2 *Schema) SchemaFieldDiff {
	added := []*SchemaField{}
	removed := []*SchemaField{}
	// others := map[string]DatasetDiffTouple{}
	others2 := map[FieldID]*SchemaField{}

	s1 := map[string]*SchemaField{}
	for _, d1 := range d.fields {
		s1[d1.Source()] = d1
	}

	for _, d2 := range d2.fields {
		if d1, ok := s1[d2.Source()]; ok {
			others2[d1.ID()] = d2
		} else {
			// added
			added = append(added, d2)
		}
	}

	for _, d1 := range d.fields {
		if _, ok := others2[d1.ID()]; !ok {
			// removed
			removed = append(removed, d1)
		}
	}

	return SchemaFieldDiff{
		Added:    added,
		Removed:  removed,
		Replaced: others2,
	}
}
