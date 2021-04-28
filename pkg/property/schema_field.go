package property

import (
	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
)

type SchemaField struct {
	id           id.PropertySchemaFieldID
	propertyType ValueType
	title        i18n.String
	description  i18n.String
	prefix       string
	suffix       string
	defaultValue *Value
	ui           SchemaFieldUI
	min          *float64
	max          *float64
	choices      []SchemaFieldChoice
	cond         *Condition
}

type SchemaFieldChoice struct {
	Key   string
	Title i18n.String
	Icon  string
}

func (p *SchemaField) ID() id.PropertySchemaFieldID {
	return p.id
}

func (p *SchemaField) Type() ValueType {
	return p.propertyType
}

func (p *SchemaField) Title() i18n.String {
	return p.title.Copy()
}

func (p *SchemaField) Description() i18n.String {
	return p.description.Copy()
}

func (p *SchemaField) Prefix() string {
	return p.prefix
}

func (p *SchemaField) Suffix() string {
	return p.suffix
}

func (p *SchemaField) DefaultValue() *Value {
	if p == nil || p.defaultValue == nil {
		return nil
	}
	v := *p.defaultValue
	return &v
}

func (p *SchemaField) UI() *SchemaFieldUI {
	if p == nil || p.ui == SchemaFieldUI("") {
		return nil
	}
	ui := p.ui
	return &ui
}

func (p *SchemaField) Min() *float64 {
	if p == nil || p.min == nil {
		return nil
	}
	min := *p.min
	return &min
}

func (p *SchemaField) Max() *float64 {
	if p == nil || p.max == nil {
		return nil
	}
	max := *p.max
	return &max
}

func (p *SchemaField) MinMax() (*float64, *float64) {
	if p == nil {
		return nil, nil
	}
	return p.Min(), p.Max()
}

func (p *SchemaField) Choices() []SchemaFieldChoice {
	if p == nil {
		return nil
	}
	if p.choices == nil {
		return p.choices
	}
	return append([]SchemaFieldChoice{}, p.choices...)
}

func (p *SchemaField) Choice(key string) *SchemaFieldChoice {
	if p == nil || p.choices == nil {
		return nil
	}
	for _, c := range p.choices {
		if c.Key == key {
			return &c
		}
	}
	return nil
}

func (p *SchemaField) IsAvailableIf() *Condition {
	if p == nil {
		return nil
	}
	return p.cond.Clone()
}

func (p *SchemaField) Validate(value *Value) bool {
	if p == nil {
		return false
	}
	if value == nil {
		return true
	}
	if p.propertyType != value.Type() {
		return false
	}
	switch v := value.Value().(type) {
	case float64:
		if min := p.Min(); min != nil {
			if v < *min {
				return false
			}
		}
		if max := p.Max(); max != nil {
			if v > *max {
				return false
			}
		}
	case string:
		if choices := p.Choices(); choices != nil {
			ok := false
			for _, k := range choices {
				if k.Key == v {
					ok = true
					break
				}
			}
			if !ok {
				return false
			}
		}
	}
	return true
}

func (p *SchemaField) SetTitle(title i18n.String) {
	p.title = title.Copy()
}

func (p *SchemaField) SetDescription(des i18n.String) {
	p.description = des.Copy()
}

func (c *SchemaFieldChoice) SetTitle(l i18n.String) {
	c.Title = l.Copy()
}

func (c SchemaFieldChoice) Copy() SchemaFieldChoice {
	return SchemaFieldChoice{
		Icon:  c.Icon,
		Key:   c.Key,
		Title: c.Title.Copy(),
	}
}
