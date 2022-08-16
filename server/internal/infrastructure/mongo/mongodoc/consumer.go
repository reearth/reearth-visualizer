package mongodoc

import "go.mongodb.org/mongo-driver/bson"

type Consumer interface {
	// Consume で渡されたrawの参照をフィールドに持ってはいけません
	// MUST NOT HAVE A ROW REFERENCE PASSED BY Consume METHOD IN THE FIELD
	Consume(raw bson.Raw) error
}

type FuncConsumer func(raw bson.Raw) error

func (c FuncConsumer) Consume(raw bson.Raw) error {
	return c(raw)
}

type BatchConsumer struct {
	Size     int
	Rows     []bson.Raw
	Callback func([]bson.Raw) error
}

func (c *BatchConsumer) Consume(raw bson.Raw) error {
	size := c.Size
	if size == 0 {
		size = 10
	}

	if raw != nil {
		c.Rows = append(c.Rows, raw)
	}

	if raw == nil || len(c.Rows) >= size {
		err := c.Callback(c.Rows)
		c.Rows = []bson.Raw{}
		if err != nil {
			return err
		}
	}

	return nil
}
