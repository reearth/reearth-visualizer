package property

type Condition struct {
	Field FieldID
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
