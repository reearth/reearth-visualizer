package property

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/i18n"
)

type SchemaFieldBuilder struct {
	p *SchemaField
}

func NewSchemaField() *SchemaFieldBuilder {
	return &SchemaFieldBuilder{p: &SchemaField{}}
}

func (b *SchemaFieldBuilder) Build() (*SchemaField, error) {
	if b.p.id.String() == "" || b.p.id.String() == "id" {
		return nil, ErrInvalidID
	}
	if b.p.ui != SchemaFieldUI("") && SchemaFieldUIFrom(string(b.p.ui)) == SchemaFieldUI("") {
		return nil, errors.New("invalid property schema field ui")
	}
	if b.p.min != nil && b.p.max != nil && *b.p.min > *b.p.max {
		return nil, errors.New("invalid min and max")
	}
	if ok := b.p.propertyType.Valid(); !ok {
		return nil, errors.New("invalid value type")
	}
	return b.p, nil
}

func (b *SchemaFieldBuilder) MustBuild() *SchemaField {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *SchemaFieldBuilder) ID(id FieldID) *SchemaFieldBuilder {
	b.p.id = id
	return b
}

func (b *SchemaFieldBuilder) Type(propertyType ValueType) *SchemaFieldBuilder {
	b.p.propertyType = propertyType
	return b
}

func (b *SchemaFieldBuilder) Name(name i18n.String) *SchemaFieldBuilder {
	b.p.title = name.Clone()
	return b
}

func (b *SchemaFieldBuilder) Description(description i18n.String) *SchemaFieldBuilder {
	b.p.description = description.Clone()
	return b
}

func (b *SchemaFieldBuilder) Prefix(prefix string) *SchemaFieldBuilder {
	b.p.prefix = prefix
	return b
}

func (b *SchemaFieldBuilder) Suffix(suffix string) *SchemaFieldBuilder {
	b.p.suffix = suffix
	return b
}

func (b *SchemaFieldBuilder) DefaultValue(v *Value) *SchemaFieldBuilder {
	if v == nil {
		b.p.defaultValue = nil
	} else {
		b.p.defaultValue = v.Clone()
	}
	return b
}

func (b *SchemaFieldBuilder) UI(ui SchemaFieldUI) *SchemaFieldBuilder {
	b.p.ui = ui
	return b
}

func (b *SchemaFieldBuilder) UIRef(ui *SchemaFieldUI) *SchemaFieldBuilder {
	if ui == nil {
		b.p.ui = SchemaFieldUI("")
	} else {
		b.p.ui = *ui
	}
	return b
}

func (b *SchemaFieldBuilder) Min(min float64) *SchemaFieldBuilder {
	m := min
	b.p.min = &m
	return b
}

func (b *SchemaFieldBuilder) Max(max float64) *SchemaFieldBuilder {
	m := max
	b.p.max = &m
	return b
}

func (b *SchemaFieldBuilder) MinRef(min *float64) *SchemaFieldBuilder {
	if min == nil {
		b.p.min = nil
	} else {
		m := *min
		b.p.min = &m
	}
	return b
}

func (b *SchemaFieldBuilder) MaxRef(max *float64) *SchemaFieldBuilder {
	if max == nil {
		b.p.max = nil
	} else {
		m := *max
		b.p.max = &m
	}
	return b
}

func (b *SchemaFieldBuilder) Choices(choices []SchemaFieldChoice) *SchemaFieldBuilder {
	if choices == nil {
		b.p.choices = nil
	} else {
		b.p.choices = make([]SchemaFieldChoice, 0, len(choices))
		for _, c := range choices {
			b.p.choices = append(b.p.choices, c.Copy())
		}
	}
	return b
}

func (b *SchemaFieldBuilder) IsAvailableIf(cond *Condition) *SchemaFieldBuilder {
	b.p.cond = cond.Clone()
	return b
}
