package gateway

type Mailer interface {
	SendMail(to, content string) error
}
