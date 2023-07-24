package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"golang.org/x/exp/slices"
)

type DatasetSchemaDocument struct {
	ID                  string
	Source              string
	Name                string
	Fields              []*DatasetSchemaFieldDocument
	RepresentativeField *string
	Scene               string
}

type DatasetSchemaFieldDocument struct {
	ID     string
	Name   string
	Type   string
	Source string
}

type DatasetSchemaConsumer = Consumer[*DatasetSchemaDocument, *dataset.Schema]

func NewDatasetSchemaConsumer(scenes []id.SceneID) *DatasetSchemaConsumer {
	return NewConsumer[*DatasetSchemaDocument, *dataset.Schema](func(a *dataset.Schema) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func (d *DatasetSchemaDocument) Model() (*dataset.Schema, error) {
	did, err := id.DatasetSchemaIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	scene, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}

	fields := make([]*dataset.SchemaField, 0, len(d.Fields))
	for _, field := range d.Fields {
		fid, err := id.DatasetFieldIDFrom(field.ID)
		if err != nil {
			return nil, err
		}
		vt := dataset.ValueType(field.Type)
		f, err := dataset.NewSchemaField().
			Name(field.Name).
			ID(fid).
			Type(vt).
			Source(field.Source).
			Build()
		if err != nil {
			return nil, err
		}
		fields = append(fields, f)
	}
	b := dataset.NewSchema().
		ID(did).
		Name(d.Name).
		Source(d.Source).
		Scene(scene).
		Fields(fields)
	if d.RepresentativeField != nil {
		dsfid, err := id.DatasetFieldIDFrom(*d.RepresentativeField)
		if err != nil {
			return nil, err
		}
		b.RepresentativeField(dsfid)
	}
	return b.Build()
}

func NewDatasetSchema(dataset *dataset.Schema) (*DatasetSchemaDocument, string) {
	did := dataset.ID().String()
	doc := DatasetSchemaDocument{
		ID:                  did,
		Name:                dataset.Name(),
		Source:              dataset.Source(),
		Scene:               dataset.Scene().String(),
		RepresentativeField: dataset.RepresentativeFieldID().StringRef(),
	}

	fields := dataset.Fields()
	doc.Fields = make([]*DatasetSchemaFieldDocument, 0, len(fields))
	for _, f := range fields {
		doc.Fields = append(doc.Fields, &DatasetSchemaFieldDocument{
			ID:     f.ID().String(),
			Type:   string(f.Type()),
			Name:   f.Name(),
			Source: f.Source(),
		})
	}

	return &doc, did
}

func NewDatasetSchemas(datasetSchemas []*dataset.Schema, f scene.IDList) ([]interface{}, []string) {
	res := make([]interface{}, 0, len(datasetSchemas))
	ids := make([]string, 0, len(datasetSchemas))
	for _, d := range datasetSchemas {
		if d == nil || f != nil && !f.Has(d.Scene()) {
			continue
		}
		r, id := NewDatasetSchema(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}
