package property

import (
	"github.com/mitchellh/mapstructure"
)

var ValueTypeTimeline = ValueType("timeline")

type Timeline struct {
	CurrentTime *string `json:"currentTime" mapstructure:"currentTime"`
	StartTime   *string `json:"startTime" mapstructure:"startTime"`
	EndTime     *string `json:"endTime" mapstructure:"endTime"`
}

func (c *Timeline) Clone() *Timeline {
	if c == nil {
		return nil
	}
	return &Timeline{
		CurrentTime: c.CurrentTime,
		StartTime:   c.StartTime,
		EndTime:     c.EndTime,
	}
}

type typePropertyTimeline struct{}

func (*typePropertyTimeline) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(Timeline); ok {
		return v, true
	}

	if v, ok := i.(*Timeline); ok {
		if v != nil {
			return *v, true
		}
		return nil, false
	}

	v := Timeline{}
	if err := mapstructure.Decode(i, &v); err == nil {
		return v, true
	}
	return nil, false
}

func (*typePropertyTimeline) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*typePropertyTimeline) Validate(i interface{}) bool {
	_, ok := i.(Timeline)
	return ok
}

func (p *typePropertyTimeline) String(i interface{}) string {
	if !p.Validate(i) {
		return ""
	}
	return ""
	// Should be implemented if needed
	// return i.(Timeline).String()
}

func (p *typePropertyTimeline) JSONSchema() map[string]any {
	return map[string]any{
		"type":  "object",
		"title": "Timeline",
		"properties": map[string]any{
			"currentTime": map[string]any{
				"type": "string",
			},
			"startTime": map[string]any{
				"type": "number",
			},
			"endTime": map[string]any{
				"type": "number",
			},
		},
	}
}

func (v *Value) ValueTimeline() (vv Timeline, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.Value().(Timeline)
	return
}
