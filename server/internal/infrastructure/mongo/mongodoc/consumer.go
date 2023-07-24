package mongodoc

import (
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

type Model[T any] interface {
	Model() (T, error)
}

type Consumer[T, K any] struct {
	Result []K
	c      mongox.SimpleConsumer[T]
}

func NewConsumer[T Model[U], U any](filter func(U) bool) *Consumer[T, U] {
	var c *Consumer[T, U]
	c = &Consumer[T, U]{
		c: mongox.SimpleConsumer[T](func(d T) error {
			e, err := d.Model()
			if err != nil {
				return err
			}
			if filter == nil || filter(e) {
				c.Result = append(c.Result, e)
			}
			return nil
		}),
	}
	return c
}

func (s *Consumer[T, K]) Consume(raw bson.Raw) error {
	return s.c.Consume(raw)
}
