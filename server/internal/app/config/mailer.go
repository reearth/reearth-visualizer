package config

type SendGridConfig struct {
	Email string
	Name  string
	API   string
}

type SESConfig struct {
	Email string
	Name  string
}

type SMTPConfig struct {
	Host         string
	Port         string
	SMTPUsername string
	Email        string
	Password     string
}
