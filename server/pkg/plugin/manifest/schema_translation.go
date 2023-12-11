package manifest

import "github.com/reearth/reearth/server/pkg/i18n"

type TranslationExtension struct {
	Description    *string                   `json:"description,omitempty"`
	Name           *string                   `json:"name,omitempty"`
	PropertySchema TranslationPropertySchema `json:"propertySchema,omitempty"`
}

type TranslationPropertySchema map[string]TranslationPropertySchemaGroup

type TranslationPropertySchemaField struct {
	Choices     map[string]string `json:"choices,omitempty"`
	Title       *string           `json:"title,omitempty"`
	Description *string           `json:"description,omitempty"`
	Prefix      *string           `json:"prefix,omitempty"`
	Suffix      *string           `json:"suffix,omitempty"`
}

type TranslationPropertySchemaGroup struct {
	Description *string                                   `json:"description,omitempty"`
	Fields      map[string]TranslationPropertySchemaField `json:"fields,omitempty"`
	Title       *string                                   `json:"title,omitempty"`
}

type TranslationRoot struct {
	Description *string                         `json:"description,omitempty"`
	Extensions  map[string]TranslationExtension `json:"extensions,omitempty"`
	Name        *string                         `json:"name,omitempty"`
	Schema      TranslationPropertySchema       `json:"schema,omitempty"`
}

type TranslationMap map[string]TranslationRoot

type TranslatedExtension struct {
	Description    i18n.String
	Name           i18n.String
	PropertySchema TranslatedPropertySchema
}

type TranslatedPropertySchema map[string]*TranslatedPropertySchemaGroup

type TranslatedPropertySchemaField struct {
	Choices     map[string]i18n.String
	Description i18n.String
	Title       i18n.String
	Prefix      i18n.String
	Suffix      i18n.String
}

type TranslatedPropertySchemaGroup struct {
	Description i18n.String
	Fields      map[string]*TranslatedPropertySchemaField
	Title       i18n.String
	Collection  i18n.String
}

type TranslatedRoot struct {
	Description i18n.String
	Extensions  map[string]*TranslatedExtension
	Name        i18n.String
	Schema      TranslatedPropertySchema
}

func (tm TranslationMap) Translated() (res TranslatedRoot) {
	if len(tm) == 0 {
		return TranslatedRoot{}
	}

	res.Name = tm.name()
	res.Description = tm.description()
	res.Schema.setPropertySchema(tm.propertySchemas(""))

	for l, t := range tm {
		for eid, e := range t.Extensions {
			te := res.getOrCreateExtension(eid)

			if e.Name != nil {
				if te.Name == nil {
					te.Name = i18n.String{}
				}
				te.Name[l] = *e.Name
			}

			if e.Description != nil {
				if te.Description == nil {
					te.Description = i18n.String{}
				}
				te.Description[l] = *e.Description
			}

			if len(e.PropertySchema) > 0 {
				te.PropertySchema.setPropertySchema(tm.propertySchemas(eid))
			}
		}
	}

	return res
}

func (tm TranslationMap) TranslatedRef() *TranslatedRoot {
	if len(tm) == 0 {
		return nil
	}

	t := tm.Translated()
	return &t
}

func (t TranslationRoot) propertySchema(eid string) (res TranslationPropertySchema) {
	if eid == "" {
		return t.Schema
	}
	for eid2, e := range t.Extensions {
		if eid == eid2 {
			return e.PropertySchema
		}
	}
	return
}

func (tm TranslationMap) name() i18n.String {
	name := i18n.String{}
	for l, t := range tm {
		if t.Name == nil {
			continue
		}
		name[l] = *t.Name
	}
	if len(name) == 0 {
		return nil
	}
	return name
}

func (tm TranslationMap) description() i18n.String {
	desc := i18n.String{}
	for l, t := range tm {
		if t.Description == nil {
			continue
		}
		desc[l] = *t.Description
	}
	if len(desc) == 0 {
		return nil
	}
	return desc
}

func (tm TranslationMap) propertySchemas(eid string) map[string]TranslationPropertySchema {
	if len(tm) == 0 {
		return nil
	}

	res := make(map[string]TranslationPropertySchema)
	for l, tl := range tm {
		s := tl.propertySchema(eid)
		res[l] = s
	}
	return res
}

func (t *TranslatedRoot) getOrCreateExtension(eid string) *TranslatedExtension {
	if eid == "" {
		return nil
	}
	if t.Extensions == nil {
		t.Extensions = map[string]*TranslatedExtension{}
	}
	if e, ok := t.Extensions[eid]; ok {
		return e
	}
	g := &TranslatedExtension{}
	t.Extensions[eid] = g
	return g
}

func (t *TranslatedPropertySchema) getOrCreateGroup(gid string) *TranslatedPropertySchemaGroup {
	if gid == "" {
		return nil
	}
	if t == nil || *t == nil {
		*t = TranslatedPropertySchema{}
	}
	if g := (*t)[gid]; g != nil {
		return g
	}
	g := &TranslatedPropertySchemaGroup{}
	(*t)[gid] = g
	return g
}

func (t *TranslatedPropertySchemaGroup) getOrCreateField(fid string) *TranslatedPropertySchemaField {
	if fid == "" {
		return nil
	}
	if t.Fields == nil {
		t.Fields = map[string]*TranslatedPropertySchemaField{}
	}
	if f := t.Fields[fid]; f != nil {
		return f
	}
	f := &TranslatedPropertySchemaField{}
	t.Fields[fid] = f
	return f
}

func (t *TranslatedPropertySchema) setPropertySchema(schemas map[string]TranslationPropertySchema) {
	for l, tl := range schemas {
		for gid, g := range tl {
			if t == nil || *t == nil {
				*t = TranslatedPropertySchema{}
			}

			tg := t.getOrCreateGroup(gid)

			if g.Title != nil {
				if tg.Title == nil {
					tg.Title = i18n.String{}
				}
				tg.Title[l] = *g.Title
			}

			if g.Description != nil {
				if tg.Description == nil {
					tg.Description = i18n.String{}
				}
				tg.Description[l] = *g.Description
			}

			for fid, f := range g.Fields {
				tf := tg.getOrCreateField(fid)
				if f.Title != nil {
					if tf.Title == nil {
						tf.Title = i18n.String{}
					}
					tf.Title[l] = *f.Title
				}

				if f.Description != nil {
					if tf.Description == nil {
						tf.Description = i18n.String{}
					}
					tf.Description[l] = *f.Description
				}

				if f.Prefix != nil {
					if tf.Prefix == nil {
						tf.Prefix = i18n.String{}
					}
					tf.Prefix[l] = *f.Prefix
				}

				if f.Suffix != nil {
					if tf.Suffix == nil {
						tf.Suffix = i18n.String{}
					}
					tf.Suffix[l] = *f.Suffix
				}

				if len(f.Choices) > 0 {
					if tf.Choices == nil {
						tf.Choices = map[string]i18n.String{}
					}
					for cid, c := range f.Choices {
						if tf.Choices[cid] == nil {
							tf.Choices[cid] = i18n.String{}
						}
						tf.Choices[cid][l] = c
					}
				}
			}
		}
	}
}
