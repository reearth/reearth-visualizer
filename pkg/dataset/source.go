package dataset

// Source _
type Source string

// String implements Stringer
func (d Source) String() string {
	return string(d)
}
