package property

import "github.com/reearth/reearth-backend/pkg/id"

// Condition _
type Condition struct {
	Field id.PropertySchemaFieldID
	Value *Value
}

// Clone _
func (c *Condition) Clone() *Condition {
	if c == nil {
		return nil
	}
	return &Condition{
		Field: c.Field,
		Value: c.Value.Clone(),
	}
}
