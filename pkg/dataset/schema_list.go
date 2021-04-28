package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// SchemaList _
type SchemaList []*Schema

// Map _
func (dsl SchemaList) Map() SchemaMap {
	if dsl == nil {
		return nil
	}
	m := SchemaMap{}
	for _, d := range dsl {
		if d != nil {
			m[d.ID()] = d
		}
	}
	return m
}

// SchemaMap _
type SchemaMap map[id.DatasetSchemaID]*Schema

// Slice _
func (dsm SchemaMap) Slice() SchemaList {
	if dsm == nil {
		return nil
	}
	res := make(SchemaList, 0, len(dsm))
	for _, ds := range dsm {
		if ds != nil {
			res = append(res, ds)
		}
	}
	return res
}

// GraphSearchByFields _
func (dsm SchemaMap) GraphSearchByFields(root id.DatasetSchemaID, fields ...id.DatasetSchemaFieldID) (SchemaList, *SchemaField) {
	res := make(SchemaList, 0, len(fields))
	currentDs := dsm[root]
	if currentDs == nil {
		return res, nil
	}
	for i, f := range fields {
		if currentDs == nil {
			return res, nil
		}
		res = append(res, currentDs)
		field := currentDs.Field(f)
		if field == nil {
			return res, nil
		}
		if len(fields)-1 == i {
			return res, field
		} else if r := field.Ref(); r != nil {
			currentDs = dsm[*r]
		} else {
			return res, nil
		}
	}
	return res, nil
}
