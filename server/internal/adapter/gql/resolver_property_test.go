package gql

import (
	"testing"
)

func Test_actualValue(t *testing.T) {
	value := 300

	type args struct {
		value      interface{}
		overridden bool
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
				value:      value,
				overridden: true,
			},
			300,
			false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
		})
	}
}
