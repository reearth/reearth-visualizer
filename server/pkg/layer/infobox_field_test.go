package layer

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/stretchr/testify/assert"
)

func TestInfoboxField_UpgradePlugin(t *testing.T) {
	type args struct {
		id plugin.ID
	}
	tests := []struct {
		name  string
		field *InfoboxField
		args  args
		want  plugin.ID
	}{
		{
			name: "normal",
			field: &InfoboxField{
				plugin: MustPluginID("hoge~0.1.0"),
			},
			args: args{
				id: MustPluginID("hoge~0.2.0"),
			},
			want: MustPluginID("hoge~0.2.0"),
		},
		{
			name: "different",
			field: &InfoboxField{
				plugin: MustPluginID("hoge~0.1.0"),
			},
			args: args{
				id: MustPluginID("xyz~0.2.0"),
			},
			want: MustPluginID("hoge~0.1.0"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.field.UpgradePlugin(tt.args.id)
			assert.Equal(t, tt.want, tt.field.plugin)
		})
	}
}
