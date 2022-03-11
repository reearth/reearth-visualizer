package mailer

import (
	"testing"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

func TestNewWithSendGrid(t *testing.T) {
	type args struct {
		senderName  string
		senderEmail string
		api         string
	}
	tests := []struct {
		name string
		args args
		want gateway.Mailer
	}{
		{
			name: "should create a sendGrid mailer",
			args: args{
				senderName:  "test sender",
				senderEmail: "sender@test.com",
				api:         "TEST_API",
			},
			want: &sendgridMailer{
				api:   "TEST_API",
				name:  "test sender",
				email: "sender@test.com",
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			got := NewWithSendGrid(tc.args.senderName, tc.args.senderEmail, tc.args.api)
			assert.Equal(tt, tc.want, got)
		})
	}
}
