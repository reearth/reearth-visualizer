package mailer

import (
	"errors"
	"net/smtp"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
)

type smtpMailer struct {
	host     string
	port     string
	email    string
	username string
	password string
}

func NewSMTP(host, port, username, email, password string) gateway.Mailer {
	return &smtpMailer{
		host:     host,
		port:     port,
		username: username,
		email:    email,
		password: password,
	}
}

func (m *smtpMailer) SendMail(to []gateway.Contact, subject, plainContent, htmlContent string) error {
	emails, err := verifyEmails(to)
	if err != nil {
		return err
	}

	msg := &message{
		to:           emails,
		from:         m.email,
		subject:      subject,
		plainContent: plainContent,
		htmlContent:  htmlContent,
	}

	encodedMsg, err := msg.encodeMessage()
	if err != nil {
		return err
	}

	auth := smtp.PlainAuth("", m.username, m.password, m.host)
	if len(m.host) == 0 {
		return errors.New("invalid smtp url")
	}

	if err := smtp.SendMail(m.host+":"+m.port, auth, m.email, emails, encodedMsg); err != nil {
		return err
	}

	logMail(to, subject)
	return nil
}
