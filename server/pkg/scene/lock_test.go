package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLockMode_IsLocked(t *testing.T) {
	tests := []struct {
		Name     string
		LM       LockMode
		Expected bool
	}{
		{
			Name:     "unlocked free",
			LM:       LockModeFree,
			Expected: false,
		},
		{
			Name:     "unlocked pending",
			LM:       LockModePending,
			Expected: false,
		},
		{
			Name:     "locked",
			LM:       LockModePublishing,
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.LM.IsLocked()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestLockMode_Validate(t *testing.T) {
	tests := []struct {
		Name     string
		LM       LockMode
		Expected bool
	}{
		{
			Name:     "valid free",
			LM:       LockModeFree,
			Expected: true,
		},
		{
			Name:     "valid pending",
			LM:       LockModePending,
			Expected: true,
		},
		{
			Name:     "valid publishing",
			LM:       LockModePublishing,
			Expected: true,
		},
		{
			Name:     "valid upgrading",
			LM:       LockModePluginUpgrading,
			Expected: true,
		},
		{
			Name:     "valid syncing",
			LM:       LockModeDatasetSyncing,
			Expected: true,
		},
		{
			Name:     "invalid",
			LM:       "xxx",
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			_, res := tc.LM.Validate()
			assert.Equal(t, tc.Expected, res)
		})
	}
}
