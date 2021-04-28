package usecase

type PageInfo struct {
	totalCount      int
	startCursor     *Cursor
	endCursor       *Cursor
	hasNextPage     bool
	hasPreviousPage bool
}

func NewPageInfo(totalCount int, startCursor *Cursor, endCursor *Cursor, hasNextPage bool, hasPreviousPage bool) *PageInfo {
	var sc Cursor
	var ec Cursor
	if startCursor != nil {
		sc = *startCursor
	}
	if endCursor != nil {
		ec = *endCursor
	}

	return &PageInfo{
		totalCount:      totalCount,
		startCursor:     &sc,
		endCursor:       &ec,
		hasNextPage:     hasNextPage,
		hasPreviousPage: hasPreviousPage,
	}
}

func (p *PageInfo) TotalCount() int {
	if p == nil {
		return 0
	}
	return p.totalCount
}

func (p *PageInfo) StartCursor() *Cursor {
	if p == nil {
		return nil
	}
	return p.startCursor
}

func (p *PageInfo) EndCursor() *Cursor {
	if p == nil {
		return nil
	}
	return p.endCursor
}

func (p *PageInfo) HasNextPage() bool {
	if p == nil {
		return false
	}
	return p.hasNextPage
}

func (p *PageInfo) HasPreviousPage() bool {
	if p == nil {
		return false
	}
	return p.hasPreviousPage
}
