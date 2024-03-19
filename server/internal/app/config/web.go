package config

import "encoding/json"

type JSON struct {
	Data any `pp:",omitempty"`
}

func (j *JSON) Decode(value string) error {
	if value == "" {
		return nil
	}
	return json.Unmarshal([]byte(value), &j.Data)
}
