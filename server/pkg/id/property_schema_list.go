package id

import "github.com/reearth/reearth/server/pkg/list"

type PropertySchemaIDList []PropertySchemaID

// Clone duplicates the PropertySchemaIDList
func (l PropertySchemaIDList) Clone() PropertySchemaIDList {
	return list.ListClone[PropertySchemaID](l, PropertySchemaID.Clone)
}

// Merge merges PropertySchemaIDList
func (l PropertySchemaIDList) Merge(l2 PropertySchemaIDList) PropertySchemaIDList {
	return list.ListMerge[PropertySchemaID](l, l2, PropertySchemaID.Clone, false)
}

// MergeUnique merges PropertySchemaIDList
func (l PropertySchemaIDList) MergeUnique(l2 PropertySchemaIDList) PropertySchemaIDList {
	return list.ListMerge[PropertySchemaID](l, l2, PropertySchemaID.Clone, true)
}

// Contains checks if PropertySchemaIDList contains PropertySchemaID
func (l PropertySchemaIDList) Contains(id PropertySchemaID) bool {
	return list.Contains[PropertySchemaID](l, id)
}
