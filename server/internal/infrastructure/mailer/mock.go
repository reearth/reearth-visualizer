package mailer

import (
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
)

type Mock struct {
	lock  sync.Mutex
	mails []Mail
}

type Mail struct {
	To           []gateway.Contact
	Subject      string
	PlainContent string
	HTMLContent  string
}

func NewMock() *Mock {
	return &Mock{}
}

func (m *Mock) SendMail(to []gateway.Contact, subject, text, html string) error {
	m.lock.Lock()
	defer m.lock.Unlock()
	m.mails = append(m.mails, Mail{
		To:           append([]gateway.Contact{}, to...),
		Subject:      subject,
		PlainContent: text,
		HTMLContent:  html,
	})
	return nil
}

func (m *Mock) Mails() []Mail {
	return append([]Mail{}, m.mails...)
}
