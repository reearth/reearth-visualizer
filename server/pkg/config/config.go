package config

import (
	"sort"

	"github.com/reearth/reearth/server/pkg/workspace"
)

type Config struct {
	Migration     int64
	Auth          *Auth
	DefaultPolicy *workspace.PolicyID
}

type Auth struct {
	Cert string
	Key  string
}

func (c *Config) NextMigrations(migrations []int64) []int64 {
	migrations2 := append([]int64{}, migrations...)
	sort.SliceStable(migrations2, func(i, j int) bool { return migrations2[i] < migrations2[j] })

	for i, m := range migrations2 {
		if len(migrations2) <= i {
			return nil
		}
		if c.Migration < m {
			return migrations2[i:]
		}
	}

	return nil
}
