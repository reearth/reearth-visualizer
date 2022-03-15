package mongodoc

import (
	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type DatasetDocument struct {
	ID     string
	Source string
	Schema string
	Fields []*DatasetFieldDocument
	Scene  string
}

type DatasetFieldDocument struct {
	Field  string
	Type   string
	Value  interface{}
	Source string
}

type DatasetExtendedDocument struct {
	DatasetDocument
	Graph []*DatasetExtendedDocument
	Depth int
}

type DatasetConsumer struct {
	Rows []*dataset.Dataset
}

func (c *DatasetConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc DatasetDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	dataset, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, dataset)
	return nil
}

type DatasetMapConsumer struct {
	Map dataset.Map
}

func (c *DatasetMapConsumer) Consume(raw bson.Raw) error {
	var doc DatasetDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	m, err := doc.Model()
	if err != nil {
		return err
	}
	if c.Map == nil {
		c.Map = map[id.DatasetID]*dataset.Dataset{
			m.ID(): m,
		}
	} else {
		c.Map[m.ID()] = m
	}
	return nil
}

type DatasetBatchConsumer struct {
	Size     int
	Callback func([]*dataset.Dataset) error
	consumer *BatchConsumer
}

func (c *DatasetBatchConsumer) Consume(raw bson.Raw) error {
	if c.consumer == nil {
		c.consumer = &BatchConsumer{
			Size: c.Size,
			Callback: func(rows []bson.Raw) error {
				datasets := make([]*dataset.Dataset, 0, len(rows))

				for _, r := range rows {
					var doc DatasetDocument
					if err := bson.Unmarshal(r, &doc); err != nil {
						return err
					}
					dataset, err := doc.Model()
					if err != nil {
						return err
					}

					datasets = append(datasets, dataset)
				}

				return c.Callback(datasets)
			},
		}
	}

	return c.consumer.Consume(raw)
}

func (doc *DatasetDocument) Model() (*dataset.Dataset, error) {
	did, err := id.DatasetIDFrom(doc.ID)
	if err != nil {
		return nil, err
	}
	scene, err := id.SceneIDFrom(doc.Scene)
	if err != nil {
		return nil, err
	}
	ds, err := id.DatasetSchemaIDFrom(doc.Schema)
	if err != nil {
		return nil, err
	}
	fields := make([]*dataset.Field, 0, len(doc.Fields))
	for _, field := range doc.Fields {
		fid, err := id.DatasetSchemaFieldIDFrom(field.Field)
		if err != nil {
			return nil, err
		}
		f := dataset.NewField(
			fid,
			toModelDatasetValue(field.Value, field.Type),
			field.Source,
		)
		fields = append(fields, f)
	}
	return dataset.New().
		ID(did).
		Source(doc.Source).
		Fields(fields).
		Schema(ds).
		Scene(scene).
		Build()
}

func NewDataset(dataset *dataset.Dataset) (*DatasetDocument, string) {
	did := dataset.ID().String()
	var doc DatasetDocument
	doc.ID = did
	doc.Source = dataset.Source()
	doc.Scene = id.ID(dataset.Scene()).String()
	doc.Schema = id.ID(dataset.Schema()).String()

	fields := dataset.Fields()
	doc.Fields = make([]*DatasetFieldDocument, 0, len(fields))
	for _, f := range fields {
		doc.Fields = append(doc.Fields, &DatasetFieldDocument{
			Field:  f.Field().String(),
			Type:   string(f.Type()),
			Value:  f.Value().Interface(),
			Source: f.Source(),
		})
	}
	return &doc, did
}

func NewDatasets(datasets []*dataset.Dataset, f scene.IDList) ([]interface{}, []string) {
	res := make([]interface{}, 0, len(datasets))
	ids := make([]string, 0, len(datasets))
	for _, d := range datasets {
		if d == nil || f != nil && !f.Includes(d.Scene()) {
			continue
		}
		r, id := NewDataset(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func toModelDatasetValue(v interface{}, t string) *dataset.Value {
	if v == nil {
		return nil
	}
	if v2, ok := v.(bson.D); ok {
		v = v2.Map()
	}
	return dataset.ValueType(t).ValueFrom(v)
}
