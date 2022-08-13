package property

type SchemaDiff struct {
	From        SchemaID
	To          SchemaID
	Deleted     []SchemaDiffDeleted
	Moved       []SchemaDiffMoved
	TypeChanged []SchemaDiffTypeChanged
}

type SchemaDiffDeleted SchemaFieldPointer

type SchemaDiffMoved struct {
	From   SchemaFieldPointer
	To     SchemaFieldPointer
	ToList bool
}

type SchemaDiffTypeChanged struct {
	SchemaFieldPointer
	NewType ValueType
}

func SchemaDiffFrom(old, new *Schema) (d SchemaDiff) {
	if old != nil {
		d.From = old.ID()
	}
	if new != nil {
		d.To = new.ID()
	}
	if old == nil || new == nil || old == new {
		return
	}

	for _, gf := range old.Groups().GroupAndFields() {
		ngf := new.Groups().GroupAndField(gf.Field.ID())
		if ngf == nil {
			d.Deleted = append(d.Deleted, SchemaDiffDeleted(gf.SchemaFieldPointer()))
			continue
		}

		if ngf.Group.ID() != gf.Group.ID() {
			d.Moved = append(d.Moved, SchemaDiffMoved{
				From:   gf.SchemaFieldPointer(),
				To:     ngf.SchemaFieldPointer(),
				ToList: ngf.Group.IsList(),
			})
		}

		if ngf.Field.Type() != gf.Field.Type() {
			d.TypeChanged = append(d.TypeChanged, SchemaDiffTypeChanged{
				SchemaFieldPointer: ngf.SchemaFieldPointer(),
				NewType:            ngf.Field.Type(),
			})
		}
	}

	return
}

func SchemaDiffFromProperty(old *Property, new *Schema) (d SchemaDiff) {
	return SchemaDiffFrom(old.GuessSchema(), new)
}

func (d *SchemaDiff) Migrate(p *Property) (res bool) {
	if d.IsEmpty() {
		return
	}

	res = p.updateSchema(d.To)

	for _, dd := range d.Deleted {
		if p.RemoveFields(SchemaFieldPointer(dd).Pointer()) {
			res = true
		}
	}

	for _, dm := range d.Moved {
		if dm.ToList {
			// group -> list and list -> list are not supported; just delete
			if p.RemoveFields(dm.From.Pointer()) {
				res = true
			}
			continue
		}

		if p.MoveFields(dm.From.Pointer(), dm.To.Pointer()) {
			res = true
		}
	}

	for _, dt := range d.TypeChanged {
		if p.Cast(dt.Pointer(), dt.NewType) {
			res = true
		}
	}

	return
}

func (d *SchemaDiff) IsEmpty() bool {
	return d == nil || len(d.Deleted) == 0 && len(d.Moved) == 0 && len(d.TypeChanged) == 0
}

func (d *SchemaDiff) IsIDChanged() bool {
	return d != nil && !d.From.Equal(d.To)
}

type SchemaDiffList []SchemaDiff

func (l SchemaDiffList) FindByFrom(from SchemaID) *SchemaDiff {
	for _, d := range l {
		if d.From.Equal(from) {
			return &d
		}
	}
	return nil
}

func (l SchemaDiffList) FromSchemas() []SchemaID {
	if len(l) == 0 {
		return nil
	}

	res := make([]SchemaID, 0, len(l))
	for _, d := range l {
		s := d.From
		found := false
		for _, r := range res {
			if r.Equal(s) {
				found = true
				break
			}
		}
		if !found {
			res = append(res, s)
		}
	}
	return res
}
