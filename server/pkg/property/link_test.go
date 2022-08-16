package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/dataset"

	"github.com/stretchr/testify/assert"
)

func TestNewLinks(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	dsid2 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	did2 := NewDatasetID()
	dfid1 := NewDatasetFieldID()
	dfid2 := NewDatasetFieldID()

	var lin *Links
	assert.Nil(t, lin)
	assert.Nil(t, lin.Clone())
	assert.Nil(t, lin.Links())
	assert.Nil(t, lin.DatasetIDs())
	assert.Nil(t, lin.DatasetSchemaIDs())
	assert.False(t, lin.IsLinked())
	assert.Equal(t, 0, lin.Len())

	lin = NewLinks([]*Link{})
	assert.Equal(t, []DatasetID{}, lin.DatasetIDs())
	assert.Equal(t, []DatasetSchemaID{}, lin.DatasetSchemaIDs())
	assert.Equal(t, []DatasetFieldID{}, lin.DatasetSchemaFieldIDs())

	ll := []*Link{
		NewLink(did1, dsid1, dfid1),
		NewLink(did2, dsid2, dfid2),
	}
	dl := []DatasetID{did1, did2}
	dsl := []DatasetSchemaID{dsid1, dsid2}
	dsfl := []DatasetFieldID{dfid1, dfid2}
	lin = NewLinks(ll)
	assert.NotNil(t, lin)
	assert.Equal(t, ll, lin.Links())
	assert.Equal(t, ll, lin.Clone().Links())
	assert.Equal(t, dl, lin.DatasetIDs())
	assert.Equal(t, dsl, lin.DatasetSchemaIDs())
	assert.Equal(t, dsfl, lin.DatasetSchemaFieldIDs())
	assert.True(t, lin.IsLinked())
	assert.Equal(t, 2, lin.Len())
}

func TestLinks_HasSchemaAndDataset(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	dsid2 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	did2 := NewDatasetID()
	dfid1 := NewDatasetFieldID()
	ll := []*Link{
		NewLink(did1, dsid1, dfid1),
	}

	tests := []struct {
		Name     string
		DSS      DatasetSchemaID
		DS       DatasetID
		Links    *Links
		Expected bool
	}{
		{
			Name:     "nil links",
			Expected: false,
		},
		{
			Name:     "true",
			DSS:      dsid1,
			DS:       did1,
			Links:    NewLinks(ll),
			Expected: true,
		},
		{
			Name:     "false",
			DSS:      dsid2,
			DS:       did2,
			Links:    NewLinks(ll),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Links.HasSchemaAndDataset(tc.DSS, tc.DS)
			res2 := tc.Links.HasDataset(tc.DS)
			res3 := tc.Links.HasDatasetSchema(tc.DSS)
			assert.Equal(t, tc.Expected, res)
			assert.Equal(t, tc.Expected, res2)
			assert.Equal(t, tc.Expected, res3)
		})
	}
}

