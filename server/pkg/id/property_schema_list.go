package id

import "github.com/reearth/reearthx/util"

type PropertySchemaIDList []PropertySchemaID

// Clone duplicates the PropertySchemaIDList
func (l PropertySchemaIDList) Clone() PropertySchemaIDList {
	return util.ListClone[PropertySchemaID](l, PropertySchemaID.Clone)
}

// Merge merges PropertySchemaIDList
func (l PropertySchemaIDList) Merge(l2 PropertySchemaIDList) PropertySchemaIDList {
	return util.ListMerge[PropertySchemaID](l, l2, PropertySchemaID.Clone, false)
}

// MergeUnique merges PropertySchemaIDList
func (l PropertySchemaIDList) MergeUnique(l2 PropertySchemaIDList) PropertySchemaIDList {
	return util.ListMerge[PropertySchemaID](l, l2, PropertySchemaID.Clone, true)
}

// Contains checks if PropertySchemaIDList contains PropertySchemaID
func (l PropertySchemaIDList) Contains(id PropertySchemaID) bool {
	return util.Contains[PropertySchemaID](l, id)
}
