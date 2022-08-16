package google

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/pkg/file"
	"github.com/stretchr/testify/assert"
	"gopkg.in/h2non/gock.v1"
)

func Test_fetchCSV(t *testing.T) {
	t.Cleanup(func() {
		gock.EnableNetworking()
		gock.OffAll()
	})

	gock.DisableNetworking()

	type args struct {
		token     string
		fileId    string
		sheetName string
	}

	tests := []struct {
		name    string
		setup   func()
		args    args
		want    *file.File
		wantErr bool
	}{
		{
			name: "Invalid Token",
			setup: func() {
				gock.New("https://docs.google.com").
					Get("/spreadsheets/d/(.*)/gviz/tq").
					PathParam("d", "1bXBDUrOgYWdHzScMiLNHRUsmNC9SUV4VFOvpqrx0Yok").
					MatchParams(map[string]string{
						"tqx":   "out:csv",
						"sheet": "Dataset1",
					}).
					Reply(http.StatusUnauthorized)
			},
			args: args{
				token:     "xxxx",
				fileId:    "1bXBDUrOgYWdHzScMiLNHRUsmNC9SUV4VFOvpqrxxxxx",
				sheetName: "Dataset1",
			},
			wantErr: true,
		},
		{
			name: "Working scenario",
			setup: func() {
				gock.New("https://docs.google.com").
					Get("/spreadsheets/d/(.*)/gviz/tq").
					PathParam("d", "1bXBDUrOgYWdHzScMiLNHRUsmNC9SUV4VFOvpqrxxxxx").
					MatchParams(map[string]string{
						"tqx":   "out:csv",
						"sheet": "Dataset1",
					}).
					Reply(http.StatusOK).
					BodyString("lat,lng,hieght\n30,35,300\n30.1,35,400")
			},
			args: args{
				token:     "xxxx",
				fileId:    "1bXBDUrOgYWdHzScMiLNHRUsmNC9SUV4VFOvpqrxxxxx",
				sheetName: "Dataset1",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		tt := tt

		t.Run(tt.name, func(t *testing.T) {
			tt.setup()

			got, err := fetchCSV(tt.args.token, tt.args.fileId, tt.args.sheetName)
			if (err != nil) != tt.wantErr {
				t.Errorf("fetchCSV() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				assert.Nil(t, got)
				return
			}
			assert.NotNil(t, got)
		})
	}
}
