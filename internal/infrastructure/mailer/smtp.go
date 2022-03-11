package mailer

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/mail"
	"net/smtp"
	"net/textproto"
	"strings"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
)

type smtpMailer struct {
	host     string
	port     string
	email    string
	username string
	password string
}

type message struct {
	to           []string
	from         string
	subject      string
	plainContent string
	htmlContent  string
}

func (m *message) encodeContent() (string, error) {
	buf := bytes.NewBuffer(nil)
	writer := multipart.NewWriter(buf)
	boundary := writer.Boundary()

	altBuffer, err := writer.CreatePart(textproto.MIMEHeader{"Content-Type": {"multipart/alternative; boundary=" + boundary}})
	if err != nil {
		return "", err
	}
	altWriter := multipart.NewWriter(altBuffer)
	err = altWriter.SetBoundary(boundary)
	if err != nil {
		return "", err
	}
	var content io.Writer
	content, err = altWriter.CreatePart(textproto.MIMEHeader{"Content-Type": {"text/plain"}})
	if err != nil {
		return "", err
	}

	_, err = content.Write([]byte(m.plainContent + "\r\n\r\n"))
	if err != nil {
		return "", err
	}
	content, err = altWriter.CreatePart(textproto.MIMEHeader{"Content-Type": {"text/html"}})
	if err != nil {
		return "", err
	}
	_, err = content.Write([]byte(m.htmlContent + "\r\n"))
	if err != nil {
		return "", err
	}
	_ = altWriter.Close()
	return buf.String(), nil
}

func (m *message) encodeMessage() ([]byte, error) {
	buf := bytes.NewBuffer(nil)
	buf.WriteString(fmt.Sprintf("Subject: %s\n", m.subject))
	buf.WriteString(fmt.Sprintf("From: %s\n", m.from))
	buf.WriteString(fmt.Sprintf("To: %s\n", strings.Join(m.to, ",")))
	content, err := m.encodeContent()
	if err != nil {
		return nil, err
	}
	buf.WriteString(content)

	return buf.Bytes(), nil
}

func NewWithSMTP(host, port, username, email, password string) gateway.Mailer {
	return &smtpMailer{
		host:     host,
		port:     port,
		username: username,
		email:    email,
		password: password,
	}
}

func (m *smtpMailer) SendMail(to []gateway.Contact, subject, plainContent, htmlContent string) error {
	emails := make([]string, 0, len(to))
	for _, c := range to {
		_, err := mail.ParseAddress(c.Email)
		if err != nil {
			return fmt.Errorf("invalid email %s", c.Email)
		}
		emails = append(emails, c.Email)
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
	return smtp.SendMail(m.host+":"+m.port, auth, m.email, emails, encodedMsg)
}
