package property

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
)

// Links _
type Links struct {
	links []*Link
}

// Link _
type Link struct {
	dataset *id.DatasetID
	schema  *id.DatasetSchemaID
	field   *id.DatasetSchemaFieldID
}

// NewLinks _
func NewLinks(links []*Link) *Links {
	if links == nil {
		return nil
	}
	links2 := make([]*Link, 0, len(links))
	for _, l := range links {
		l2 := *l
		links2 = append(links2, &l2)
	}
	return &Links{
		links: links2,
	}
}

// Clone _
func (l *Links) Clone() *Links {
	if l == nil {
		return nil
	}
	return &Links{
		links: append([]*Link{}, l.links...),
	}
}

// IsLinked _
func (l *Links) IsLinked() bool {
	return l != nil && l.links != nil && len(l.links) > 0
}

// IsLinkedFully _
func (l *Links) IsLinkedFully() bool {
	return l != nil && l.links != nil && len(l.links) > 0 && len(l.DatasetIDs()) == len(l.links)
}

// Len _
func (l *Links) Len() int {
	if l == nil || l.links == nil {
		return 0
	}
	return len(l.links)
}

// First _
func (l *Links) First() *Link {
	if l == nil || l.links == nil || len(l.links) == 0 {
		return nil
	}
	return l.links[0]
}

// Last _
func (l *Links) Last() *Link {
	if l == nil || l.links == nil || len(l.links) == 0 {
		return nil
	}
	return l.links[len(l.links)-1]
}

// LastValue _
func (l *Links) LastValue(ds *dataset.Dataset) *dataset.Value {
	return l.Last().Value(ds)
}

// Validate _
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

// Replace _
func (l *Links) Replace(
	dsm map[id.DatasetSchemaID]id.DatasetSchemaID,
	dm map[id.DatasetID]id.DatasetID,
	fm map[id.DatasetSchemaFieldID]id.DatasetSchemaFieldID,
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

// Links _
func (l *Links) Links() []*Link {
	if l == nil || l.links == nil || len(l.links) == 0 {
		return nil
	}
	links2 := make([]*Link, 0, len(l.links))
	for _, l := range l.links {
		l2 := *l
		links2 = append(links2, &l2)
	}
	return links2
}

// DatasetIDs _
func (l *Links) DatasetIDs() []id.DatasetID {
	if l == nil {
		return nil
	}
	datasets := make([]id.DatasetID, 0, len(l.links))
	for _, i := range l.links {
		if i.dataset != nil {
			datasets = append(datasets, *i.dataset)
		} else {
			return datasets
		}
	}
	return datasets
}

// DatasetSchemaIDs _
func (l *Links) DatasetSchemaIDs() []id.DatasetSchemaID {
	if l == nil {
		return nil
	}
	schemas := make([]id.DatasetSchemaID, 0, len(l.links))
	for _, i := range l.links {
		if i.schema != nil {
			schemas = append(schemas, *i.schema)
		} else {
			return schemas
		}
	}
	return schemas
}

// IsDatasetLinked _
func (l *Links) IsDatasetLinked(s id.DatasetSchemaID, dsid id.DatasetID) bool {
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

// DatasetSchemaFieldIDs _
func (l *Links) DatasetSchemaFieldIDs() []id.DatasetSchemaFieldID {
	if l == nil {
		return nil
	}
	fields := make([]id.DatasetSchemaFieldID, 0, len(l.links))
	for _, i := range l.links {
		if i.field != nil {
			fields = append(fields, *i.field)
		} else {
			return fields
		}
	}
	return fields
}

// HasDataset _
func (l *Links) HasDataset(did id.DatasetID) bool {
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

// HasDatasetSchema _
func (l *Links) HasDatasetSchema(dsid id.DatasetSchemaID) bool {
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

func (l *Links) HasDatasetOrSchema(dsid id.DatasetSchemaID, did id.DatasetID) bool {
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

// NewLink _
func NewLink(d id.DatasetID, ds id.DatasetSchemaID, f id.DatasetSchemaFieldID) *Link {
	dataset := d
	schema := ds
	field := f
	return &Link{
		dataset: &dataset,
		schema:  &schema,
		field:   &field,
	}
}

// NewLinkFieldOnly _
func NewLinkFieldOnly(ds id.DatasetSchemaID, f id.DatasetSchemaFieldID) *Link {
	schema := ds
	field := f
	return &Link{
		schema: &schema,
		field:  &field,
	}
}

// Dataset _
func (l *Link) Dataset() *id.DatasetID {
	if l == nil || l.dataset == nil {
		return nil
	}
	dataset := *l.dataset
	return &dataset
}

// DatasetSchema _
func (l *Link) DatasetSchema() *id.DatasetSchemaID {
	if l == nil || l.schema == nil {
		return nil
	}
	datasetSchema := *l.schema
	return &datasetSchema
}

// DatasetSchemaField _
func (l *Link) DatasetSchemaField() *id.DatasetSchemaFieldID {
	if l == nil || l.field == nil {
		return nil
	}
	field := *l.field
	return &field
}

// Value _
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

// Validate _
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

// IsEmpty _
func (l *Links) IsEmpty() bool {
	return l == nil || l.links == nil || len(l.links) == 0
}

// Clone _
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

// ApplyDataset _
func (l *Link) ApplyDataset(ds *id.DatasetID) *Link {
	if l == nil {
		return nil
	}
	// if dataset is already set, it will not be overriden
	if ds == nil || l.Dataset() != nil {
		return l.Clone()
	}
	ds2 := *ds
	return &Link{
		dataset: &ds2,
		schema:  l.DatasetSchema(),
		field:   l.DatasetSchemaField(),
	}
}

// ApplyDataset _
func (l *Links) ApplyDataset(ds *id.DatasetID) *Links {
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
