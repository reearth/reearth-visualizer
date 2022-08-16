package property

import (
	"github.com/reearth/reearth/server/pkg/i18n"
)

type SchemaField struct {
	id           FieldID
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

func (p *SchemaField) ID() FieldID {
	if p == nil {
		return ""
	}
	return p.id
}

func (p *SchemaField) Type() ValueType {
	if p == nil {
		return ValueTypeUnknown
	}
	return p.propertyType
}

func (p *SchemaField) Title() i18n.String {
	if p == nil {
		return nil
	}
	return p.title.Clone()
}

func (p *SchemaField) Description() i18n.String {
	if p == nil {
		return nil
	}
	return p.description.Clone()
}

func (p *SchemaField) Prefix() string {
	if p == nil {
		return ""
	}
	return p.prefix
}

func (p *SchemaField) Suffix() string {
	if p == nil {
		return ""
	}
	return p.suffix
}

func (p *SchemaField) DefaultValue() *Value {
	if p == nil {
		return nil
	}
	return p.defaultValue.Clone()
}

func (p *SchemaField) UI() *SchemaFieldUI {
	if p == nil || p.ui == "" {
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

func (p *SchemaField) Validate(value *OptionalValue) bool {
	if p == nil || value == nil || p.propertyType != value.Type() {
		return false
	}
	switch v := value.Value().Value().(type) {
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
	if p == nil {
		return
	}
	p.title = title.Clone()
}

func (p *SchemaField) SetDescription(des i18n.String) {
	if p == nil {
		return
	}
	p.description = des.Clone()
}

func (c *SchemaFieldChoice) SetTitle(l i18n.String) {
	if c == nil {
		return
	}
	c.Title = l.Clone()
}

func (c SchemaFieldChoice) Copy() SchemaFieldChoice {
	return SchemaFieldChoice{
		Icon:  c.Icon,
		Key:   c.Key,
		Title: c.Title.Clone(),
	}
}
