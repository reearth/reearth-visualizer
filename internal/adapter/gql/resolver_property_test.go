package gql

import (
	"testing"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/stretchr/testify/assert"
)

func Test_actualValue(t *testing.T) {
	value := 300

	type args struct {
		datasetLoader DatasetDataLoader
		value         interface{}
		links         []*gqlmodel.PropertyFieldLink
		overridden    bool
	}
	var tests = []struct {
		name    string
		args    args
		want    interface{}
		wantErr bool
	}{
		{
			"Overridden value",
			args{
				datasetLoader: nil,
				value:         value,
				links:         nil,
				overridden:    true,
			},
			300,
			false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := actualValue(tt.args.datasetLoader, tt.args.value, tt.args.links, tt.args.overridden)
			if (err != nil) != tt.wantErr {
				t.Errorf("actualValue() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			temp := got.(*interface{})
			t2 := (*temp).(int)
			assert.Equal(t, tt.want, t2)
		})
	}
}
