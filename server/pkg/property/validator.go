package property

import (
	"context"
	"fmt"
)

type Validator struct {
	SchemaLoader SchemaLoader
}

func (v Validator) Validate(ctx context.Context, properties List) error {
	schemaIDs := properties.Schemas()
	schemas, err := v.SchemaLoader(ctx, schemaIDs...)
	if err != nil {
		return err
	}
	schemaMap := schemas.Map()

	for _, p := range properties {
		schema := schemaMap[p.Schema()]
		if err := p.ValidateSchema(schema); err != nil {
			return fmt.Errorf("invalid property: %s (%s): %w", p.ID(), p.Schema(), err)
		}
	}

	return nil
}
