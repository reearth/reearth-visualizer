package dataset

import "github.com/reearth/reearthx/util"

type SchemaList []*Schema

func (dsl SchemaList) Map() SchemaMap {
	return util.MapWithIDFunc[SchemaID, Schema](dsl, (*Schema).ID, true)
}

type SchemaMap map[SchemaID]*Schema

func (dsm SchemaMap) Slice() SchemaList {
	return util.MapList[SchemaID, Schema](dsm, true)
}

func (dsm SchemaMap) GraphSearchByFields(root SchemaID, fields ...FieldID) (SchemaList, *SchemaField) {
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
