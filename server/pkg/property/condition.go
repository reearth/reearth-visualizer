package property

import "github.com/reearth/reearth/server/pkg/id"

type Condition struct {
	Field id.PropertyFieldID
	Value *Value
}

func (c *Condition) Clone() *Condition {
	if c == nil {
		return nil
	}
	return &Condition{
		Field: c.Field,
		Value: c.Value.Clone(),
	}
}
