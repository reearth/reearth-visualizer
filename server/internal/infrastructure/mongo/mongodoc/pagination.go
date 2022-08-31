package mongodoc

import (
	"errors"

	"github.com/reearth/reearthx/usecasex"
)

type Pagination struct {
	Before *string
	After  *string
	First  *int
	Last   *int
}

func PaginationFrom(pagination *usecasex.Pagination) *Pagination {
	if pagination == nil {
		return nil
	}
	return &Pagination{
		Before: (*string)(pagination.Before),
		After:  (*string)(pagination.After),
		First:  pagination.First,
		Last:   pagination.Last,
	}
}

func (p *Pagination) SortDirection() int {
	if p != nil && p.Last != nil {
		return -1
	}
	return 1
}

func (p *Pagination) Parameters() (limit int64, op string, cursor *string, err error) {
	if first, after := p.First, p.After; first != nil {
		limit = int64(*first)
		op = "$gt"
		cursor = after
		return
	}
	if last, before := p.Last, p.Before; last != nil {
		limit = int64(*last)
		op = "$lt"
		cursor = before
		return
	}
	return 0, "", nil, errors.New("neither first nor last are set")
}
