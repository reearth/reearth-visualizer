package gateway

type Contact struct {
	Email string
	Name  string
}

type Mailer interface {
	SendMail(toContacts []Contact, subject, plainContent, htmlContent string) error
}
