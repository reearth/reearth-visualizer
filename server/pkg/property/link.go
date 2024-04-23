package property

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
)

type Links struct {
	LinksField []*Link `msgpack:"LinksField"`
}

type Link struct {
	DatasetField *DatasetID       `msgpack:"DatasetField"`
	SchemaField  *DatasetSchemaID `msgpack:"SchemaField"`
	FieldField   *DatasetFieldID  `msgpack:"FieldField"`
}

func NewLinks(links []*Link) *Links {
	if links == nil {
		return nil
	}
	links2 := make([]*Link, 0, len(links))
	for _, l := range links {
		links2 = append(links2, l.Clone())
	}
	return &Links{
		LinksField: links2,
	}
}

func (l *Links) Clone() *Links {
	if l == nil {
		return nil
	}
	return &Links{
		LinksField: append([]*Link{}, l.LinksField...),
	}
}

func (l *Links) IsLinked() bool {
	return l != nil && l.LinksField != nil && len(l.LinksField) > 0
}

func (l *Links) IsLinkedFully() bool {
	return l != nil && l.LinksField != nil && len(l.LinksField) > 0 && len(l.DatasetIDs()) == len(l.LinksField)
}

func (l *Links) Len() int {
	if l == nil || l.LinksField == nil {
		return 0
	}
	return len(l.LinksField)
}

func (l *Links) First() *Link {
	if l == nil || l.LinksField == nil || len(l.LinksField) == 0 {
		return nil
	}
	return l.LinksField[0]
}

func (l *Links) Last() *Link {
	if l == nil || l.LinksField == nil || len(l.LinksField) == 0 {
		return nil
	}
	return l.LinksField[len(l.LinksField)-1]
}

func (l *Links) LastValue(ds *dataset.Dataset) *dataset.Value {
	return l.Last().Value(ds)
}

func (l *Links) Validate(dsm dataset.SchemaMap, dm dataset.Map) bool {
	if l == nil || l.LinksField == nil {
		return false
	}
	firstDatasetSchema := l.First().DatasetSchema()
	if firstDatasetSchema == nil {
		return false
	}
	fields := l.DatasetSchemaFieldIDs()
	if fields == nil || len(fields) != len(l.LinksField) {
		return false
	}
	firstDataset := l.First().Dataset()

	res, resf := dsm.GraphSearchByFields(*firstDatasetSchema, fields...)
	if len(res) != len(l.LinksField) || resf == nil {
		return false
	}

	if firstDataset != nil {
		res2, resf2 := dm.GraphSearchByFields(*firstDataset, fields...)
		return len(res2) == len(l.LinksField) && resf2 != nil
	}

	return true
}

func (l *Links) Replace(
	dsm map[DatasetSchemaID]DatasetSchemaID,
	dm map[DatasetID]DatasetID,
	fm map[DatasetFieldID]DatasetFieldID,
) {
	if l == nil || l.LinksField == nil {
		return
	}

	links := make([]*Link, 0, len(l.LinksField))

	for _, link := range l.LinksField {
		nl := &Link{}

		if link.SchemaField != nil {
			if nds, ok := dsm[*link.SchemaField]; ok {
				nid := nds
				nl.SchemaField = &nid
			} else {
				// Datasetは全てIDが再割り当てされるため、リンクが途切れていることになる
				// よってリンク自体が無効になる
				l.LinksField = nil
				return
			}
		}

		if link.DatasetField != nil {
			if nds, ok := dm[*link.DatasetField]; ok {
				nid := nds
				nl.DatasetField = &nid
			} else {
				// Datasetは全てIDが再割り当てされるため、リンクが途切れていることになる
				// よってリンク自体が無効になる
				l.LinksField = nil
				return
			}
		}

		if link.FieldField != nil {
			if nf, ok := fm[*link.FieldField]; ok {
				nid := nf
				nl.FieldField = &nid
			} else {
				// Datasetは全てIDが再割り当てされるため、リンクが途切れていることになる
				// よってリンク自体が無効になる
				l.LinksField = nil
				return
			}
		}

		links = append(links, nl)
	}

	l.LinksField = links
}

func (l *Links) Links() []*Link {
	if l == nil || l.LinksField == nil || len(l.LinksField) == 0 {
		return nil
	}
	links2 := make([]*Link, 0, len(l.LinksField))
	for _, l := range l.LinksField {
		links2 = append(links2, l.Clone())
	}
	return links2
}

func (l *Links) DatasetIDs() []DatasetID {
	if l == nil {
		return nil
	}
	datasets := make([]DatasetID, 0, len(l.LinksField))
	for _, i := range l.LinksField {
		if i.DatasetField != nil {
			datasets = append(datasets, *i.DatasetField)
		} else {
			return datasets
		}
	}
	return datasets
}

func (l *Links) DatasetSchemaIDs() []DatasetSchemaID {
	if l == nil {
		return nil
	}
	schemas := make([]DatasetSchemaID, 0, len(l.LinksField))
	for _, i := range l.LinksField {
		if i.SchemaField != nil {
			schemas = append(schemas, *i.SchemaField)
		} else {
			return schemas
		}
	}
	return schemas
}

