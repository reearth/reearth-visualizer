package mailer

import (
	"errors"
	"fmt"
	"net"
	"net/smtp"
	"strings"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

// NOTE: implemented but it does not work expectedly
type direct struct {
	from string
}

func NewDirect(from string) gateway.Mailer {
	if from == "" {
		from = "reearth@localhost:8080"
	}
	return &direct{from: from}
}

func (m *direct) SendMail(to []gateway.Contact, subject, plainContent, htmlContent string) error {
	emails, err := verifyEmails(to)
	if err != nil {
		return err
	}

	emailHosts, err := m.hosts(emails)
	if err != nil {
		return err
	}

	mxHosts, err := m.lookupHosts(emailHosts)
	if err != nil {
		return err
	}

	msg, err := m.message(emails, subject, plainContent, htmlContent)
	if err != nil {
		return err
	}

	for i, to := range emails {
		host := mxHosts[i]
		if err := m.send(to, host, msg); err != nil {
			return err
		}
	}

	logMail(to, subject)
	return nil
}

func (m *direct) message(emails []string, subject, plainContent, htmlContent string) ([]byte, error) {
	msg := &message{
		to:           emails,
		from:         m.from,
		subject:      subject,
		plainContent: plainContent,
		htmlContent:  htmlContent,
	}
	encodedMsg, err := msg.encodeMessage()
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}
	return encodedMsg, nil
}

func (*direct) hosts(addresses []string) ([]string, error) {
	res := make([]string, 0, len(addresses))
	for _, a := range addresses {
		s := strings.SplitAfterN(a, "@", 2)
		if len(s) != 2 {
			return nil, errors.New("invalid email address")
		}
		res = append(res, s[1])
	}
	return res, nil
}

func (*direct) lookupHosts(hosts []string) ([]string, error) {
	res := make([]string, 0, len(hosts))
	for _, h := range hosts {
		mxs, err := net.LookupMX(h)
		if err != nil {
			return nil, errors.New("invalid email address")
		}
		if len(mxs) == 0 {
			return nil, errors.New("invalid email address")
		}
		res = append(res, strings.TrimSuffix(mxs[0].Host, "."))
	}
	return res, nil
}

func (m *direct) send(to string, host string, msg []byte) error {
	c, err := smtp.Dial(fmt.Sprintf("%s:25", host))
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	if err := c.Mail(m.from); err != nil {
		return rerror.ErrInternalBy(err)
	}
	if err := c.Rcpt(to); err != nil {
		return rerror.ErrInternalBy(err)
	}
	wc, err := c.Data()
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	if _, err = wc.Write(msg); err != nil {
		return rerror.ErrInternalBy(err)
	}
	if err := wc.Close(); err != nil {
		return rerror.ErrInternalBy(err)
	}
	if err := c.Quit(); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}
