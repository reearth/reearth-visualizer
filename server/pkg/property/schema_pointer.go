package property

type SchemaFieldPointer struct {
	SchemaGroup SchemaGroupID
	Field       FieldID
}

func (p SchemaFieldPointer) Pointer() *Pointer {
	return PointFieldBySchemaGroup(p.SchemaGroup, p.Field)
}

func (p *SchemaFieldPointer) Clone() *SchemaFieldPointer {
	if p == nil {
		return p
	}
	p2 := *p
	return &p2
}
