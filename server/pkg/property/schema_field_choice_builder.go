package property

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/i18n"
)

type SchemaFieldChoiceBuilder struct {
	p *SchemaFieldChoice
}

func NewSchemaFieldChoice() *SchemaFieldChoiceBuilder {
	return &SchemaFieldChoiceBuilder{p: &SchemaFieldChoice{}}
}

func (b *SchemaFieldChoiceBuilder) Build() (*SchemaFieldChoice, error) {
	if b.p.Key == "" {
		return nil, errors.New("invalid ID SchemaFieldChoiceBuilder.key ")
	}
	return b.p, nil
}

func (b *SchemaFieldChoiceBuilder) MustBuild() *SchemaFieldChoice {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *SchemaFieldChoiceBuilder) Key(key string) *SchemaFieldChoiceBuilder {
	b.p.Key = key
	return b
}

func (b *SchemaFieldChoiceBuilder) Title(title i18n.String) *SchemaFieldChoiceBuilder {
	b.p.Title = title.Clone()
	return b
}

func (b *SchemaFieldChoiceBuilder) Icon(icon string) *SchemaFieldChoiceBuilder {
	b.p.Icon = icon
	return b
}
