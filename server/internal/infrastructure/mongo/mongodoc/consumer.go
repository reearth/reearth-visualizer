package mongodoc

import "github.com/reearth/reearthx/mongox"

func NewComsumer[T Model[U], U any]() *mongox.SliceFuncConsumer[T, U] {
	return mongox.NewSliceFuncConsumer(func(d T) (U, error) {
		return d.Model()
	})
}

type Model[T any] interface {
	Model() (T, error)
}
