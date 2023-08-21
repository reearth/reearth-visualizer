package nlslayer

type Time struct {
	Property          *string
	Interval          *int
	UpdateClockOnLoad *bool
}

func (t *Time) SetProperty(property *string) {
	t.Property = property
}

func (t *Time) SetInterval(interval *int) {
	t.Interval = interval
}

func (t *Time) SetUpdateClockOnLoad(updateClockOnLoad *bool) {
	t.UpdateClockOnLoad = updateClockOnLoad
}

func (t *Time) Update(property *string, interval *int, updateClockOnLoad *bool) {
	t.Property = property
	t.Interval = interval
	t.UpdateClockOnLoad = updateClockOnLoad
}
