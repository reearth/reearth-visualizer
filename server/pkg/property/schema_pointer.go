package property

import "github.com/reearth/reearth/server/pkg/id"

type SchemaFieldPointer struct {
	SchemaGroup id.PropertySchemaGroupID
	Field       id.PropertyFieldID
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
