package property

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
)

type Links struct {
	links []*Link
}

type Link struct {
	dataset *DatasetID
	schema  *DatasetSchemaID
	field   *DatasetFieldID
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
		links: links2,
	}
}

func (l *Links) Clone() *Links {
	if l == nil {
		return nil
	}
	return &Links{
		links: append([]*Link{}, l.links...),
	}
}

func (l *Links) IsLinked() bool {
	return l != nil && l.links != nil && len(l.links) > 0
}

func (l *Links) IsLinkedFully() bool {
	return l != nil && l.links != nil && len(l.links) > 0 && len(l.DatasetIDs()) == len(l.links)
}

func (l *Links) Len() int {
	if l == nil || l.links == nil {
		return 0
	}
	return len(l.links)
}

func (l *Links) First() *Link {
	if l == nil || l.links == nil || len(l.links) == 0 {
		return nil
	}
	return l.links[0]
}

func (l *Links) Last() *Link {
	if l == nil || l.links == nil || len(l.links) == 0 {
		return nil
	}
	return l.links[len(l.links)-1]
}

func (l *Links) LastValue(ds *dataset.Dataset) *dataset.Value {
	return l.Last().Value(ds)
}

func (l *Links) Validate(dsm dataset.SchemaMap, dm dataset.Map) bool {
	if l == nil || l.links == nil {
		return false
	}
	firstDatasetSchema := l.First().DatasetSchema()
	if firstDatasetSchema == nil {
		return false
	}
	fields := l.DatasetSchemaFieldIDs()
	if fields == nil || len(fields) != len(l.links) {
		return false
	}
	firstDataset := l.First().Dataset()

	res, resf := dsm.GraphSearchByFields(*firstDatasetSchema, fields...)
	if len(res) != len(l.links) || resf == nil {
		return false
	}

	if firstDataset != nil {
		res2, resf2 := dm.GraphSearchByFields(*firstDataset, fields...)
		return len(res2) == len(l.links) && resf2 != nil
	}

	return true
}

func (l *Links) Replace(
	dsm map[DatasetSchemaID]DatasetSchemaID,
	dm map[DatasetID]DatasetID,
	fm map[DatasetFieldID]DatasetFieldID,
) {
	if l == nil || l.links == nil {
		return
	}

	links := make([]*Link, 0, len(l.links))

	for _, link := range l.links {
		nl := &Link{}

		if link.schema != nil {
			if nds, ok := dsm[*link.schema]; ok {
				nid := nds
				nl.schema = &nid
			} else {
				// Datasetは全てIDが再割り当てされるため、リンクが途切れていることになる
				// よってリンク自体が無効になる
				l.links = nil
				return
			}
		}

		if link.dataset != nil {
			if nds, ok := dm[*link.dataset]; ok {
				nid := nds
				nl.dataset = &nid
			} else {
				// Datasetは全てIDが再割り当てされるため、リンクが途切れていることになる
				// よってリンク自体が無効になる
				l.links = nil
				return
			}
		}

		if link.field != nil {
			if nf, ok := fm[*link.field]; ok {
				nid := nf
				nl.field = &nid
			} else {
				// Datasetは全てIDが再割り当てされるため、リンクが途切れていることになる
				// よってリンク自体が無効になる
				l.links = nil
				return
			}
		}

		links = append(links, nl)
	}

	l.links = links
}

func (l *Links) Links() []*Link {
	if l == nil || l.links == nil || len(l.links) == 0 {
		return nil
	}
	links2 := make([]*Link, 0, len(l.links))
	for _, l := range l.links {
		links2 = append(links2, l.Clone())
	}
	return links2
}

func (l *Links) DatasetIDs() []DatasetID {
	if l == nil {
		return nil
	}
	datasets := make([]DatasetID, 0, len(l.links))
	for _, i := range l.links {
		if i.dataset != nil {
			datasets = append(datasets, *i.dataset)
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
	schemas := make([]DatasetSchemaID, 0, len(l.links))
	for _, i := range l.links {
		if i.schema != nil {
			schemas = append(schemas, *i.schema)
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
	fields := make([]DatasetFieldID, 0, len(l.links))
	for _, i := range l.links {
		if i.field != nil {
			fields = append(fields, *i.field)
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
	for _, l2 := range l.links {
		if l2 != nil && l2.dataset != nil && *l2.dataset == did {
			return true
		}
	}
	return false
}

func (l *Links) HasDatasetSchema(dsid DatasetSchemaID) bool {
	if l == nil {
		return false
	}
	for _, l2 := range l.links {
		if l2 != nil && l2.schema != nil && *l2.schema == dsid {
			return true
		}
	}
	return false
}

func (l *Links) HasDatasetSchemaAndDataset(dsid DatasetSchemaID, did DatasetID) bool {
	if l == nil {
		return false
	}
	for _, l2 := range l.links {
		if l2 != nil && (l2.schema != nil && *l2.schema == dsid || l2.dataset != nil && *l2.dataset == did) {
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
		dataset: &dataset,
		schema:  &schema,
		field:   &field,
	}
}

func NewLinkFieldOnly(ds DatasetSchemaID, f DatasetFieldID) *Link {
	schema := ds
	field := f
	return &Link{
		schema: &schema,
		field:  &field,
	}
}

func (l *Link) Dataset() *DatasetID {
	if l == nil {
		return nil
	}
	return l.dataset.CloneRef()
}

func (l *Link) DatasetSchema() *DatasetSchemaID {
	if l == nil {
		return nil
	}
	return l.schema.CloneRef()
}

func (l *Link) DatasetSchemaField() *DatasetFieldID {
	if l == nil {
		return nil
	}
	return l.field.CloneRef()
}

func (l *Link) Value(ds *dataset.Dataset) *dataset.Value {
	if l == nil || ds == nil || l.dataset == nil || l.field == nil || ds.ID() != *l.dataset {
		return nil
	}
	f := ds.Field(*l.field)
	if f == nil {
		return nil
	}
	return f.Value()
}

func (l *Link) Validate(dss *dataset.Schema, ds *dataset.Dataset) bool {
	if l == nil || l.field == nil || l.schema == nil || dss == nil {
		return false
	}

	// DS
	if dss.ID() != *l.schema {
		return false
	}
	if f := dss.Field(*l.field); f == nil {
		return false
	}

	// D
	if l.dataset != nil {
		if ds == nil || ds.ID() != *l.dataset || ds.Schema() != dss.ID() {
			return false
		}
		if f := ds.Field(*l.field); f == nil {
			return false
		}
	}

	return true
}

func (l *Links) IsEmpty() bool {
	return l == nil || l.links == nil || len(l.links) == 0
}

func (l *Link) Clone() *Link {
	if l == nil {
		return nil
	}
	return &Link{
		dataset: l.Dataset(),
		schema:  l.DatasetSchema(),
		field:   l.DatasetSchemaField(),
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
		dataset: ds.CloneRef(),
		schema:  l.DatasetSchema(),
		field:   l.DatasetSchemaField(),
	}
}

func (l *Links) ApplyDataset(ds *DatasetID) *Links {
	if l == nil || l.links == nil || len(l.links) == 0 {
		return nil
	}

	links := l.Clone()
	first := links.First()
	// if dataset is already set, it will not be overriden
	if ds == nil || first.Dataset() != nil {
		return links
	}

	links.links[0] = first.ApplyDataset(ds)
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
