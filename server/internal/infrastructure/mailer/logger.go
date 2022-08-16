package mailer

import (
	"fmt"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
)

const loggerSep = "======================="

type logger struct{}

func NewLogger() gateway.Mailer {
	return &logger{}
}

func (m *logger) SendMail(to []gateway.Contact, subject, plainContent, _ string) error {
	logMail(to, subject)
	fmt.Printf("%s\n%s\n%s\n", loggerSep, plainContent, loggerSep)
	return nil
}
