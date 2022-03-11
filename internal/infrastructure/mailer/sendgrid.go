package mailer

import (
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type sendgridMailer struct {
	api string
	// sender data
	name  string
	email string
}

func NewWithSendGrid(senderName, senderEmail, api string) gateway.Mailer {
	return &sendgridMailer{
		name:  senderName,
		email: senderEmail,
		api:   api,
	}
}

func (m *sendgridMailer) SendMail(to []gateway.Contact, subject, plainContent, htmlContent string) error {
	contact := to[0]
	sender := mail.NewEmail(m.name, m.email)
	receiver := mail.NewEmail(contact.Name, contact.Email)
	message := mail.NewSingleEmail(sender, subject, receiver, plainContent, htmlContent)
	client := sendgrid.NewSendClient(m.api)
	_, err := client.Send(message)
	return err
}