func (l *Links) HasSchemaAndDataset(s DatasetSchemaID, dsid DatasetID) bool {
	if l == nil {
		return false
	}
	for _, id := range l.DatasetSchemaIDs() {
		if id == s {
			return true
		}
	}
	for _, id := range l.DatasetIDs() {
		if id == dsid {
			return true
		}
	}
	return false
}

func (l *Links) DatasetSchemaFieldIDs() []DatasetFieldID {
	if l == nil {
		return nil
	}
	fields := make([]DatasetFieldID, 0, len(l.LinksField))
	for _, i := range l.LinksField {
		if i.FieldField != nil {
			fields = append(fields, *i.FieldField)
		} else {
			return fields
		}
	}
	return fields
}

func (l *Links) HasDataset(did DatasetID) bool {
	if l == nil {
		return false
	}
	for _, l2 := range l.LinksField {
		if l2 != nil && l2.DatasetField != nil && *l2.DatasetField == did {
			return true
		}
	}
	return false
}

func (l *Links) HasDatasetSchema(dsid DatasetSchemaID) bool {
	if l == nil {
		return false
	}
	for _, l2 := range l.LinksField {
		if l2 != nil && l2.SchemaField != nil && *l2.SchemaField == dsid {
			return true
		}
	}
	return false
}

func (l *Links) HasDatasetSchemaAndDataset(dsid DatasetSchemaID, did DatasetID) bool {
	if l == nil {
		return false
	}
	for _, l2 := range l.LinksField {
		if l2 != nil && (l2.SchemaField != nil && *l2.SchemaField == dsid || l2.DatasetField != nil && *l2.DatasetField == did) {
			return true
		}
	}
	return false
}

func NewLink(d DatasetID, ds DatasetSchemaID, f DatasetFieldID) *Link {
	dataset := d
	schema := ds
	field := f
	return &Link{
		DatasetField: &dataset,
		SchemaField:  &schema,
		FieldField:   &field,
	}
}

func NewLinkFieldOnly(ds DatasetSchemaID, f DatasetFieldID) *Link {
	schema := ds
	field := f
	return &Link{
		SchemaField: &schema,
		FieldField:  &field,
	}
}

func (l *Link) Dataset() *DatasetID {
	if l == nil {
		return nil
	}
	return l.DatasetField.CloneRef()
}

func (l *Link) DatasetSchema() *DatasetSchemaID {
	if l == nil {
		return nil
	}
	return l.SchemaField.CloneRef()
}

func (l *Link) DatasetSchemaField() *DatasetFieldID {
	if l == nil {
		return nil
	}
	return l.FieldField.CloneRef()
}

func (l *Link) Value(ds *dataset.Dataset) *dataset.Value {
	if l == nil || ds == nil || l.DatasetField == nil || l.FieldField == nil || ds.ID() != *l.DatasetField {
		return nil
	}
	f := ds.Field(*l.FieldField)
	if f == nil {
		return nil
	}
	return f.Value()
}

func (l *Link) Validate(dss *dataset.Schema, ds *dataset.Dataset) bool {
	if l == nil || l.FieldField == nil || l.SchemaField == nil || dss == nil {
		return false
	}

	// DS
	if dss.ID() != *l.SchemaField {
		return false
	}
	if f := dss.Field(*l.FieldField); f == nil {
		return false
	}

	// D
	if l.DatasetField != nil {
		if ds == nil || ds.ID() != *l.DatasetField || ds.Schema() != dss.ID() {
			return false
		}
		if f := ds.Field(*l.FieldField); f == nil {
			return false
		}
	}

	return true
}

func (l *Links) IsEmpty() bool {
	return l == nil || l.LinksField == nil || len(l.LinksField) == 0
}

func (l *Link) Clone() *Link {
	if l == nil {
		return nil
	}
	return &Link{
		DatasetField: l.Dataset(),
		SchemaField:  l.DatasetSchema(),
		FieldField:   l.DatasetSchemaField(),
	}
}

func (l *Link) ApplyDataset(ds *DatasetID) *Link {
	if l == nil {
		return nil
	}
	// if dataset is already set, it will not be overriden
	if ds == nil || l.Dataset() != nil {
		return l.Clone()
	}
	return &Link{
		DatasetField: ds.CloneRef(),
		SchemaField:  l.DatasetSchema(),
		FieldField:   l.DatasetSchemaField(),
	}
}

func (l *Links) ApplyDataset(ds *DatasetID) *Links {
	if l == nil || l.LinksField == nil || len(l.LinksField) == 0 {
		return nil
	}

	links := l.Clone()
	first := links.First()
	// if dataset is already set, it will not be overriden
	if ds == nil || first.Dataset() != nil {
		return links
	}

	links.LinksField[0] = first.ApplyDataset(ds)
	return links
}

func (l *Links) DatasetValue(ctx context.Context, d dataset.GraphLoader) (*dataset.Value, error) {
	if l == nil || d == nil {
		return nil, nil
	}
	dsid := l.First().Dataset()
	dsfid := l.DatasetSchemaFieldIDs()
	if dsid != nil && dsfid != nil {
		_, dsf, err := d(ctx, *dsid, dsfid...)
		if err != nil {
			return nil, err
		}
		if dsf != nil {
			return dsf.Value(), nil
		}
	}
	return nil, nil
}
