package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	sf = NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg = NewSchemaGroup().ID("aa").Schema(MustSchemaID("xx~1.0.0/aa")).Fields([]*SchemaField{sf}).MustBuild()
	p  = New().NewID().Scene(NewSceneID()).Schema(MustSchemaID("xx~1.0.0/aa")).Items([]Item{InitItemFrom(sg)}).MustBuild()
	p2 = New().NewID().Scene(NewSceneID()).Schema(MustSchemaID("xx~1.0.0/aa")).Items([]Item{InitItemFrom(sg)}).MustBuild()
)

func TestMap_Add(t *testing.T) {
	tests := []struct {
		Name        string
		Input       *Property
		M, Expected Map
	}{
		{
			Name: "nil map",
		},
		{
			Name:     "add property list",
			Input:    p,
			M:        Map{},
			Expected: Map{p.ID(): p},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			tc.M.Add(tc.Input)
			assert.Equal(t, tc.Expected, tc.M)
			assert.Equal(t, tc.Expected.List(), tc.M.List())
		})
	}
}

func TestMapFrom(t *testing.T) {
	m := MapFrom(p)
	e := Map{p.ID(): p}
	assert.Equal(t, e, m)
}

func TestMap_Clone(t *testing.T) {
	tests := []struct {
		Name        string
		M, Expected Map
	}{
		{
			Name:     "nil map",
			Expected: Map{},
		},
		{
			Name:     "add property list",
			M:        Map{p.ID(): p},
			Expected: Map{p.ID(): p},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.M.Clone()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestMap_Merge(t *testing.T) {
	tests := []struct {
		Name             string
		M1, M2, Expected Map
	}{
		{
			Name:     "nil map",
			Expected: Map{},
		},
		{
			Name:     "add property list",
			M1:       Map{p.ID(): p},
			M2:       Map{p2.ID(): p2},
			Expected: Map{p.ID(): p, p2.ID(): p2},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.M1.Merge(tc.M2)
			assert.Equal(t, tc.Expected, res)
		})
	}
}
