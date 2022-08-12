package gateway

type Container struct {
	Authenticator  Authenticator
	Mailer         Mailer
	DataSource     DataSource
	PluginRegistry PluginRegistry
	File           File
	Google         Google
}
