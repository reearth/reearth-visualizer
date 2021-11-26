package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/dataset"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewLinks(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	dsid2 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	did2 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()
	dfid2 := id.NewDatasetSchemaFieldID()

	var lin *Links
	assert.Nil(t, lin)
	assert.Nil(t, lin.Clone())
	assert.Nil(t, lin.Links())
	assert.Nil(t, lin.DatasetIDs())
	assert.Nil(t, lin.DatasetSchemaIDs())
	assert.False(t, lin.IsLinked())
	assert.Equal(t, 0, lin.Len())

	lin = NewLinks([]*Link{})
	assert.Equal(t, []id.DatasetID{}, lin.DatasetIDs())
	assert.Equal(t, []id.DatasetSchemaID{}, lin.DatasetSchemaIDs())
	assert.Equal(t, []id.DatasetSchemaFieldID{}, lin.DatasetSchemaFieldIDs())

	ll := []*Link{
		NewLink(did1, dsid1, dfid1),
		NewLink(did2, dsid2, dfid2),
	}
	dl := []id.DatasetID{did1, did2}
	dsl := []id.DatasetSchemaID{dsid1, dsid2}
	dsfl := []id.DatasetSchemaFieldID{dfid1, dfid2}
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

func TestLinks_IsDatasetLinked(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	dsid2 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	did2 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()
	ll := []*Link{
		NewLink(did1, dsid1, dfid1),
	}

	testCases := []struct {
		Name     string
		DSS      id.DatasetSchemaID
		DS       id.DatasetID
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Links.IsDatasetLinked(tc.DSS, tc.DS)
			res2 := tc.Links.HasDataset(tc.DS)
			res3 := tc.Links.HasDatasetSchema(tc.DSS)
			assert.Equal(tt, tc.Expected, res)
			assert.Equal(tt, tc.Expected, res2)
			assert.Equal(tt, tc.Expected, res3)
		})
	}
}

func TestLinks_Validate(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()

	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Links.Validate(tc.DSM, tc.DM)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestLinks_Replace(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	dsid2 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	did2 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()
	dfid2 := id.NewDatasetSchemaFieldID()

	testCases := []struct {
		Name            string
		DSM             map[id.DatasetSchemaID]id.DatasetSchemaID
		DM              map[id.DatasetID]id.DatasetID
		FM              map[id.DatasetSchemaFieldID]id.DatasetSchemaFieldID
		Expected, Links *Links
	}{
		{
			Name: "nil links",
		},
		{
			Name: "success",
			DSM: map[id.DatasetSchemaID]id.DatasetSchemaID{
				dsid1: dsid2,
			},
			DM: map[id.DatasetID]id.DatasetID{
				did1: did2,
			},
			FM: map[id.DatasetSchemaFieldID]id.DatasetSchemaFieldID{
				dfid1: dfid2,
			},
			Links:    NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
			Expected: NewLinks([]*Link{NewLink(did2, dsid2, dfid2)}),
		},
		{
			Name: "dataset = nil",
			DSM: map[id.DatasetSchemaID]id.DatasetSchemaID{
				dsid1: dsid2,
			},
			DM: map[id.DatasetID]id.DatasetID{},
			FM: map[id.DatasetSchemaFieldID]id.DatasetSchemaFieldID{
				dfid1: dfid2,
			},
			Links: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
		{
			Name: "datasetschema = nil",
			DSM:  map[id.DatasetSchemaID]id.DatasetSchemaID{},
			DM: map[id.DatasetID]id.DatasetID{
				did1: did2,
			},
			FM: map[id.DatasetSchemaFieldID]id.DatasetSchemaFieldID{
				dfid1: dfid2,
			},
			Links: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
		{
			Name: "dataset schema field = nil",
			DSM: map[id.DatasetSchemaID]id.DatasetSchemaID{
				dsid1: dsid2,
			},
			DM: map[id.DatasetID]id.DatasetID{
				did1: did2,
			},
			FM:    map[id.DatasetSchemaFieldID]id.DatasetSchemaFieldID{},
			Links: NewLinks([]*Link{NewLink(did1, dsid1, dfid1)}),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			tc.Links.Replace(tc.DSM, tc.DM, tc.FM)
			assert.Equal(tt, tc.Expected.Links(), tc.Links.Links())
		})
	}
}

func TestLinks_ApplyDataset(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()

	testCases := []struct {
		Name            string
		Input           *id.DatasetID
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Links.ApplyDataset(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestLink_Dataset(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()

	testCases := []struct {
		Name     string
		Link     *Link
		Expected *id.DatasetID
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			res := tc.Link.Dataset()
			assert.Equal(tt, tc.Expected, res)
		})
	}

}

func TestLink_DatasetSchema(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()

	testCases := []struct {
		Name     string
		Link     *Link
		Expected *id.DatasetSchemaID
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			res := tc.Link.DatasetSchema()
			assert.Equal(tt, tc.Expected, res)
		})
	}

}

func TestLink_DatasetSchemaField(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()

	testCases := []struct {
		Name     string
		Link     *Link
		Expected *id.DatasetSchemaFieldID
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			res := tc.Link.DatasetSchemaField()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestLink_Value(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()
	dsf := []*dataset.Field{
		dataset.NewField(dfid1, dataset.ValueTypeString.ValueFrom("aaa"), ""),
	}

	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			res := tc.Link.Value(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
func TestLink_Validate(t *testing.T) {
	dsid1 := id.NewDatasetSchemaID()
	did1 := id.NewDatasetID()
	dfid1 := id.NewDatasetSchemaFieldID()

	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Link.Validate(tc.DSS, tc.DS)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestLink_Clone(t *testing.T) {
	var l *Link
	assert.Nil(t, l.Clone())
	l = NewLink(id.NewDatasetID(), id.NewDatasetSchemaID(), id.NewDatasetSchemaFieldID())
	assert.Equal(t, l, l.Clone())
}