func TestLinks_Validate(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	dfid1 := NewDatasetFieldID()

	tests := []struct {
		Name     string
		DSM      dataset.SchemaMap
		DM       dataset.Map
		Links    *Links
		Expected bool
	}{
		{
			Name:     "nil links",
			Expected: false,
		},
		{
			Name:     "nil dataset schema for first link",
			Links:    NewLinks([]*Link{}),
			Expected: false,
		},
		{
			Name:     "len(res) != len(l.links)",
			Links:    NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
			Expected: false,
		},
		{
			Name: "success",
			DSM: dataset.SchemaMap{
				dsid1: dataset.NewSchema().ID(dsid1).Fields([]*dataset.SchemaField{
					dataset.NewSchemaField().
						ID(dfid1).
						Ref(dsid1.Ref()).Type(dataset.ValueTypeString).
						MustBuild(),
				}).MustBuild(),
			},
			DM: dataset.Map{
				did1: dataset.New().ID(did1).Schema(dsid1).Fields([]*dataset.Field{
					dataset.NewField(dfid1, dataset.ValueTypeString.ValueFrom("vvv"), ""),
				}).MustBuild(),
			},
			Links:    NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Links.Validate(tc.DSM, tc.DM)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestLinks_Replace(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	dsid2 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	did2 := NewDatasetID()
	dfid1 := NewDatasetFieldID()
	dfid2 := NewDatasetFieldID()

	tests := []struct {
		Name            string
		DSM             map[DatasetSchemaID]DatasetSchemaID
		DM              map[DatasetID]DatasetID
		FM              map[DatasetFieldID]DatasetFieldID
		Expected, Links *Links
	}{
		{
			Name: "nil links",
		},
		{
			Name: "success",
			DSM: map[DatasetSchemaID]DatasetSchemaID{
				dsid1: dsid2,
			},
			DM: map[DatasetID]DatasetID{
				did1: did2,
			},
			FM: map[DatasetFieldID]DatasetFieldID{
				dfid1: dfid2,
			},
			Links:    NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
			Expected: NewLinks([]*Link{NewLink(did2, dsid2, dfid2)}),
		},
		{
			Name: "dataset = nil",
			DSM: map[DatasetSchemaID]DatasetSchemaID{
				dsid1: dsid2,
			},
			DM: map[DatasetID]DatasetID{},
			FM: map[DatasetFieldID]DatasetFieldID{
				dfid1: dfid2,
			},
			Links: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
		{
			Name: "datasetschema = nil",
			DSM:  map[DatasetSchemaID]DatasetSchemaID{},
			DM: map[DatasetID]DatasetID{
				did1: did2,
			},
			FM: map[DatasetFieldID]DatasetFieldID{
				dfid1: dfid2,
			},
			Links: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
		{
			Name: "dataset schema field = nil",
			DSM: map[DatasetSchemaID]DatasetSchemaID{
				dsid1: dsid2,
			},
			DM: map[DatasetID]DatasetID{
				did1: did2,
			},
			FM:    map[DatasetFieldID]DatasetFieldID{},
			Links: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			tc.Links.Replace(tc.DSM, tc.DM, tc.FM)
			assert.Equal(t, tc.Expected.Links(), tc.Links.Links())
		})
	}
}

func TestLinks_ApplyDataset(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	dfid1 := NewDatasetFieldID()

	tests := []struct {
		Name            string
		Input           *DatasetID
		Expected, Links *Links
	}{
		{
			Name: "nil links",
		},
		{
			Name:     "nil input dataset",
			Links:    NewLinks([]*Link{NewLinkFieldOnly(dsid1, dfid1)}),
			Expected: NewLinks([]*Link{NewLinkFieldOnly(dsid1, dfid1)}),
		},
		{
			Name:     "not nil dataset",
			Links:    NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
			Expected: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
		{
			Name:     "apply new dataset",
			Input:    did1.Ref(),
			Links:    NewLinks([]*Link{NewLinkFieldOnly(dsid1, dfid1)}),
			Expected: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Links.ApplyDataset(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestLink_Dataset(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	dfid1 := NewDatasetFieldID()

	tests := []struct {
		Name     string
		Link     *Link
		Expected *DatasetID
	}{
		{
			Name: "nil link",
		},
		{
			Name: "nil dataset",
			Link: NewLinkFieldOnly(dsid1, dfid1),
		},
		{
			Name:     "success",
			Link:     NewLink(did1, dsid1, dfid1),
			Expected: did1.Ref(),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			res := tc.Link.Dataset()
			assert.Equal(t, tc.Expected, res)
		})
	}

}

func TestLink_DatasetSchema(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	dfid1 := NewDatasetFieldID()

	tests := []struct {
		Name     string
		Link     *Link
		Expected *DatasetSchemaID
	}{
		{
			Name: "nil link",
		},
		{
			Name:     "success",
			Link:     NewLink(did1, dsid1, dfid1),
			Expected: dsid1.Ref(),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			res := tc.Link.DatasetSchema()
			assert.Equal(t, tc.Expected, res)
		})
	}

}

func TestLink_DatasetSchemaField(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	dfid1 := NewDatasetFieldID()

	tests := []struct {
		Name     string
		Link     *Link
		Expected *DatasetFieldID
	}{
		{
			Name: "nil link",
		},
		{
			Name:     "success",
			Link:     NewLink(did1, dsid1, dfid1),
			Expected: dfid1.Ref(),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			res := tc.Link.DatasetSchemaField()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestLink_Value(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	dfid1 := NewDatasetFieldID()
	dsf := []*dataset.Field{
		dataset.NewField(dfid1, dataset.ValueTypeString.ValueFrom("aaa"), ""),
	}

	tests := []struct {
		Name     string
		Link     *Link
		Input    *dataset.Dataset
		Expected *dataset.Value
	}{
		{
			Name: "nil link",
		},
		{
			Name:  "success",
			Link:  NewLink(did1, dsid1, dfid1),
			Input: dataset.New().ID(did1).Schema(dsid1).Fields([]*dataset.Field{}).MustBuild(),
		},
		{
			Name:     "success",
			Link:     NewLink(did1, dsid1, dfid1),
			Input:    dataset.New().ID(did1).Schema(dsid1).Fields(dsf).MustBuild(),
			Expected: dataset.ValueTypeString.ValueFrom("aaa"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			res := tc.Link.Value(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestLink_Validate(t *testing.T) {
	dsid1 := NewDatasetSchemaID()
	did1 := NewDatasetID()
	dfid1 := NewDatasetFieldID()

	tests := []struct {
		Name     string
		DS       *dataset.Dataset
		DSS      *dataset.Schema
		Link     *Link
		Expected bool
	}{
		{
			Name:     "nil links",
			Expected: false,
		},
		{
			Name: "input schema id != link schema",
			DS: dataset.New().ID(did1).Schema(dsid1).Fields([]*dataset.Field{
				dataset.NewField(dfid1, dataset.ValueTypeString.ValueFrom("vvv"), "")}).MustBuild(),
			DSS: dataset.NewSchema().NewID().Fields([]*dataset.SchemaField{
				dataset.NewSchemaField().
					ID(dfid1).
					Ref(dsid1.Ref()).Type(dataset.ValueTypeString).
					MustBuild(),
			}).MustBuild(),
			Link:     NewLink(did1, dsid1, dfid1),
			Expected: false,
		},
		{
			Name: "nil input dataset",
			DSS: dataset.NewSchema().ID(dsid1).Fields([]*dataset.SchemaField{
				dataset.NewSchemaField().
					ID(dfid1).
					Ref(dsid1.Ref()).Type(dataset.ValueTypeString).
					MustBuild(),
			}).MustBuild(),
			Link:     NewLink(did1, dsid1, dfid1),
			Expected: false,
		},
		{
			Name: "nil dataset field",
			DS:   dataset.New().ID(did1).Schema(dsid1).Fields([]*dataset.Field{}).MustBuild(),
			DSS: dataset.NewSchema().ID(dsid1).Fields([]*dataset.SchemaField{
				dataset.NewSchemaField().
					ID(dfid1).
					Ref(dsid1.Ref()).Type(dataset.ValueTypeString).
					MustBuild(),
			}).MustBuild(),
			Link:     NewLink(did1, dsid1, dfid1),
			Expected: false,
		},
		{
			Name: "valid",
			DS: dataset.New().ID(did1).Schema(dsid1).Fields([]*dataset.Field{
				dataset.NewField(dfid1, dataset.ValueTypeString.ValueFrom("vvv"), "")}).MustBuild(),
			DSS: dataset.NewSchema().ID(dsid1).Fields([]*dataset.SchemaField{
				dataset.NewSchemaField().
					ID(dfid1).
					Ref(dsid1.Ref()).Type(dataset.ValueTypeString).
					MustBuild(),
			}).MustBuild(),
			Link:     NewLink(did1, dsid1, dfid1),
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Link.Validate(tc.DSS, tc.DS)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestLink_Clone(t *testing.T) {
	var l *Link
	assert.Nil(t, l.Clone())
	l = NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())
	assert.Equal(t, l, l.Clone())
}
