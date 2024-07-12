package builder

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEncoder_Result(t *testing.T) {
	tests := []struct {
		Name     string
		Target   *encoder
		Expected []*layerJSON
	}{
		{
			Name:     "nil encoder",
			Target:   nil,
			Expected: nil,
		},
		{
			Name: "success",
			Target: &encoder{
				res: &layerJSON{
					Children: []*layerJSON{
						{
							ID:          "xxx",
							PluginID:    nil,
							ExtensionID: nil,
							Name:        "aaa",
							Property:    nil,
							Infobox:     nil,
						},
					},
				},
			},
			Expected: []*layerJSON{
				{
					ID:          "xxx",
					PluginID:    nil,
					ExtensionID: nil,
					Name:        "aaa",
					Property:    nil,
					Infobox:     nil,
				},
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Target.Result()
			assert.Equal(t, tc.Expected, res)
		})
	}
}
