package usecase

type Pagination struct {
	Before *Cursor
	After  *Cursor
	First  *int
	Last   *int
}

func NewPagination(first *int, last *int, before *Cursor, after *Cursor) *Pagination {
	// Relay-Style Cursor Pagination
	// ref: https://www.apollographql.com/docs/react/features/pagination/#relay-style-cursor-pagination
	return &Pagination{
		Before: before,
		After:  after,
		First:  first,
		Last:   last,
	}
}
