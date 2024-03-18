package config

import "github.com/reearth/reearth/server/pkg/policy"

type PolicyConfig struct {
	Default *policy.ID `pp:",omitempty"`
}
