package manifest

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
)

type Diff struct {
	From                  plugin.ID
	To                    plugin.ID
	PropertySchemaDiff    property.SchemaDiff
	PropertySchemaDeleted bool
	DeletedExtensions     []DiffExtensionDeleted
	UpdatedExtensions     []DiffExtensionUpdated
}

type DiffExtensionUpdated struct {
	ExtensionID        plugin.ExtensionID
	OldType            plugin.ExtensionType
	NewType            plugin.ExtensionType
	PropertySchemaDiff property.SchemaDiff
}

type DiffExtensionDeleted struct {
	ExtensionID      plugin.ExtensionID
	PropertySchemaID property.SchemaID
}

func DiffFrom(old, new Manifest) (d Diff) {
	d.From = old.Plugin.ID()
	d.To = new.Plugin.ID()

	oldsid, newsid := old.Plugin.Schema(), new.Plugin.Schema()
	if oldsid != nil && newsid == nil {
		d.PropertySchemaDiff.From = *oldsid
		d.PropertySchemaDeleted = true
	} else if oldsid != nil && newsid != nil {
		d.PropertySchemaDiff = property.SchemaDiffFrom(old.PropertySchema(*oldsid), old.PropertySchema(*newsid))
	}

	for _, e := range old.Plugin.Extensions() {
		ne := new.Plugin.Extension(e.ID())
		if ne == nil {
			d.DeletedExtensions = append(d.DeletedExtensions, DiffExtensionDeleted{
				ExtensionID:      e.ID(),
				PropertySchemaID: e.Schema(),
			})
			continue
		}

		oldps, newps := old.PropertySchema(e.Schema()), new.PropertySchema(ne.Schema())
		diff := DiffExtensionUpdated{
			ExtensionID:        e.ID(),
			OldType:            e.Type(),
			NewType:            ne.Type(),
			PropertySchemaDiff: property.SchemaDiffFrom(oldps, newps),
		}

		if diff.OldType != diff.NewType || !diff.PropertySchemaDiff.IsEmpty() {
			d.UpdatedExtensions = append(d.UpdatedExtensions, diff)
		}
	}

	return
}

func (d *Diff) IsEmpty() bool {
	return d == nil || len(d.DeletedExtensions) == 0 && len(d.UpdatedExtensions) == 0 && d.PropertySchemaDiff.IsEmpty() && !d.PropertySchemaDeleted
}

func (d Diff) DeletedPropertySchemas() []id.PropertySchemaID {
	s := make([]id.PropertySchemaID, 0, len(d.DeletedExtensions)+1)
	if d.PropertySchemaDeleted {
		s = append(s, d.PropertySchemaDiff.From)
	}
	for _, e := range d.DeletedExtensions {
		skip := false
		for _, ss := range s {
			if ss.Equal(e.PropertySchemaID) {
				skip = true
				break
			}
		}
		if skip {
			continue
		}
		s = append(s, e.PropertySchemaID)
	}
	return s
}

func (d Diff) PropertySchmaDiffs() property.SchemaDiffList {
	s := make(property.SchemaDiffList, 0, len(d.UpdatedExtensions)+1)
	if !d.PropertySchemaDeleted && (!d.PropertySchemaDiff.IsEmpty() || d.PropertySchemaDiff.IsIDChanged()) {
		s = append(s, d.PropertySchemaDiff)
	}
	for _, e := range d.UpdatedExtensions {
		if !e.PropertySchemaDiff.IsEmpty() || e.PropertySchemaDiff.IsIDChanged() {
			s = append(s, e.PropertySchemaDiff)
		}
	}
	return s
}
